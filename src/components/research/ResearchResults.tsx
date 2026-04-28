import { useMemo, useState } from "react";
import { ResearchResult, ResearchResultItem } from "@/components/research/ResearchResult";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";

interface Props {
  results: ResearchResultItem[];
  savedKeys?: Set<string>;
  onSave: (article: ResearchResultItem) => void;
}

type SortKey = "relevance" | "year-desc" | "year-asc";

export const ResearchResults = ({ results, onSave, savedKeys }: Props) => {
  const [sort, setSort] = useState<SortKey>("relevance");
  const [filter, setFilter] = useState("");

  const visible = useMemo(() => {
    let list = [...results];
    if (filter.trim()) {
      const q = filter.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.authors.toLowerCase().includes(q) ||
          r.journal.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      if (sort === "year-desc") return parseInt(b.year) - parseInt(a.year);
      if (sort === "year-asc") return parseInt(a.year) - parseInt(b.year);
      return b.relevance - a.relevance;
    });
    return list;
  }, [results, sort, filter]);

  if (results.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h2 className="text-base font-semibold">
          Scholarly Resources{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({visible.length} of {results.length})
          </span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter results"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-8 pl-7 w-44 text-xs"
            />
          </div>
          <Select value={sort} onValueChange={(v: SortKey) => setSort(v)}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Most relevant</SelectItem>
              <SelectItem value="year-desc">Newest first</SelectItem>
              <SelectItem value="year-asc">Oldest first</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3 stagger-children">
        {visible.map((result, index) => (
          <ResearchResult
            key={result.link + index}
            result={result}
            isSaved={savedKeys?.has(result.link)}
            onSave={() => onSave(result)}
          />
        ))}
        {visible.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No results match your filter.
          </p>
        )}
      </div>
    </section>
  );
};
