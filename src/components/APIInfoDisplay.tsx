import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  RefreshCw,
  CheckCircle2,
  XCircle,
  CircleDashed,
  Activity,
  Zap,
} from "lucide-react";
import { useApiStatus, type ProviderStatus } from "@/hooks/useApiStatus";
import { formatDistanceToNow } from "date-fns";

interface APIInfoDisplayProps {
  onClose: () => void;
}

const PURPOSE: Record<string, string> = {
  "Google Gemini": "Primary model for chat, summaries & study tools",
  OpenRouter: "Fallback model router for resilience",
  "Serper Search": "Web & academic search for research",
};

function StatusDot({ p }: { p: ProviderStatus }) {
  if (p.status === "active") {
    return (
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
    );
  }
  if (p.status === "error") return <span className="h-2 w-2 rounded-full bg-red-500" />;
  return <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />;
}

function StatusIcon({ p }: { p: ProviderStatus }) {
  if (p.status === "active") return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  if (p.status === "error") return <XCircle className="h-4 w-4 text-red-500" />;
  return <CircleDashed className="h-4 w-4 text-muted-foreground" />;
}

function latencyTone(ms: number | null) {
  if (ms == null) return "text-muted-foreground";
  if (ms < 400) return "text-emerald-600 dark:text-emerald-400";
  if (ms < 1200) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function ProviderCard({ p }: { p: ProviderStatus }) {
  return (
    <div className="group rounded-2xl border border-border/60 bg-foreground/[0.02] p-4 transition-all hover:bg-foreground/[0.04]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <StatusDot p={p} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-tight truncate">{p.name}</h3>
              <StatusIcon p={p} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {PURPOSE[p.name] ?? "External service"}
            </p>
          </div>
        </div>
        {p.latencyMs !== null && (
          <Badge variant="outline" className={`gap-1 font-mono text-[10px] ${latencyTone(p.latencyMs)}`}>
            <Zap className="h-3 w-3" />
            {p.latencyMs}ms
          </Badge>
        )}
      </div>

      {p.error && (
        <div className="mt-3 rounded-md bg-red-500/5 border border-red-500/20 px-2.5 py-1.5">
          <p className="text-[11px] text-red-600 dark:text-red-400">{p.error}</p>
        </div>
      )}

      {p.meta && Object.values(p.meta).some((v) => v !== undefined && v !== null) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {Object.entries(p.meta).map(([k, v]) => {
            if (v === undefined || v === null || typeof v === "object") return null;
            return (
              <span
                key={k}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-foreground/[0.04] text-muted-foreground"
              >
                {k}: {String(v)}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export const APIInfoDisplay = ({ onClose }: APIInfoDisplayProps) => {
  const { apiStatus, isLoading, refreshStatus, isRefreshing } = useApiStatus();
  const providers = Object.values(apiStatus.providers);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-border/60 bg-background/95 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/40">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-foreground/[0.04] flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight">System status</h2>
              <p className="text-xs text-muted-foreground">
                {apiStatus.summary.healthy}/{apiStatus.summary.total} services operational
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshStatus}
              disabled={isRefreshing || isLoading}
              className="h-8 gap-1.5 text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-2.5 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <>
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-foreground/[0.03] animate-pulse" />
              ))}
            </>
          ) : (
            providers.map((p) => <ProviderCard key={p.name} p={p} />)
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border/40 text-[11px] text-muted-foreground">
          <span>
            Checked {formatDistanceToNow(new Date(apiStatus.timestamp), { addSuffix: true })}
            {apiStatus.cached && " · cached"}
          </span>
          <span className="font-mono">{apiStatus.responseTimeMs}ms</span>
        </div>
      </div>
    </div>
  );
};
