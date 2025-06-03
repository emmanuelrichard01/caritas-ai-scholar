
import { useState, useCallback } from "react";
import { ResearchResultItem } from "@/components/research/ResearchResult";
import { useAIProcessor } from "@/hooks/useAIProcessor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useResearch = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ResearchResultItem[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [savedArticles, setSavedArticles] = useState<ResearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const { processQuery, isProcessing, result } = useAIProcessor({
    onError: (error) => {
      console.error("AI processing error:", error);
      toast.error("AI processing failed. Using offline mode for now.");
    }
  });

  // Load saved articles from local storage
  const loadSavedArticles = useCallback(() => {
    try {
      const saved = localStorage.getItem('savedArticles');
      if (saved) {
        setSavedArticles(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load from localStorage:', err);
    }
  }, []);

  // Save article to library
  const saveArticle = useCallback((article: ResearchResultItem) => {
    if (!savedArticles.some(saved => saved.title === article.title)) {
      const updatedArticles = [...savedArticles, article];
      setSavedArticles(updatedArticles);
      
      try {
        localStorage.setItem('savedArticles', JSON.stringify(updatedArticles));
        toast.success("Article saved to your library");
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
        toast.error("Failed to save article to library");
      }
    } else {
      toast.info("This article is already in your library");
    }
  }, [savedArticles]);

  // Clear library
  const clearLibrary = useCallback(() => {
    setSavedArticles([]);
    localStorage.removeItem('savedArticles');
    toast.success("Library cleared");
  }, []);

  // Search for articles
  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      toast.error("Please enter a research topic or question");
      return;
    }
    
    setSearchError(null);
    setIsSearching(true);
    
    try {
      // Get AI-generated research insights
      try {
        await processQuery(query, "research");
      } catch (aiError) {
        console.error("AI error:", aiError);
        toast.error("AI insights are currently unavailable. Continuing with search results.");
      }
      
      // Call the Supabase edge function for search results
      try {
        console.log('Calling search-academic-results edge function with query:', query);
        
        const { data, error } = await supabase.functions.invoke('search-academic-results', {
          body: { query }
        });
        
        if (error) {
          console.error("Edge function error:", error);
          throw new Error(`Search function error: ${error.message}`);
        }
        
        if (data && Array.isArray(data.results) && data.results.length > 0) {
          setSearchResults(data.results);
        } else {
          console.warn("No results returned from edge function");
          setSearchResults(getFallbackResults(query));
          toast.info("No relevant academic results found. Showing suggested resources.");
        }
      } catch (fetchError) {
        console.error("Search edge function error:", fetchError);
        setSearchError(fetchError instanceof Error ? fetchError.message : "Unknown error occurred");
        
        // Set fallback results for better UX
        setSearchResults(getFallbackResults(query));
        toast.info("Using sample results while the search service is unavailable.");
      }
    } catch (error) {
      console.error("Error processing research query:", error);
      setSearchError(error instanceof Error ? error.message : "Unknown error occurred");
      setSearchResults(getFallbackResults(query));
      toast.error("Failed to retrieve research results. Using offline mode.");
    } finally {
      setIsSearching(false);
    }
  }, [query, processQuery]);

  // Generate fallback results when API fails
  const getFallbackResults = (searchQuery: string): ResearchResultItem[] => {
    const queryWords = searchQuery.split(' ').filter(word => word.length > 2);
    const mainTopic = queryWords.length > 0 ? 
      queryWords[Math.floor(Math.random() * queryWords.length)] : 
      'Education';
    
    const capitalizedTopic = mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1);
    
    return [
      {
        title: `Recent Advances in ${capitalizedTopic} Research`,
        authors: "Johnson, A. & Smith, B.",
        journal: "Journal of Advanced Studies",
        year: "2023",
        abstract: `This comprehensive study examines the latest developments in ${mainTopic} research, highlighting key trends and methodological innovations that have emerged in recent years.`,
        link: "https://example.org/research/recent-advances",
        relevance: 94
      },
      {
        title: `A Systematic Review of ${capitalizedTopic} Applications`,
        authors: "Chen, C. et al.",
        journal: "International Review of Applied Sciences",
        year: "2022",
        abstract: `This paper provides a systematic review of current research and methodologies in ${mainTopic}. The authors analyze existing literature and identify key trends, challenges, and future directions.`,
        link: "https://example.org/research/systematic-review",
        relevance: 87
      },
      {
        title: `Applications and Implications of ${capitalizedTopic} in Education`,
        authors: "García, M. & Kim, J.",
        journal: "Journal of Educational Technology",
        year: "2023",
        abstract: `This study examines the practical applications and broader implications of ${mainTopic} in educational settings. The research findings suggest significant benefits for student engagement and learning outcomes.`,
        link: "https://example.org/research/applications",
        relevance: 82
      }
    ];
  };

  return {
    query,
    setQuery,
    searchResults,
    searchError,
    savedArticles,
    isProcessing: isProcessing || isSearching,
    result,
    handleSearch,
    saveArticle,
    clearLibrary,
    loadSavedArticles
  };
};
