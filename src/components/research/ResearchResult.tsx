import { BookOpen, ExternalLink, Sparkles, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export interface ResearchResultItem {
  title: string;
  authors: string;
  journal: string;
  year: string;
  abstract: string;
  link: string;
  relevance: number;
}

interface Props {
  result: ResearchResultItem;
  onSave: () => void;
  isSaved?: boolean;
}

const relevanceClass = (r: number) => {
  if (r >= 90) return "bg-success/10 text-success border-success/20";
  if (r >= 75) return "bg-info/10 text-info border-info/20";
  return "bg-muted text-muted-foreground border-border";
};

const formatCitationAPA = (r: ResearchResultItem) =>
  `${r.authors} (${r.year}). ${r.title}. ${r.journal}. ${r.link}`;

export const ResearchResult = ({ result, onSave, isSaved }: Props) => {
  const copyCitation = async () => {
    try {
      await navigator.clipboard.writeText(formatCitationAPA(result));
      toast.success("Citation copied (APA)");
    } catch {
      toast.error("Could not copy to clipboard");
    }
  };

  return (
    <article className="bg-card rounded-xl p-5 shadow-subtle border border-border hover:shadow-soft hover-lift transition-smooth">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-base font-semibold leading-snug">{result.title}</h3>
        <Badge variant="outline" className={`shrink-0 ${relevanceClass(result.relevance)}`}>
          <Sparkles className="h-3 w-3 mr-1" />
          {result.relevance}%
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground mb-3">
        <span className="font-medium text-foreground/80">{result.authors}</span>
        {" · "}
        <span className="italic">{result.journal}</span>
        {" · "}
        {result.year}
      </p>

      <p className="text-sm text-foreground/80 leading-relaxed mb-4 line-clamp-4">
        {result.abstract}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border">
        <a
          href={result.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-foreground hover:underline inline-flex items-center"
        >
          View full paper
          <ExternalLink className="h-3.5 w-3.5 ml-1" />
        </a>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" className="h-8" onClick={copyCitation}>
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Cite
          </Button>
          <Button
            variant={isSaved ? "secondary" : "outline"}
            size="sm"
            className="h-8"
            onClick={onSave}
            disabled={isSaved}
          >
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
            {isSaved ? "Saved" : "Save"}
          </Button>
        </div>
      </div>
    </article>
  );
};
