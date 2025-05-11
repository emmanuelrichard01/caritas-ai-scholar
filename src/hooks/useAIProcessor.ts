
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
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ query }),
            // Add timeout to the fetch request
            signal: AbortSignal.timeout(30000) // 30 second timeout
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
            console.error("Unexpected response format:", text.substring(0, 150) + "...");
            
            // Use a fallback response through Supabase function
            console.log("Attempting fallback with Supabase function");
            return await processFallback(query, category, additionalData, user.id);
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
          return await processFallback(query, category, additionalData, user.id);
        }
      } else {
        // For complex queries that require context, use process-ai-query
        return await processFallback(query, category, additionalData, user.id);
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

  /**
   * Fallback process using Supabase function
   */
  const processFallback = async (query: string, category: AICategory, additionalData: any, userId: string) => {
    try {
      console.log('Using fallback process-ai-query for:', category);
      
      // Set a timeout for the function invocation
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Function timed out after 30 seconds')), 30000)
      );
      
      // Invoke the function with a race against the timeout
      const functionPromise = supabase.functions.invoke('process-ai-query', {
        body: {
          query,
          userId,
          category,
          additionalData,
          provider: category === 'google-ai' ? 'google' : (category === 'openrouter' ? 'openrouter' : 'default')
        }
      });
      
      // Race between the function call and the timeout
      const { data, error } = await Promise.race([functionPromise, timeoutPromise]) as any;
      
      if (error) {
        throw new Error(`Supabase function error: ${error.message}`);
      }
      
      if (!data || !data.answer) {
        throw new Error("Invalid response format from AI service");
      }
      
      setResult(data.answer);
      options?.onSuccess?.(data);
      
      // Save to history
      await saveToHistory(userId, query, data.answer, category);
      
      return data.answer;
    } catch (error) {
      console.error('Error with fallback processing:', error);
      
      // Provide a more user-friendly message for timeouts
      if (error instanceof Error && error.message.includes('timed out')) {
        toast.error('The AI service is taking too long to respond. Please try again later.');
        return "The AI service is currently experiencing high demand. Please try your query again in a few minutes.";
      }
      
      throw new Error(`Error processing ${category} query: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return {
    processQuery,
    isProcessing,
    result
  };
}
