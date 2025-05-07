
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export type AICategory = 'google-ai' | 'course-tutor' | 'study-planner' | 'assignment-helper' | 'research' | 'default' | 'openrouter';

interface UseAIProcessorOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useAIProcessor(options?: UseAIProcessorOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { user } = useAuth();

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
      if (category === 'default' || category === 'google-ai') {
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

      if (response.error) throw new Error(response.error.message);

      let data;
      if (response instanceof Response) {
        if (!response.ok) throw new Error("Failed to get AI response");
        data = await response.json();
      } else {
        data = response.data;
      }
      
      // Save response in state and call success callback
      setResult(data.answer);
      options?.onSuccess?.(data);
      
      // Save to history
      await saveToHistory(query, data.answer, category);
      
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

  // Process documents function with improved error handling and file management
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

    // Calculate total size of files for validation
    const totalSizeMB = files.reduce((sum, file) => sum + file.size / (1024 * 1024), 0);
    if (totalSizeMB > 20) { // 20MB limit
      toast.error("Total file size exceeds 20MB limit");
      setIsProcessing(false);
      return null;
    }

    try {
      // Validate file types
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                         'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain'];
      
      const invalidFiles = files.filter(file => !validTypes.includes(file.type));
      if (invalidFiles.length > 0) {
        toast.error(`Unsupported file format: ${invalidFiles[0].name}. Please use PDF, DOC, DOCX, PPT, PPTX or TXT files.`);
        setIsProcessing(false);
        return null;
      }

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

      if (error) throw new Error(error.message);
      
      const answer = data.answer;
      setResult(answer);
      options?.onSuccess?.(data);
      
      // Save to history
      await saveToHistory(query, answer, 'course-tutor', 
        `Analyzed ${files.length} document(s): ${files.map(f => f.name).join(', ')}`);
      
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

  // Helper function to save interactions to history
  const saveToHistory = async (query: string, answer: string, category: AICategory, metadata?: string) => {
    if (!user) return;
    
    try {
      const title = query.length > 50 ? `${query.substring(0, 47)}...` : query;
      const content = `Q: ${query}\n\nA: ${answer}${metadata ? `\n\nContext: ${metadata}` : ''}`;
      
      await supabase
        .from('chat_history')
        .insert({
          user_id: user.id,
          title,
          content,
          category
        });
    } catch (error) {
      console.error('Error saving to history:', error);
      // Non-blocking error - don't show to user as it's not critical
    }
  };

  return {
    processQuery,
    processDocuments,
    isProcessing,
    result
  };
}
