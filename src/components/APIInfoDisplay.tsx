
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle, Check, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface APIInfo {
  openRouter: {
    available: boolean;
    rateLimit?: string;
    rateLimitRemaining?: string;
    creditsGranted?: number;
    creditsUsed?: number;
    creditsRemaining?: number;
    error?: string;
  };
  googleAI: {
    available: boolean;
    dailyLimit?: string;
    remainingRequests?: string;
    status?: string;
    error?: string;
  };
}

export const APIInfoDisplay = () => {
  const [apiInfo, setApiInfo] = useState<APIInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAPIInfo = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('api-info');
      
      if (error) throw new Error(error.message);
      
      setApiInfo(data as APIInfo);
    } catch (err) {
      console.error('Error fetching API info:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch API information');
      toast({
        title: "Error fetching API information",
        description: err instanceof Error ? err.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAPIInfo();
  }, []);
  
  if (isLoading) {
    return (
      <Card className="p-4 flex flex-col items-center justify-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-caritas mb-2" />
        <p className="text-sm text-muted-foreground">Loading API information...</p>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <div className="flex items-center mb-2">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <h3 className="font-medium">Error Loading API Information</h3>
        </div>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchAPIInfo} 
          className="mt-3"
        >
          Retry
        </Button>
      </Card>
    );
  }
  
  return (
    <Card className="p-4 divide-y divide-gray-200 dark:divide-gray-700">
      <div className="pb-4">
        <div className="flex items-center mb-2">
          <h3 className="font-medium text-lg">API Status & Limits</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 ml-2" 
            onClick={fetchAPIInfo}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mb-2">
          Current limits and usage for connected AI services
        </p>
      </div>
      
      {/* OpenRouter Section */}
      <div className="py-3">
        <div className="flex items-center mb-2">
          <h4 className="font-medium">OpenRouter</h4>
          {apiInfo?.openRouter.available ? (
            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full dark:bg-green-900/30 dark:text-green-400">
              Available
            </span>
          ) : (
            <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full dark:bg-red-900/30 dark:text-red-400">
              Unavailable
            </span>
          )}
        </div>
        
        {apiInfo?.openRouter.available ? (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="text-sm">
              <span className="text-muted-foreground">Credits:</span>
              <br />
              <span className="font-medium">
                {apiInfo.openRouter.creditsRemaining} / {apiInfo.openRouter.creditsGranted} remaining
              </span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Rate Limit:</span>
              <br />
              <span className="font-medium">
                {apiInfo.openRouter.rateLimitRemaining} / {apiInfo.openRouter.rateLimit}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-red-600 dark:text-red-400">
            {apiInfo?.openRouter.error || "Could not connect to OpenRouter API"}
          </p>
        )}
      </div>
      
      {/* Google AI Section */}
      <div className="py-3">
        <div className="flex items-center mb-2">
          <h4 className="font-medium">Google AI Studio</h4>
          {apiInfo?.googleAI.available ? (
            <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full dark:bg-green-900/30 dark:text-green-400">
              Configured
            </span>
          ) : (
            <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full dark:bg-red-900/30 dark:text-red-400">
              Unavailable
            </span>
          )}
        </div>
        
        {apiInfo?.googleAI.available ? (
          <div className="grid grid-cols-1 gap-1">
            <div className="text-sm">
              <span className="text-muted-foreground">Daily Limit:</span>{" "}
              <span>{apiInfo.googleAI.dailyLimit}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Status:</span>{" "}
              <span>{apiInfo.googleAI.status}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-red-600 dark:text-red-400">
            {apiInfo?.googleAI.error || "Could not connect to Google AI API"}
          </p>
        )}
      </div>
    </Card>
  );
};
