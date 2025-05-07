
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { AICategory, AIProcessorOptions } from '@/types/ai';
import { saveToHistory } from '@/utils/aiUtils';

export { AICategory } from '@/types/ai';
export type { AIProcessorOptions } from '@/types/ai';

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
      
      if (response instanceof Response && !response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get AI response: ${errorText}`);
      }
      
      if ('error' in response && response.error) {
        throw new Error(response.error.message || "An error occurred with the AI service");
      }
      
      let data;
      if (response instanceof Response) {
        // Check if the response is JSON
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          const text = await response.text();
          try {
            // Try to parse as JSON anyway
            data = JSON.parse(text);
          } catch (e) {
            throw new Error(`Unexpected response format: ${text.substring(0, 100)}...`);
          }
        }
      } else {
        data = response.data;
      }
      
      if (!data || !data.answer) {
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
