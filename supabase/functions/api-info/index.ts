import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// ─── Config ──────────────────────────────────────────────────────────────────

const PROBE_TIMEOUT_MS = 5_000;

// In-memory rate limit (best-effort; resets on cold start)
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const rateLimit = new Map<string, { count: number; resetAt: number }>();

// In-memory short cache to avoid hammering providers
const CACHE_TTL_MS = 30_000;
let cached: { at: number; payload: unknown } | null = null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

type ProviderStatus = {
  name: string;
  configured: boolean;
  available: boolean;
  status: "active" | "error" | "not_configured";
  latencyMs: number | null;
  error?: string;
  meta?: Record<string, unknown>;
};

function getClientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : "unknown";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (entry.count >= RATE_LIMIT_MAX) return true;
  entry.count++;
  return false;
}

async function timedFetch(
  url: string,
  init: RequestInit = {},
  timeoutMs = PROBE_TIMEOUT_MS,
): Promise<{ res: Response | null; latencyMs: number; error?: string }> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  const start = performance.now();
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return { res, latencyMs: Math.round(performance.now() - start) };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    const error = (err as Error).name === "AbortError" ? "Request timed out" : (err as Error).message;
    return { res: null, latencyMs, error };
  } finally {
    clearTimeout(id);
  }
}

function notConfigured(name: string): ProviderStatus {
  return {
    name,
    configured: false,
    available: false,
    status: "not_configured",
    latencyMs: null,
    error: "API key not configured",
  };
}

// ─── Probes (run in parallel) ────────────────────────────────────────────────

async function probeGoogleAI(key: string | undefined): Promise<ProviderStatus> {
  const name = "Google Gemini";
  if (!key) return notConfigured(name);

  const { res, latencyMs, error } = await timedFetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
  );

  if (error || !res) {
    return { name, configured: true, available: false, status: "error", latencyMs, error: error ?? "Unknown error" };
  }
  if (!res.ok) {
    return {
      name,
      configured: true,
      available: false,
      status: "error",
      latencyMs,
      error: `HTTP ${res.status}`,
    };
  }
  let modelCount: number | undefined;
  try {
    const data = await res.json();
    modelCount = Array.isArray(data?.models) ? data.models.length : undefined;
  } catch { /* ignore */ }
  return {
    name,
    configured: true,
    available: true,
    status: "active",
    latencyMs,
    meta: modelCount !== undefined ? { models: modelCount } : undefined,
  };
}

async function probeOpenRouter(key: string | undefined): Promise<ProviderStatus> {
  const name = "OpenRouter";
  if (!key) return notConfigured(name);

  const { res, latencyMs, error } = await timedFetch("https://openrouter.ai/api/v1/auth/key", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${key}`,
      "HTTP-Referer": "https://lovable.ai",
      "X-Title": "Caritas",
    },
  });

  if (error || !res) {
    return { name, configured: true, available: false, status: "error", latencyMs, error: error ?? "Unknown error" };
  }
  if (!res.ok) {
    return { name, configured: true, available: false, status: "error", latencyMs, error: `HTTP ${res.status}` };
  }
  let meta: Record<string, unknown> | undefined;
  try {
    const json = await res.json();
    const d = json?.data ?? {};
    meta = {
      label: d.label,
      usage: d.usage,
      limit: d.limit,
      isFreeTier: d.is_free_tier,
      rateLimit: d.rate_limit,
    };
  } catch { /* ignore */ }
  return { name, configured: true, available: true, status: "active", latencyMs, meta };
}

async function probeSerper(key: string | undefined): Promise<ProviderStatus> {
  const name = "Serper Search";
  if (!key) return notConfigured(name);

  // HEAD-style minimal probe — single result for the lightest possible call
  const { res, latencyMs, error } = await timedFetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": key, "Content-Type": "application/json" },
    body: JSON.stringify({ q: "ping", num: 1 }),
  });

  if (error || !res) {
    return { name, configured: true, available: false, status: "error", latencyMs, error: error ?? "Unknown error" };
  }
  if (!res.ok) {
    return { name, configured: true, available: false, status: "error", latencyMs, error: `HTTP ${res.status}` };
  }
  return { name, configured: true, available: true, status: "active", latencyMs };
}

// ─── Handler ─────────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const clientKey = getClientKey(req);
  if (isRateLimited(clientKey)) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Try again in an hour." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "3600" } },
    );
  }

  // Allow ?fresh=1 to bypass cache
  const url = new URL(req.url);
  const bypassCache = url.searchParams.get("fresh") === "1";

  if (!bypassCache && cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return new Response(JSON.stringify({ ...(cached.payload as object), cached: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const t0 = performance.now();
  const [googleAI, openRouter, serperAI] = await Promise.all([
    probeGoogleAI(Deno.env.get("GOOGLE_AI_KEY")),
    probeOpenRouter(Deno.env.get("OPENROUTER_KEY")),
    probeSerper(Deno.env.get("SERPER_API_KEY")),
  ]);
  const totalMs = Math.round(performance.now() - t0);

  const providers = { googleAI, openRouter, serperAI };
  const summary = {
    healthy: Object.values(providers).filter((p) => p.available).length,
    total: Object.keys(providers).length,
    degraded: Object.values(providers).some((p) => p.configured && !p.available),
  };

  const payload = {
    timestamp: new Date().toISOString(),
    responseTimeMs: totalMs,
    summary,
    providers,
    cached: false,
  };

  cached = { at: Date.now(), payload };

  return new Response(JSON.stringify(payload), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
