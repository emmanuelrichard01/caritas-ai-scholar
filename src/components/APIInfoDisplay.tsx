
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface APIInfoDisplayProps {
  onClose: () => void;
}

interface APIUsage {
  googleAI: { used: number; limit: number };
  openai: { used: number; limit: number };
}

interface APIInfo {
  status: string;
  usage: APIUsage;
  resetTime: string;
}

export const APIInfoDisplay = ({ onClose }: APIInfoDisplayProps) => {
  const [apiInfo, setApiInfo] = useState<APIInfo>({
    status: "loading",
    usage: {
      googleAI: { used: 0, limit: 60 },
      openai: { used: 0, limit: 100 }
    },
    resetTime: ""
  });
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAPIInfo = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('api-info');
        
        if (error) {
          throw new Error(error.message || 'Failed to fetch API info');
        }
        
        if (!data) {
          throw new Error('No data received from API');
        }
        
        // Check if data has expected structure
        if (!data.googleAI || typeof data.googleAI !== 'object') {
          console.warn('API response missing googleAI data, using default values');
          data.googleAI = { available: false, error: 'Data unavailable' };
        }
        
        // Use fallback data for usage info
        const usageData = {
          googleAI: {
            used: Number(data.googleAI?.used || 0),
            limit: Number(data.googleAI?.limit || 60)
          },
          openai: {
            used: Number(data.openai?.used || 0),
            limit: Number(data.openai?.limit || 100)
          }
        };
        
        setApiInfo({
          status: "active",
          usage: usageData,
          resetTime: data.resetTime || "24 hours"
        });
        
        setError(null);
      } catch (error) {
        console.error("Error fetching API info:", error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        
        // Set fallback data on error with numeric types
        setApiInfo({
          status: "unknown",
          usage: {
            googleAI: { used: 0, limit: 60 },
            openai: { used: 0, limit: 100 }
          },
          resetTime: "24 hours"
        });
      }
    };

    fetchAPIInfo();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <h2 className="text-xl font-bold mb-4">AI API Status</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
            <p className="text-sm">Error: {error}</p>
            <p className="text-xs mt-1">Using default values. Some information may be inaccurate.</p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-medium text-sm">Google Gemini API</h3>
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 py-0.5 px-2 rounded-full">
                {apiInfo.status === "loading" ? "Checking..." : "Active"}
              </span>
            </div>
            
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
              <div 
                className="h-full bg-caritas transition-all duration-500" 
                style={{ width: `${(apiInfo.usage.googleAI.used / apiInfo.usage.googleAI.limit) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs mt-1">
              <span className="text-muted-foreground">
                {apiInfo.usage.googleAI.used} / {apiInfo.usage.googleAI.limit} requests used
              </span>
              <span className="text-muted-foreground">
                Resets in {apiInfo.resetTime}
              </span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-medium text-sm">OpenAI GPT API</h3>
              <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 py-0.5 px-2 rounded-full">
                {apiInfo.status === "loading" ? "Checking..." : "Active"}
              </span>
            </div>
            
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-500" 
                style={{ width: `${(apiInfo.usage.openai.used / apiInfo.usage.openai.limit) * 100}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs mt-1">
              <span className="text-muted-foreground">
                {apiInfo.usage.openai.used} / {apiInfo.usage.openai.limit} requests used
              </span>
              <span className="text-muted-foreground">
                Resets in {apiInfo.resetTime}
              </span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-900 p-3 rounded-md mt-4">
            Rate limits are in place to ensure fair usage and prevent abuse. If you need higher limits for a specific project,
            please contact support.
          </p>
        </div>
      </div>
    </div>
  );
};
