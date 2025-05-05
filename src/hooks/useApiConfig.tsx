
import { useState } from "react";
import { toast } from "sonner";

// Default API key from the user input
const OPENAI_API_KEY = "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";

export const useApiConfig = () => {
  const [apiKey] = useState(OPENAI_API_KEY);

  // This fixes the "Cannot redefine property: ethereum" error by preventing redefinition
  if (typeof window !== 'undefined' && !Object.getOwnPropertyDescriptor(window, 'ethereum')?.configurable) {
    console.log('Ethereum property already defined and not configurable, skipping definition');
  }

  const getAiResponse = async (message: string) => {
    try {
      // Improved real AI response using the edge function
      const response = await fetch('/api/process-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: message })
      });
      
      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }
      
      const data = await response.json();
      return data.answer || 'Sorry, I could not process your request at this time.';
    } catch (error) {
      toast.error("Failed to get AI response");
      console.error("Error in getAiResponse:", error);
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
      
      // Improved document processing through edge function
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('query', query);
      
      const response = await fetch('/api/analyze-documents', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error("Failed to analyze documents");
      }
      
      const data = await response.json();
      return data.answer || 'Could not analyze the documents. Please try again.';
    } catch (error) {
      toast.error("Failed to analyze documents");
      console.error("Error in analyzeDocuments:", error);
      throw error;
    }
  };

  return {
    apiKey,
    getAiResponse,
    analyzeDocuments
  };
};
