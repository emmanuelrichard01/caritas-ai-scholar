
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { AICategory, AIProcessorOptions } from '@/types/ai';
import { saveToHistory } from '@/utils/aiUtils';

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
      console.log(`Processing query with category: ${category}`);
      
      // Always use the process-ai-query function with better error handling
      const { data, error } = await supabase.functions.invoke('process-ai-query', {
        body: {
          query,
          userId: user.id,
          category,
          additionalData,
          provider: category === 'openrouter' ? 'openrouter' : 'google'
        }
      });
      
      if (error) {
        console.error(`Supabase function error for ${category}:`, error);
        throw new Error(`AI service error: ${error.message}`);
      }
      
      if (!data || !data.answer) {
        console.error('Invalid response format:', data);
        throw new Error("Invalid response format from AI service");
      }
      
      console.log(`Successfully processed ${category} query`);
      setResult(data.answer);
      options?.onSuccess?.(data);
      
      // Save to history
      await saveToHistory(user.id, query, data.answer, category);
      
      return data.answer;
    } catch (error) {
      console.error(`Error processing ${category} query:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process your query';
      
      // Set a fallback result for better UX
      const fallbackMessage = `I'm currently experiencing technical difficulties. Please try again in a moment.`;
      setResult(fallbackMessage);
      
      toast.error(errorMessage);
      options?.onError?.(error instanceof Error ? error : new Error(String(error)));
      return fallbackMessage;
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
