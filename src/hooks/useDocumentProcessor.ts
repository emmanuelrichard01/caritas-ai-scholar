
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { AIProcessorOptions } from '@/types/ai';
import { saveToHistory, validateFiles } from '@/utils/aiUtils';

export function useDocumentProcessor(options?: AIProcessorOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { user } = useAuth();

  /**
   * Process documents with AI analysis
   */
  const processDocuments = async (files: File[], query: string) => {
    if (!user) {
      toast.error("You must be logged in to use this feature");
      return null;
    }

    if (!query.trim()) {
      toast.error("Please enter a question about your documents");
      return null;
    }

    if (files.length === 0) {
      toast.error("Please upload at least one document");
      return null;
    }

    setIsProcessing(true);
    setResult(null);

    const validation = validateFiles(files);
    if (!validation.valid) {
      toast.error(validation.error);
      setIsProcessing(false);
      return null;
    }

    try {
      // Upload files to storage with user ID as the first folder segment
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        // Ensure the user ID is the first folder segment in the path
        const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 7);
        const filePath = `${user.id}/${uniqueId}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('course-materials')
          .upload(filePath, file);

        if (uploadError) throw new Error(`Error uploading ${file.name}: ${uploadError.message}`);
        
        return {
          filename: file.name,
          filePath,
          contentType: file.type,
          size: file.size
        };
      });
      
      toast.info(`Processing ${files.length} file(s)...`);
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

      if (error) throw new Error(error.message || "An error occurred with the document processing service");
      
      if (!data || !data.answer) {
        throw new Error("Invalid response format from document processing service");
      }
      
      const answer = data.answer;
      setResult(answer);
      options?.onSuccess?.(data);
      
      // Save to history
      await saveToHistory(
        user.id,
        query, 
        answer, 
        'course-tutor', 
        `Analyzed ${files.length} document(s): ${files.map(f => f.name).join(', ')}`
      );
      
      return answer;
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
    processDocuments,
    isProcessing,
    result
  };
}
