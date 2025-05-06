
import { useApiStatus } from "@/hooks/useApiStatus";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function APIInfoDisplay() {
  const { apiStatus, isLoading, error, refreshStatus, isRefreshing } = useApiStatus();
  
  if (isLoading) {
    return (
      <Card className="p-2 bg-white/80 backdrop-blur dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Loading API status...
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={refreshStatus}
            disabled={isRefreshing || isLoading}
          >
            <RefreshCw className="h-3 w-3 animate-spin" />
          </Button>
        </div>
      </Card>
    );
  }

  if (error || !apiStatus) {
    return (
      <Card className="p-2 bg-white/80 backdrop-blur dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="h-3 w-3 text-amber-500 mr-1" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              API status unavailable
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={refreshStatus}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="p-2 bg-white/80 backdrop-blur dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            AI Services Status
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={refreshStatus}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {apiStatus.googleAI.available ? (
                <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Google AI
              </span>
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-slate-500 dark:text-slate-500 cursor-help">
                  {apiStatus.googleAI.available 
                    ? apiStatus.googleAI.status || "Available"
                    : "Unavailable"}
                </span>
              </TooltipTrigger>
              <TooltipContent side="left">
                <div className="text-xs">
                  {apiStatus.googleAI.available ? (
                    <>
                      <p>Daily Limit: {apiStatus.googleAI.dailyLimit || "~6000 requests"}</p>
                      <p className="text-green-500">Status: Available</p>
                    </>
                  ) : (
                    <>
                      <p className="text-red-500">Error: {apiStatus.googleAI.error || "Unknown issue"}</p>
                    </>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {apiStatus.openRouter.available ? (
                <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <XCircle className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className="text-xs text-slate-600 dark:text-slate-400">
                OpenRouter
              </span>
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-slate-500 dark:text-slate-500 cursor-help">
                  {apiStatus.openRouter.available && apiStatus.openRouter.creditsRemaining
                    ? `Credits: ${apiStatus.openRouter.creditsRemaining.toFixed(2)}`
                    : "Unavailable"}
                </span>
              </TooltipTrigger>
              <TooltipContent side="left">
                <div className="text-xs">
                  {apiStatus.openRouter.available ? (
                    <>
                      <p>Credits Remaining: {apiStatus.openRouter.creditsRemaining?.toFixed(2) || "Unknown"}</p>
                      <p>Credits Granted: {apiStatus.openRouter.creditsGranted?.toFixed(2) || "Unknown"}</p>
                      <p>Rate Limit: {apiStatus.openRouter.rateLimit || "Unknown"}</p>
                      <p>Remaining: {apiStatus.openRouter.rateLimitRemaining || "Unknown"}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-red-500">Error: {apiStatus.openRouter.error || "Unknown issue"}</p>
                    </>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </Card>
    </TooltipProvider>
  );
}
