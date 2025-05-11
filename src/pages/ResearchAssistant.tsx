
import { useEffect } from "react";
import { Book } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { ResearchSearchBar } from "@/components/research/ResearchSearchBar";
import { ResearchInsights } from "@/components/research/ResearchInsights";
import { ResearchError } from "@/components/research/ResearchError";
import { ResearchResults } from "@/components/research/ResearchResults";
import { ResearchLibrary } from "@/components/research/ResearchLibrary";
import { useResearch } from "@/hooks/useResearch";

const ResearchAssistant = () => {
  const {
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
  } = useResearch();
  
  // Load saved articles on component mount
  useEffect(() => {
    loadSavedArticles();
  }, [loadSavedArticles]);
  
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
