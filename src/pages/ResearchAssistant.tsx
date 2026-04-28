import { useEffect } from "react";
import { Book } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { ResearchSearchBar } from "@/components/research/ResearchSearchBar";
import { ResearchInsights } from "@/components/research/ResearchInsights";
import { ResearchError } from "@/components/research/ResearchError";
import { ResearchResults } from "@/components/research/ResearchResults";
import { ResearchResultsSkeleton } from "@/components/research/ResearchResultsSkeleton";
import { ResearchLibrary } from "@/components/research/ResearchLibrary";
import { useResearch } from "@/hooks/useResearch";

const ResearchAssistant = () => {
  const {
    query,
    setQuery,
    searchResults,
    searchError,
    savedArticles,
    savedKeys,
    recentQueries,
    isProcessing,
    isSearching,
    result,
    handleSearch,
    pickRecent,
    retry,
    saveArticle,
    removeArticle,
    clearLibrary,
    loadSavedArticles,
  } = useResearch();

  useEffect(() => {
    loadSavedArticles();
  }, [loadSavedArticles]);

  return (
    <PageLayout
      title="Research Assistant"
      subtitle="Find scholarly resources and AI-powered research insights"
      icon={<Book className="h-6 w-6" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <ResearchSearchBar
            query={query}
            onQueryChange={setQuery}
            onSearch={handleSearch}
            isProcessing={isProcessing}
            recentQueries={recentQueries}
            onPickRecent={pickRecent}
          />

          <ResearchInsights result={result} isProcessing={isProcessing} />

          <ResearchError error={searchError} onRetry={retry} />

          {isSearching && searchResults.length === 0 ? (
            <ResearchResultsSkeleton />
          ) : (
            <ResearchResults
              results={searchResults}
              savedKeys={savedKeys}
              onSave={saveArticle}
            />
          )}
        </div>

        <div>
          <ResearchLibrary
            savedArticles={savedArticles}
            onClearLibrary={clearLibrary}
            onRemove={removeArticle}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default ResearchAssistant;
