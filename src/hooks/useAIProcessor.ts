
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { AICategory, AIProcessorOptions } from '@/types/ai';
import { saveToHistory } from '@/utils/aiUtils';

// Use 'export type' for re-exporting types when isolatedModules is enabled
export type { AIProcessorOptions } from '@/types/ai';
export type { AICategory } from '@/types/ai';

export function useAIProcessor(options?: AIProcessorOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { user } = useAuth();

  /**
   * Process AI query
   */
  const processQuery = async (query: string, category: AICategory = 'google-ai', additionalData?: any) => {
    if (!query.trim()) {
      toast.error("Please enter a query");
      return null;
    }

    if (!user) {
      toast.error("You must be logged in to use this feature");
      return null;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      let response;

      // For simple queries, use the process-chat endpoint
      const simpleCategories = ['default', 'google-ai', 'openrouter'];
      if (simpleCategories.includes(category as any)) {
        response = await fetch('/api/process-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query })
        });
      } else {
        // For complex queries that require context, use process-ai-query
        response = await supabase.functions.invoke('process-ai-query', {
          body: {
            query,
            userId: user.id,
            category,
            additionalData,
            provider: category === 'google-ai' ? 'google' : (category === 'openrouter' ? 'openrouter' : 'default')
          }
        });
      }

      if (!response) {
        throw new Error("No response received from server");
      }
      
      let data;
      
      if (response instanceof Response) {
        // Check if the response is JSON by examining content type
        const contentType = response.headers.get("content-type");
        
        try {
          if (contentType && contentType.includes("application/json")) {
            data = await response.json();
          } else {
            // Try to parse as JSON anyway, but with error handling
            const text = await response.text();
            
            // Debug what we received
            if (text.startsWith("<!DOCTYPE html>") || text.startsWith("<html>")) {
              console.error("Received HTML response instead of JSON:", text.substring(0, 100) + "...");
              throw new Error("Server returned HTML instead of JSON. The API endpoint might be misconfigured.");
            }
            
            try {
              data = JSON.parse(text);
            } catch (e) {
              console.error("Failed to parse response as JSON:", text.substring(0, 100) + "...");
              throw new Error(`Unexpected response format: ${text.substring(0, 100)}...`);
            }
          }
          
          // Check if response was not okay (status code not in 200-299)
          if (!response.ok) {
            throw new Error(`API returned error status: ${response.status} ${response.statusText}`);
          }
        } catch (e) {
          console.error("Error processing response:", e);
          throw e;
        }
      } else {
        data = response.data;
      }
      
      if (!data || !data.answer) {
        console.error("Invalid response structure:", data);
        throw new Error("Invalid response format from AI service");
      }
      
      // Save response in state and call success callback
      setResult(data.answer);
      options?.onSuccess?.(data);
      
      // Save to history
      await saveToHistory(user.id, query, data.answer, category);
      
      return data.answer;
    } catch (error) {
      console.error('Error processing AI query:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process your query';
      toast.error(errorMessage);
      options?.onError?.(error instanceof Error ? error : new Error(String(error)));
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processQuery,
    isProcessing,
    result
  };
}
