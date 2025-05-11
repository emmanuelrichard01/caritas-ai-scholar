
import { useState, useEffect } from "react";
import { Book, Bookmark, Search, AlertCircle } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { ResearchSearchBar } from "@/components/research/ResearchSearchBar";
import { ResearchResult, ResearchResultItem } from "@/components/research/ResearchResult"; 
import { toast } from "sonner";
import { useAIProcessor } from "@/hooks/useAIProcessor";
import { AIResponseDisplay } from "@/components/AIResponseDisplay";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
        
        // Check for HTML response
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error("Unexpected response format:", text.substring(0, 100) + "...");
          throw new Error("Server returned an invalid response format");
        }
        
        const data = await response.json();
        
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
            relevance: 85 // Added the required relevance field
          },
          {
            title: "Understanding AI in Education",
            authors: "Jane Smith, John Doe",
            journal: "Educational Technology Review",
            year: "2023",
            link: "#",
            abstract: "A comprehensive review of artificial intelligence applications in educational contexts and their impact on learning outcomes.",
            relevance: 92 // Added the required relevance field
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
          
          {result && (
            <Card className="p-4 md:p-6 dark:bg-slate-900">
              <h2 className="text-lg font-medium mb-3 dark:text-white">Research Insights</h2>
              <AIResponseDisplay content={result} isProcessing={isProcessing} />
            </Card>
          )}
          
          {searchError && (
            <Card className="p-4 md:p-6 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-800 dark:text-red-300 mb-1">
                    Error Loading Research Results
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {searchError}
                  </p>
                </div>
              </div>
            </Card>
          )}
          
          {searchResults.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-medium dark:text-white">Scholarly Resources</h2>
              {searchResults.map((result, index) => (
                <ResearchResult 
                  key={index} 
                  result={result} 
                  onSave={() => saveArticle(result)}
                />
              ))}
            </div>
          )}
        </div>
        
        <div>
          <Card className="p-4 md:p-6 sticky top-6 dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-4">
              <Bookmark className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-medium dark:text-white">My Research Library</h2>
            </div>
            
            {savedArticles.length === 0 ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Save articles to your library for quick access.
              </p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {savedArticles.map((article, index) => (
                  <div 
                    key={index} 
                    className="border rounded-md p-3 dark:border-slate-700"
                  >
                    <h3 className="text-sm font-medium mb-1 dark:text-white">{article.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {article.authors} • {article.year}
                    </p>
                    <a 
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-purple-600 hover:underline mt-1 inline-block dark:text-purple-400"
                    >
                      View paper
                    </a>
                  </div>
                ))}
              </div>
            )}
            
            {savedArticles.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                className="mt-4 text-xs dark:border-slate-700 dark:text-slate-300"
                onClick={() => {
                  setSavedArticles([]);
                  localStorage.removeItem('savedArticles');
                  toast.success("Library cleared");
                }}
              >
                Clear Library
              </Button>
            )}
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default ResearchAssistant;
