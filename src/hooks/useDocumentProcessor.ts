
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useDocumentProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { user } = useAuth();

  const processDocuments = async (files: File[], prompt: string): Promise<string | null> => {
    if (files.length === 0) {
      toast.error("Please upload at least one file");
      return null;
    }

    if (!user) {
      toast.error("You must be logged in to use this feature");
      return null;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      // Process each file
      const processResults = await Promise.all(
        files.map(async (file) => {
          try {
            // Create a storage path for the file
            const filePath = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            
            // Upload the file to storage
            const { error: uploadError } = await supabase.storage
              .from('course-materials')
              .upload(filePath, file);

            if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

            // Call the edge function to process the document
            const { data, error } = await supabase.functions.invoke('process-course-material', {
              body: {
                filePath,
                title: file.name,
                userId: user.id,
                prompt
              }
            });

            if (error) throw new Error(`Processing failed: ${error.message}`);

            return data?.result || `Processed ${file.name}`;
          } catch (fileError) {
            console.error(`Error processing file ${file.name}:`, fileError);
            return `Failed to process ${file.name}: ${fileError instanceof Error ? fileError.message : 'Unknown error'}`;
          }
        })
      );

      // Combine results
      const combinedResult = processResults.join("\n\n");
      setResult(combinedResult);
      return combinedResult;

    } catch (error) {
      console.error('Error processing documents:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process your documents';
      toast.error(errorMessage);
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
