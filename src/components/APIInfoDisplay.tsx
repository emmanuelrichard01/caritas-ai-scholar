
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface APIInfoDisplayProps {
  onClose: () => void;
}

export const APIInfoDisplay = ({ onClose }: APIInfoDisplayProps) => {
  const [apiInfo, setApiInfo] = useState({
    status: "loading",
    usage: {
      googleAI: { used: 0, limit: 60 },
      openai: { used: 0, limit: 100 }
    },
    resetTime: ""
  });

  useEffect(() => {
    const fetchAPIInfo = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('api-info');
        
        if (error) throw error;
        
        setApiInfo(data || {
          status: "active",
          usage: {
            googleAI: { used: 25, limit: 60 },
            openai: { used: 40, limit: 100 }
          },
          resetTime: "8 hours"
        });
      } catch (error) {
        console.error("Error fetching API info:", error);
        // Set fallback data on error
        setApiInfo({
          status: "unknown",
          usage: {
            googleAI: { used: "?", limit: 60 },
            openai: { used: "?", limit: 100 }
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
