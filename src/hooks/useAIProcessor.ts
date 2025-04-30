
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

  const processQuery = async (query: string, category: AICategory = 'default', additionalData?: any) => {
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
      // Call the Supabase Edge Function to process the query with the specific category context
      const { data, error } = await supabase.functions.invoke('process-ai-query', {
        body: {
          query,
          userId: user.id,
          category,
          additionalData
        }
      });

      if (error) throw new Error(error.message);

      // Save response in state and call success callback
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

  // Process documents function - updated to ensure user ID is in the file path
  const processDocuments = async (files: File[], query: string) => {
    if (!user) {
      toast.error("You must be logged in to use this feature");
      return null;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      // First, upload files to storage with user ID as the first folder segment
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        // Ensure the user ID is the first folder segment in the path
        const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('course-materials')
          .upload(filePath, file);

        if (uploadError) throw new Error(`Error uploading ${file.name}: ${uploadError.message}`);
        
        return {
          filename: file.name,
          filePath,
          contentType: file.type
        };
      });
      
      const uploadedFiles = await Promise.all(uploadPromises);
      
      // Then process them via the edge function
      const { data, error } = await supabase.functions.invoke('process-ai-query', {
        body: {
          query,
          userId: user.id,
          category: 'course-tutor',
          additionalData: {
            files: uploadedFiles
          }
        }
      });

      if (error) throw new Error(error.message);
      
      setResult(data.answer);
      options?.onSuccess?.(data);
      return data.answer;
    } catch (error) {
      console.error('Error processing documents:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze documents';
      toast.error(errorMessage);
      options?.onError?.(error instanceof Error ? error : new Error(String(error)));
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processQuery,
    processDocuments,
    isProcessing,
    result
  };
}
