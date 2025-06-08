
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
      // Get current session for auth
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("Please log in again - session expired");
      }

      // Process each file
      const processResults = await Promise.all(
        files.map(async (file) => {
          try {
            // Create form data for upload
            const formData = new FormData();
            formData.append('title', file.name);
            formData.append('description', prompt || 'Study material processing');
            formData.append('file', file);
            
            // First upload the material using the upload function
            const uploadResponse = await fetch(`https://yvlrspteukuooobkvzdz.supabase.co/functions/v1/upload-course-material`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: formData
            });
            
            const uploadData = await uploadResponse.json();
            
            if (!uploadResponse.ok || !uploadData?.success) {
              throw new Error(uploadData?.error || `Upload failed with status ${uploadResponse.status}`);
            }

            // Return the result from processing
            return uploadData.message || `Processed ${file.name}`;
          } catch (fileError) {
            console.error(`Error processing file ${file.name}:`, fileError);
            throw fileError;
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
