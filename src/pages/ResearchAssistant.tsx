
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, ExternalLink, ThumbsUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ResearchResult {
  title: string;
  authors: string;
  journal: string;
  year: string;
  abstract: string;
  link: string;
  relevance: number;
}

const ResearchAssistant = () => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ResearchResult[] | null>(null);

  const handleSearch = () => {
    if (!query.trim()) {
      toast.error("Please enter a research query");
      return;
    }
    
    setIsSearching(true);
    setResults(null);
    
    // Simulate API search
    setTimeout(() => {
      setIsSearching(false);
      
      // Mock results
      setResults([
        {
          title: "The Impact of Modern Learning Technologies on Student Engagement",
          authors: "Johnson, M., Smith, A., & Williams, K.",
          journal: "Journal of Educational Technology",
          year: "2023",
          abstract: "This study examines how modern learning technologies affect student engagement in higher education settings. Through a mixed-methods approach involving surveys and interviews with 500 undergraduate students, the research identifies key factors that influence engagement with digital learning tools. Findings suggest that interactive elements, personalization features, and social learning components significantly enhance student participation and knowledge retention.",
          link: "https://example.org/research/jed-2023-0042",
          relevance: 98
        },
        {
          title: "Cognitive Load Theory: Implications for Digital Course Design",
          authors: "Chen, L. & García, R.",
          journal: "Educational Research Quarterly",
          year: "2022",
          abstract: "This paper applies principles of cognitive load theory to digital course design in university settings. The authors present a framework for optimizing instructional materials to reduce extraneous cognitive load while supporting germane learning processes. Case studies from three disciplines demonstrate how these principles can be applied across different subject areas.",
          link: "https://example.org/research/erq-2022-124",
          relevance: 87
        },
        {
          title: "Adaptive Learning Systems: Personalizing Education at Scale",
          authors: "Patel, S., Nguyen, T., & Brown, J.",
          journal: "International Review of Education Technology",
          year: "2023",
          abstract: "This comprehensive review examines the evolution and current state of adaptive learning systems in higher education. The authors analyze 45 implementations across diverse institutions, identifying critical success factors and barriers to effective deployment. The paper provides a roadmap for institutions seeking to implement adaptive learning at scale.",
          link: "https://example.org/research/iret-2023-0087",
          relevance: 85
        },
      ]);
    }, 2000);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navigation />
      
      <div className="flex-1 pl-[70px] md:pl-[260px] transition-all duration-300">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center text-white mr-4">
              <Search className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold dark:text-white">Research Assistant</h1>
              <p className="text-muted-foreground dark:text-slate-400">Find quality sources and research materials</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border mb-6 dark:bg-slate-900 dark:border-slate-800">
            <h2 className="text-lg font-medium mb-4 dark:text-white">Find Scholarly Resources</h2>
            
            <div className="flex gap-2 mb-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your research topic or question..."
                className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <Button 
                onClick={handleSearch}
                disabled={isSearching}
                className="bg-purple-600 hover:bg-purple-700 min-w-[120px]"
              >
                {isSearching ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground mt-1 dark:text-slate-400">
              Searches academic journals, publications, and scholarly resources
            </p>
          </div>
          
          {isSearching && (
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
              
              <div className="space-y-6">
                {results.map((result, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm border dark:bg-slate-900 dark:border-slate-800">
                    <div className="flex justify-between">
                      <h3 className="text-md font-semibold mb-1 dark:text-white">{result.title}</h3>
                      <div className="flex items-center bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded dark:bg-purple-900/40 dark:text-purple-300">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {result.relevance}% match
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 dark:text-slate-400">
                      {result.authors} • {result.journal} • {result.year}
                    </p>
                    <p className="text-sm mb-4 dark:text-slate-300">{result.abstract}</p>
                    <div className="flex justify-between">
                      <a 
                        href={result.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 text-sm font-medium flex items-center hover:underline dark:text-purple-400"
                      >
                        View full paper
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                      <Button variant="outline" size="sm" className="text-xs h-8 dark:border-slate-700 dark:text-slate-300">
                        <BookOpen className="h-3 w-3 mr-1" />
                        Save to Library
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResearchAssistant;
