import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProviderStatusValue = "active" | "error" | "not_configured";

export interface ProviderStatus {
  name: string;
  configured: boolean;
  available: boolean;
  status: ProviderStatusValue;
  latencyMs: number | null;
  error?: string;
  meta?: Record<string, unknown>;
}

export interface ApiStatusPayload {
  timestamp: string;
  responseTimeMs: number;
  summary: { healthy: number; total: number; degraded: boolean };
  providers: {
    googleAI: ProviderStatus;
    openRouter: ProviderStatus;
    serperAI: ProviderStatus;
  };
  cached: boolean;
}

const fallback: ApiStatusPayload = {
  timestamp: new Date().toISOString(),
  responseTimeMs: 0,
  summary: { healthy: 0, total: 3, degraded: true },
  providers: {
    googleAI: { name: "Google Gemini", configured: false, available: false, status: "not_configured", latencyMs: null },
    openRouter: { name: "OpenRouter", configured: false, available: false, status: "not_configured", latencyMs: null },
    serperAI: { name: "Serper Search", configured: false, available: false, status: "not_configured", latencyMs: null },
  },
  cached: false,
};

export function useApiStatus() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<ApiStatusPayload>({
    queryKey: ["api-status"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("api-info");
      if (error || !data) {
        console.error("api-info error:", error);
        return fallback;
      }
      return data as ApiStatusPayload;
    },
    retry: 1,
    staleTime: 30_000,
  });

  const refreshStatus = async () => {
    setIsRefreshing(true);
    try {
      // Force-bypass server cache via direct fetch with ?fresh=1
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      if (projectId) {
        await fetch(`https://${projectId}.supabase.co/functions/v1/api-info?fresh=1`, {
          headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        }).catch(() => {});
      }
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    apiStatus: data ?? fallback,
    isLoading,
    error,
    refreshStatus,
    isRefreshing,
  };
}
