
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type AICategory = 'course-tutor' | 'study-planner' | 'assignment-helper' | 'research' | 'default';

interface UseAIProcessorOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useAIProcessor(options?: UseAIProcessorOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { user } = useAuth();

  const processQuery = async (query: string, category: AICategory = 'default') => {
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
      // Call the Supabase Edge Function to process the query
      const { data, error } = await supabase.functions.invoke('process-ai-query', {
        body: {
          query,
          userId: user.id,
          category
        }
      });

      if (error) throw new Error(error.message);

      setResult(data.answer);
      options?.onSuccess?.(data);
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
