
import { ResearchResult, ResearchResultItem } from "@/components/research/ResearchResult";

interface ResearchResultsProps {
  results: ResearchResultItem[];
  onSave: (article: ResearchResultItem) => void;
}

export const ResearchResults = ({ results, onSave }: ResearchResultsProps) => {
  if (results.length === 0) return null;
  
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium dark:text-white">Scholarly Resources</h2>
      {results.map((result, index) => (
        <ResearchResult 
          key={index} 
          result={result} 
          onSave={() => onSave(result)}
        />
      ))}
    </div>
  );
};
