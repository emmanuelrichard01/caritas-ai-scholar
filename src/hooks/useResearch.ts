import { useState, useCallback, useMemo } from "react";
import { ResearchResultItem } from "@/components/research/ResearchResult";
import { useAIProcessor } from "@/hooks/useAIProcessor";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SAVED_KEY = "savedArticles";
const RECENT_KEY = "researchRecentQueries";
const MAX_RECENT = 8;

export const useResearch = () => {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ResearchResultItem[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [savedArticles, setSavedArticles] = useState<ResearchResultItem[]>([]);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lastQuery, setLastQuery] = useState("");

  const { processQuery, isProcessing, result } = useAIProcessor({
    onError: (error) => {
      console.error("AI processing error:", error);
      toast.error("AI insights are currently unavailable. Showing results only.");
    },
  });

  const savedKeys = useMemo(
    () => new Set(savedArticles.map((a) => a.link)),
    [savedArticles]
  );

  const loadSavedArticles = useCallback(() => {
    try {
      const saved = localStorage.getItem(SAVED_KEY);
      if (saved) setSavedArticles(JSON.parse(saved));
      const recent = localStorage.getItem(RECENT_KEY);
      if (recent) setRecentQueries(JSON.parse(recent));
    } catch (err) {
      console.error("Failed to load research storage:", err);
    }
  }, []);

  const persistRecent = (next: string[]) => {
    setRecentQueries(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch (err) {
      console.error("Failed to persist recent queries:", err);
    }
  };

  const saveArticle = useCallback(
    (article: ResearchResultItem) => {
      if (savedKeys.has(article.link)) {
        toast.info("Already in your library");
        return;
      }
      const next = [...savedArticles, article];
      setSavedArticles(next);
      try {
        localStorage.setItem(SAVED_KEY, JSON.stringify(next));
        toast.success("Saved to library");
      } catch (err) {
        console.error("Save failed:", err);
        toast.error("Failed to save article");
      }
    },
    [savedArticles, savedKeys]
  );

  const removeArticle = useCallback(
    (link: string) => {
      const next = savedArticles.filter((a) => a.link !== link);
      setSavedArticles(next);
      try {
        localStorage.setItem(SAVED_KEY, JSON.stringify(next));
        toast.success("Removed from library");
      } catch (err) {
        console.error(err);
      }
    },
    [savedArticles]
  );

  const clearLibrary = useCallback(() => {
    setSavedArticles([]);
    localStorage.removeItem(SAVED_KEY);
    toast.success("Library cleared");
  }, []);

  const runSearch = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) {
        toast.error("Please enter a research topic or question");
        return;
      }
      setSearchError(null);
      setIsSearching(true);
      setLastQuery(trimmed);

      // Update recent queries (dedupe, MRU)
      const nextRecent = [trimmed, ...recentQueries.filter((r) => r !== trimmed)].slice(
        0,
        MAX_RECENT
      );
      persistRecent(nextRecent);

      try {
        processQuery(trimmed, "research").catch((err) =>
          console.error("AI insights error:", err)
        );

        const { data, error } = await supabase.functions.invoke("search-academic-results", {
          body: { query: trimmed },
        });
        if (error) throw new Error(error.message || "Search failed");

        if (data && Array.isArray(data.results) && data.results.length > 0) {
          setSearchResults(data.results);
          toast.success(`Found ${data.results.length} resources`);
        } else {
          const fallback = getFallbackResults(trimmed);
          setSearchResults(fallback);
          toast.info("No live results. Showing suggested resources.");
        }
      } catch (err) {
        console.error("Research search error:", err);
        setSearchError(
          err instanceof Error ? err.message : "Search service temporarily unavailable"
        );
        setSearchResults(getFallbackResults(trimmed));
        toast.error("Search service unavailable. Showing samples.");
      } finally {
        setIsSearching(false);
      }
    },
    [processQuery, recentQueries]
  );

  const handleSearch = useCallback(() => runSearch(query), [runSearch, query]);
  const retry = useCallback(() => {
    if (lastQuery) runSearch(lastQuery);
  }, [lastQuery, runSearch]);

  const pickRecent = useCallback(
    (q: string) => {
      setQuery(q);
      runSearch(q);
    },
    [runSearch]
  );

  const getFallbackResults = (searchQuery: string): ResearchResultItem[] => {
    const words = searchQuery.split(" ").filter((w) => w.length > 2);
    const main = words[0] ?? "Academic Research";
    const cap = main.charAt(0).toUpperCase() + main.slice(1);
    const base = "https://scholar.google.com/scholar?q=";
    return [
      {
        title: `Recent Advances in ${cap} Research`,
        authors: "Johnson, A. & Smith, B.",
        journal: "Journal of Advanced Studies",
        year: "2024",
        abstract: `This comprehensive study examines the latest developments in ${main} research, highlighting key trends and methodological innovations.`,
        link: base + encodeURIComponent(searchQuery),
        relevance: 94,
      },
      {
        title: `A Systematic Review of ${cap} Applications`,
        authors: "Chen, C. et al.",
        journal: "International Review of Applied Sciences",
        year: "2023",
        abstract: `A systematic review of current research and methodologies in ${main}, identifying key trends, challenges, and future directions.`,
        link: base + encodeURIComponent(`${searchQuery} systematic review`),
        relevance: 87,
      },
      {
        title: `Contemporary Perspectives on ${cap}`,
        authors: "García, M. & Kim, J.",
        journal: "Journal of Academic Research",
        year: "2023",
        abstract: `This study examines contemporary approaches and perspectives in ${main}, with implications for academic understanding and practice.`,
        link: base + encodeURIComponent(`${searchQuery} perspectives`),
        relevance: 82,
      },
    ];
  };

  return {
    query,
    setQuery,
    searchResults,
    searchError,
    savedArticles,
    savedKeys,
    recentQueries,
    isProcessing: isProcessing || isSearching,
    isSearching,
    result,
    handleSearch,
    pickRecent,
    retry,
    saveArticle,
    removeArticle,
    clearLibrary,
    loadSavedArticles,
  };
};
