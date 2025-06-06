
import { Button } from "@/components/ui/button";
import { X, RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useApiStatus } from "@/hooks/useApiStatus";

interface APIInfoDisplayProps {
  onClose: () => void;
}

export const APIInfoDisplay = ({ onClose }: APIInfoDisplayProps) => {
  const { apiStatus, isLoading, refreshStatus, isRefreshing } = useApiStatus();

  const getStatusIcon = (available: boolean, error?: string) => {
    if (error) return <XCircle className="h-4 w-4 text-red-500" />;
    if (available) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusText = (available: boolean, error?: string) => {
    if (error) return "Error";
    if (available) return "Active";
    return "Inactive";
  };

  const getStatusColor = (available: boolean, error?: string) => {
    if (error) return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
    if (available) return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20";
    return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20";
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">API Status</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshStatus}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Google Gemini AI */}
            <div className="border rounded-lg p-4 dark:border-slate-700">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  {getStatusIcon(apiStatus?.googleAI?.available || false, apiStatus?.googleAI?.error)}
                  Google Gemini AI
                </h3>
                <span className={`text-xs py-1 px-2 rounded-full ${getStatusColor(apiStatus?.googleAI?.available || false, apiStatus?.googleAI?.error)}`}>
                  {getStatusText(apiStatus?.googleAI?.available || false, apiStatus?.googleAI?.error)}
                </span>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p><span className="font-medium">Status:</span> {apiStatus?.googleAI?.status || 'Unknown'}</p>
                {apiStatus?.googleAI?.dailyLimit && (
                  <p><span className="font-medium">Daily Limit:</span> {apiStatus.googleAI.dailyLimit}</p>
                )}
                {apiStatus?.googleAI?.error && (
                  <p className="text-red-500"><span className="font-medium">Error:</span> {apiStatus.googleAI.error}</p>
                )}
              </div>
            </div>

            {/* OpenRouter */}
            <div className="border rounded-lg p-4 dark:border-slate-700">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  {getStatusIcon(apiStatus?.openRouter?.available || false, apiStatus?.openRouter?.error)}
                  OpenRouter (Backup)
                </h3>
                <span className={`text-xs py-1 px-2 rounded-full ${getStatusColor(apiStatus?.openRouter?.available || false, apiStatus?.openRouter?.error)}`}>
                  {getStatusText(apiStatus?.openRouter?.available || false, apiStatus?.openRouter?.error)}
                </span>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                {apiStatus?.openRouter?.creditsRemaining && (
                  <p><span className="font-medium">Credits:</span> ${apiStatus.openRouter.creditsRemaining}</p>
                )}
                {apiStatus?.openRouter?.rateLimit && (
                  <p><span className="font-medium">Rate Limit:</span> {apiStatus.openRouter.rateLimit}</p>
                )}
                {apiStatus?.openRouter?.error && (
                  <p className="text-red-500"><span className="font-medium">Error:</span> {apiStatus.openRouter.error}</p>
                )}
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
              <p className="font-medium mb-1">About API Usage:</p>
              <p>• Google Gemini AI is the primary service for chat and research</p>
              <p>• OpenRouter provides backup AI capabilities when needed</p>
              <p>• Rate limits ensure fair usage across all users</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
