
import { useState, useEffect } from "react";
import { Book } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { ResearchSearchBar } from "@/components/research/ResearchSearchBar";
import { ResearchResultItem } from "@/components/research/ResearchResult"; 
import { toast } from "sonner";
import { useAIProcessor } from "@/hooks/useAIProcessor";
import { ResearchInsights } from "@/components/research/ResearchInsights";
import { ResearchError } from "@/components/research/ResearchError";
import { ResearchResults } from "@/components/research/ResearchResults";
import { ResearchLibrary } from "@/components/research/ResearchLibrary";

const ResearchAssistant = () => {
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
        const response = await fetch('/api/search-academic-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
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
        
        // Check for HTML response - FIX for "Unexpected response format: <!DOCTYPE html>" error
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
  
  const saveArticle = (article: ResearchResultItem) => {
    if (!savedArticles.some(saved => saved.title === article.title)) {
      setSavedArticles([...savedArticles, article]);
      toast.success("Article saved to your library");
    } else {
      toast.info("This article is already in your library");
    }
  };
  
  const clearLibrary = () => {
    setSavedArticles([]);
    localStorage.removeItem('savedArticles');
    toast.success("Library cleared");
  };
  
  // Store saved articles in local storage
  useEffect(() => {
    if (savedArticles.length > 0) {
      try {
        localStorage.setItem('savedArticles', JSON.stringify(savedArticles));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
    }
  }, [savedArticles]);
  
  // Load saved articles from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('savedArticles');
      if (saved) {
        setSavedArticles(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load from localStorage:', err);
    }
  }, []);
  
  return (
    <PageLayout
      title="Research Assistant"
      subtitle="Find scholarly resources and research insights"
      icon={<Book className="h-6 w-6" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <ResearchSearchBar 
            query={query}
            onQueryChange={setQuery}
            onSearch={handleSearch}
            isProcessing={isProcessing}
          />
          
          <ResearchInsights result={result} isProcessing={isProcessing} />
          
          <ResearchError error={searchError} />
          
          <ResearchResults results={searchResults} onSave={saveArticle} />
        </div>
        
        <div>
          <ResearchLibrary 
            savedArticles={savedArticles} 
            onClearLibrary={clearLibrary}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default ResearchAssistant;
