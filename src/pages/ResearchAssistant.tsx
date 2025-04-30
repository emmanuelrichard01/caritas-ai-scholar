
import { useState, useEffect } from "react";
import { Book, Bookmark, Search } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { ResearchSearchBar } from "@/components/research/ResearchSearchBar";
import { ResearchResult, ResearchResultItem } from "@/components/research/ResearchResult"; 
import { toast } from "sonner";
import { useAIProcessor } from "@/hooks/useAIProcessor";
import { AIResponseDisplay } from "@/components/AIResponseDisplay";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Generate sample research results for demonstration
const generateSampleResults = (query: string): ResearchResultItem[] => {
  // Simplified mock function
  return [
    {
      title: `Recent Advances in ${query}`,
      authors: "Smith, J., Johnson, A., et al.",
      journal: "Journal of Advanced Research",
      year: "2024",
      abstract: `This paper explores the latest developments in ${query}, with a focus on theoretical frameworks and practical applications.`,
      link: "https://example.com/paper1",
      relevance: 98
    },
    {
      title: `A Comprehensive Review of ${query}`,
      authors: "Williams, R., Brown, C., et al.",
      journal: "International Journal of Science",
      year: "2023",
      abstract: `This literature review provides a thorough analysis of existing research on ${query}, identifying gaps and suggesting directions for future studies.`,
      link: "https://example.com/paper2",
      relevance: 95
    },
    {
      title: `Empirical Studies on ${query}: A Meta-Analysis`,
      authors: "Garcia, M., Davis, L., et al.",
      journal: "Research Methodology Journal",
      year: "2023",
      abstract: `This meta-analysis synthesizes findings from 42 empirical studies on ${query}, revealing consistent patterns and contradictions in the literature.`,
      link: "https://example.com/paper3",
      relevance: 87
    }
  ];
};

const ResearchAssistant = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ResearchResultItem[]>([]);
  const [savedArticles, setSavedArticles] = useState<ResearchResultItem[]>([]);
  const { processQuery, isProcessing, result } = useAIProcessor();
  
  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("Please enter a research topic or question");
      return;
    }
    
    try {
      // Get AI-generated research insights
      await processQuery(query, "research");
      
      // Generate sample search results
      const results = generateSampleResults(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Error processing research query:", error);
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
          
          {searchResults.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-medium dark:text-white">Scholarly Resources</h2>
              {searchResults.map((result, index) => (
                <ResearchResult key={index} result={result} onSave={() => saveArticle(result)} />
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
                onClick={() => setSavedArticles([])}
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
