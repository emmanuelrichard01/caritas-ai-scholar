
import { BookOpen, ExternalLink, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ResearchResultItem {
  title: string;
  authors: string;
  journal: string;
  year: string;
  abstract: string;
  link: string;
  relevance: number;
}

interface ResearchResultProps {
  result: ResearchResultItem;
}

export const ResearchResult = ({ result }: ResearchResultProps) => {
  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border dark:bg-slate-900 dark:border-slate-800">
      <div className="flex flex-col md:flex-row md:justify-between gap-2 md:gap-0">
        <h3 className="text-md font-semibold mb-1 dark:text-white">{result.title}</h3>
        <div className="flex items-center bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 h-fit rounded whitespace-nowrap dark:bg-purple-900/40 dark:text-purple-300">
          <ThumbsUp className="h-3 w-3 mr-1" />
          {result.relevance}% match
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-2 dark:text-slate-400">
        {result.authors} • {result.journal} • {result.year}
      </p>
      <p className="text-sm mb-4 dark:text-slate-300">{result.abstract}</p>
      <div className="flex flex-col md:flex-row justify-between gap-2 md:gap-0">
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
  );
};
