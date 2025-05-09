
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
        try {
          console.log('Using simple process-chat endpoint for query:', query);
          response = await fetch('/api/process-chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
          });
          
          // Check for non-OK response early
          if (!response.ok) {
            console.error(`API returned error status: ${response.status} ${response.statusText}`);
            throw new Error(`API returned error status: ${response.status}`);
          }
          
          // Check content type to prevent trying to parse HTML as JSON
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            // Try to get some of the response to log what we received
            const text = await response.text();
            if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
              console.error("Received HTML response instead of JSON:", text.substring(0, 100) + "...");
              throw new Error("Server returned HTML instead of JSON. The API endpoint might be misconfigured.");
            } else {
              console.error("Unexpected response format:", text.substring(0, 100) + "...");
              throw new Error("Unexpected response format from server");
            }
          }
          
          // If we get here, we have a JSON response
          const data = await response.json();
          
          if (!data || !data.answer) {
            throw new Error("Invalid response format from AI service");
          }
          
          setResult(data.answer);
          options?.onSuccess?.(data);
          
          // Save to history
          await saveToHistory(user.id, query, data.answer, category);
          
          return data.answer;
        } catch (fetchError) {
          console.error("Error with simple query processing:", fetchError);
          // If the simple query processing fails, try the Supabase function
          toast.error("Simple chat processing failed, trying advanced processing...");
          
          response = await supabase.functions.invoke('process-ai-query', {
            body: {
              query,
              userId: user.id,
              category,
              additionalData,
              provider: category === 'google-ai' ? 'google' : (category === 'openrouter' ? 'openrouter' : 'default')
            }
          });
          
          const data = response.data;
          if (!data || !data.answer) {
            throw new Error("Invalid response format from fallback AI service");
          }
          
          setResult(data.answer);
          options?.onSuccess?.(data);
          
          // Save to history
          await saveToHistory(user.id, query, data.answer, category);
          
          return data.answer;
        }
      } else {
        // For complex queries that require context, use process-ai-query
        console.log('Using complex process-ai-query for:', category);
        
        try {
          response = await supabase.functions.invoke('process-ai-query', {
            body: {
              query,
              userId: user.id,
              category,
              additionalData,
              provider: category === 'google-ai' ? 'google' : (category === 'openrouter' ? 'openrouter' : 'default')
            }
          });
          
          const data = response.data;
          if (!data || !data.answer) {
            throw new Error("Invalid response format from AI service");
          }
          
          setResult(data.answer);
          options?.onSuccess?.(data);
          
          // Save to history
          await saveToHistory(user.id, query, data.answer, category);
          
          return data.answer;
        } catch (error) {
          console.error('Error with complex query processing:', error);
          throw new Error(`Error processing ${category} query: ${error.message || 'Unknown error'}`);
        }
      }
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
