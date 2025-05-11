
import { Card } from "@/components/ui/card";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResearchResultItem } from "@/components/research/ResearchResult";

interface ResearchLibraryProps {
  savedArticles: ResearchResultItem[];
  onClearLibrary: () => void;
}

export const ResearchLibrary = ({ savedArticles, onClearLibrary }: ResearchLibraryProps) => {
  return (
    <Card className="p-4 md:p-6 sticky top-6 dark:bg-slate-900">
      <div className="flex items-center gap-2 mb-4">
        <Bookmark className="h-5 w-5 text-purple-600" />
        <h2 className="text-lg font-medium dark:text-white">My Research Library</h2>
      </div>
      
      {savedArticles.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Save articles to your library for quick access.
        </p>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {savedArticles.map((article, index) => (
            <div 
              key={index} 
              className="border rounded-md p-3 dark:border-slate-700"
            >
              <h3 className="text-sm font-medium mb-1 dark:text-white">{article.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {article.authors} • {article.year}
              </p>
              <a 
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-purple-600 hover:underline mt-1 inline-block dark:text-purple-400"
              >
                View paper
              </a>
            </div>
          ))}
        </div>
      )}
      
      {savedArticles.length > 0 && (
        <Button 
          variant="outline" 
          size="sm"
          className="mt-4 text-xs dark:border-slate-700 dark:text-slate-300"
          onClick={onClearLibrary}
        >
          Clear Library
        </Button>
      )}
    </Card>
  );
};
