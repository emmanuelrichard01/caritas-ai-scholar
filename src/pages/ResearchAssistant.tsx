
import { useState } from "react";
import { Search } from "lucide-react";
import { useAIProcessor } from "@/hooks/useAIProcessor";
import { useIsMobile } from "@/hooks/use-mobile";
import { PageLayout } from "@/components/PageLayout";
import { ResearchSearchBar } from "@/components/research/ResearchSearchBar";
import { ResearchResult, ResearchResultItem } from "@/components/research/ResearchResult";
import { processResearchResults } from "@/utils/researchUtils";

const ResearchAssistant = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ResearchResultItem[] | null>(null);
  const isMobile = useIsMobile();
  const { processQuery, isProcessing } = useAIProcessor();

  const handleSearch = async () => {
    const response = await processQuery(query, 'research');
    
    if (response) {
      // Process the AI response into research result format
      const processedResults = processResearchResults(response, query);
      setResults(processedResults);
    }
  };

  return (
    <PageLayout
      title="Research Assistant"
      subtitle="Find quality sources and research materials"
      icon={<Search className="h-6 w-6" />}
    >
      <ResearchSearchBar 
        query={query} 
        onQueryChange={setQuery} 
        onSearch={handleSearch} 
        isProcessing={isProcessing} 
      />
      
      {isProcessing && (
        <div className="text-center py-12">
          <div className="inline-flex gap-1 mb-2">
            <div className="h-2 w-2 rounded-full bg-purple-600 animate-pulse"></div>
            <div className="h-2 w-2 rounded-full bg-purple-600 animate-pulse [animation-delay:0.2s]"></div>
            <div className="h-2 w-2 rounded-full bg-purple-600 animate-pulse [animation-delay:0.4s]"></div>
          </div>
          <p className="text-sm text-muted-foreground dark:text-slate-400">Searching academic databases...</p>
        </div>
      )}
      
      {results && results.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-4 dark:text-white">Research Results</h2>
          
          <div className="space-y-4 md:space-y-6">
            {results.map((result, index) => (
              <ResearchResult key={index} result={result} />
            ))}
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default ResearchAssistant;
