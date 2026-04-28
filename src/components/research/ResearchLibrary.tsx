import { Card } from "@/components/ui/card";
import { Bookmark, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResearchResultItem } from "@/components/research/ResearchResult";

interface Props {
  savedArticles: ResearchResultItem[];
  onClearLibrary: () => void;
  onRemove?: (link: string) => void;
}

export const ResearchLibrary = ({ savedArticles, onClearLibrary, onRemove }: Props) => {
  return (
    <Card className="p-5 lg:sticky lg:top-4 border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-foreground/70" />
          <h2 className="text-base font-semibold">My Library</h2>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {savedArticles.length}
        </span>
      </div>

      {savedArticles.length === 0 ? (
        <div className="text-center py-8">
          <Bookmark className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">
            Saved articles appear here for quick access.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1 -mr-1">
            {savedArticles.map((article) => (
              <div
                key={article.link}
                className="group rounded-md border border-border p-3 hover:bg-muted/40 transition-base"
              >
                <h3 className="text-sm font-medium leading-snug mb-1 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {article.authors} · {article.year}
                </p>
                <div className="flex items-center justify-between">
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium hover:underline inline-flex items-center"
                  >
                    Open
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                  {onRemove && (
                    <button
                      onClick={() => onRemove(article.link)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-base"
                      aria-label="Remove from library"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full text-xs text-muted-foreground hover:text-destructive"
            onClick={onClearLibrary}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Clear library
          </Button>
        </>
      )}
    </Card>
  );
};
