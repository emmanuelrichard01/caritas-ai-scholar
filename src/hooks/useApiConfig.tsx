
import { useState } from "react";
import { toast } from "sonner";

const OPENAI_API_KEY = "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";

export const useApiConfig = () => {
  const [apiKey] = useState(OPENAI_API_KEY);

  const getAiResponse = async (message: string) => {
    try {
      // Use the Vercel proxy for Supabase edge functions
      const response = await fetch('/api/process-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bHJzcHRldWt1b29vYmt2emR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NjQyNDAsImV4cCI6MjA2MTE0MDI0MH0.EdFXxTk2mOOJwxWugX_nj4wsxffy1lK_l1jljUk2-T0'
        },
        body: JSON.stringify({ query: message })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.answer || 'Sorry, I could not process your request at this time.';
    } catch (error) {
      console.error("Error in getAiResponse:", error);
      toast.error("Failed to get AI response");
      throw error;
    }
  };

  const analyzeDocuments = async (files: File[], query: string) => {
    try {
      if (!query.trim()) {
        toast.error("Please enter a question about your documents");
        return null;
      }

      if (files.length === 0) {
        toast.error("Please upload at least one document");
        return null;
      }
      
      toast.info(`Analyzing ${files.length} document(s)...`);
      
      // Calculate total size of files for validation
      const totalSizeMB = files.reduce((sum, file) => sum + file.size / (1024 * 1024), 0);
      if (totalSizeMB > 20) { // 20MB limit
        toast.error("Total file size exceeds 20MB limit");
        return null;
      }
      
      // Use the Vercel proxy for document analysis
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('query', query);
      
      const response = await fetch('/api/analyze-documents', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bHJzcHRldWt1b29vYmt2emR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NjQyNDAsImV4cCI6MjA2MTE0MDI0MH0.EdFXxTk2mOOJwxWugX_nj4wsxffy1lK_l1jljUk2-T0'
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to analyze documents");
      }
      
      const data = await response.json();
      return data.answer || 'Could not analyze the documents. Please try again.';
    } catch (error) {
      console.error("Error in analyzeDocuments:", error);
      toast.error("Failed to analyze documents");
      throw error;
    }
  };

  return {
    apiKey,
    getAiResponse,
    analyzeDocuments
  };
};
