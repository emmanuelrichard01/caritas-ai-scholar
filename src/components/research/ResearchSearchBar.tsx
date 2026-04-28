import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Sparkles } from "lucide-react";
import { KeyboardEvent } from "react";

interface Props {
  query: string;
  onQueryChange: (q: string) => void;
  onSearch: () => void;
  isProcessing: boolean;
  recentQueries?: string[];
  onPickRecent?: (q: string) => void;
}

export const ResearchSearchBar = ({
  query,
  onQueryChange,
  onSearch,
  isProcessing,
  recentQueries = [],
  onPickRecent,
}: Props) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isProcessing && query.trim()) {
      e.preventDefault();
      onSearch();
    }
  };

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 shadow-soft border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-4 w-4 text-foreground/70" />
        <h2 className="text-base font-semibold">Find Scholarly Resources</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a research topic, question, or keywords…"
          className="pl-9 pr-24 h-11"
          aria-label="Research query"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            className="absolute right-[5.5rem] top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-base"
            aria-label="Clear query"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <Button
          onClick={onSearch}
          disabled={isProcessing || !query.trim()}
          size="sm"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8"
        >
          {isProcessing ? (
            <>
              <span className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Searching
            </>
          ) : (
            "Search"
          )}
        </Button>
      </div>

      {recentQueries.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground mr-1">Recent:</span>
          {recentQueries.slice(0, 5).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onPickRecent?.(q)}
              className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-base border border-border"
            >
              {q.length > 32 ? q.slice(0, 32) + "…" : q}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-3">
        Searches academic journals, publications, and scholarly resources. Press Enter to search.
      </p>
    </div>
  );
};
