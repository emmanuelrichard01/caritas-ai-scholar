
import { useState } from "react";
import { ResearchResultItem } from "@/components/research/ResearchResult";
import { useAIProcessor } from "@/hooks/useAIProcessor";
import { toast } from "sonner";

export const useResearch = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ResearchResultItem[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [savedArticles, setSavedArticles] = useState<ResearchResultItem[]>([]);
  const { processQuery, isProcessing, result } = useAIProcessor({
    onError: (error) => {
      console.error("AI processing error:", error);
      toast.error("AI processing failed. Using offline mode for now.");
    }
  });

  // Load saved articles from local storage
  const loadSavedArticles = () => {
    try {
      const saved = localStorage.getItem('savedArticles');
      if (saved) {
        setSavedArticles(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load from localStorage:', err);
    }
  };

  // Save article to library
  const saveArticle = (article: ResearchResultItem) => {
    if (!savedArticles.some(saved => saved.title === article.title)) {
      const updatedArticles = [...savedArticles, article];
      setSavedArticles(updatedArticles);
      
      try {
        localStorage.setItem('savedArticles', JSON.stringify(updatedArticles));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
      
      toast.success("Article saved to your library");
    } else {
      toast.info("This article is already in your library");
    }
  };

  // Clear library
  const clearLibrary = () => {
    setSavedArticles([]);
    localStorage.removeItem('savedArticles');
    toast.success("Library cleared");
  };

  // Search for articles
  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a research topic or question");
      return;
    }
    
    setSearchError(null);
    
    try {
      // Get AI-generated research insights
      try {
        await processQuery(query, "research");
      } catch (aiError) {
        console.error("AI error:", aiError);
        toast.error("AI insights are currently unavailable. Continuing with search results.");
      }
      
      // Get real search results with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      try {
        // Using relative URL instead of absolute URL
        const response = await fetch('/api/search-academic-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json' // Explicitly request JSON
          },
          body: JSON.stringify({ query }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Search API error:", errorText);
          throw new Error(`Failed to fetch research results (${response.status})`);
        }
        
        // Check for HTML response before parsing
        const contentType = response.headers.get('content-type');
        const responseText = await response.text();
        
        if (responseText.trim().startsWith('<!DOCTYPE html>') || 
            responseText.trim().startsWith('<html')) {
          console.error("Received HTML instead of JSON response:", responseText.substring(0, 150) + "...");
          throw new Error("Server returned HTML instead of JSON data. The API endpoint may be misconfigured.");
        }
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (jsonError) {
          console.error("Failed to parse response as JSON:", jsonError);
          throw new Error("Invalid response format from server");
        }
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setSearchResults(data.results || []);
      } catch (fetchError) {
        console.error("Search API fetch error:", fetchError);
        
        if (fetchError.name === 'AbortError') {
          setSearchError("Search request timed out. Please try again later.");
        } else {
          setSearchError(fetchError instanceof Error ? fetchError.message : "Unknown error occurred");
        }
        
        // Set some sample results for better UX when offline
        setSearchResults([
          {
            title: "Sample Research Paper (Offline Mode)",
            authors: "Demo Author",
            journal: "Journal of Computer Science",
            year: "2024",
            link: "#",
            abstract: "This is a sample research paper shown because the search API is currently unavailable. Please try again later to get real search results.",
            relevance: 85
          },
          {
            title: "Understanding AI in Education",
            authors: "Jane Smith, John Doe",
            journal: "Educational Technology Review",
            year: "2023",
            link: "#",
            abstract: "A comprehensive review of artificial intelligence applications in educational contexts and their impact on learning outcomes.",
            relevance: 92
          }
        ]);
        toast.info("Using sample results while the search service is unavailable.");
      }
    } catch (error) {
      console.error("Error processing research query:", error);
      setSearchError(error instanceof Error ? error.message : "Unknown error occurred");
      toast.error("Failed to retrieve research results. Please try again.");
    }
  };

  return {
    query,
    setQuery,
    searchResults,
    searchError,
    savedArticles,
    isProcessing,
    result,
    handleSearch,
    saveArticle,
    clearLibrary,
    loadSavedArticles
  };
};
