
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface ResearchSearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  isProcessing: boolean;
}

export const ResearchSearchBar = ({ 
  query, 
  onQueryChange, 
  onSearch, 
  isProcessing 
}: ResearchSearchBarProps) => {
  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border mb-4 md:mb-6 dark:bg-slate-900 dark:border-slate-800">
      <h2 className="text-lg font-medium mb-4 dark:text-white">Find Scholarly Resources</h2>
      
      <div className="flex flex-col md:flex-row gap-2">
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Enter your research topic or question..."
          className="dark:border-slate-700 dark:bg-slate-800 dark:text-white flex-1"
        />
        <Button 
          onClick={onSearch}
          disabled={isProcessing || !query.trim()}
          className="bg-purple-600 hover:bg-purple-700 min-w-[120px]"
        >
          {isProcessing ? (
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
  );
};
