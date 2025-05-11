
import { Card } from "@/components/ui/card";
import { AIResponseDisplay } from "@/components/AIResponseDisplay";

interface ResearchInsightsProps {
  result: string | null;
  isProcessing: boolean;
}

export const ResearchInsights = ({ result, isProcessing }: ResearchInsightsProps) => {
  if (!result && !isProcessing) return null;
  
  return (
    <Card className="p-4 md:p-6 dark:bg-slate-900">
      <h2 className="text-lg font-medium mb-3 dark:text-white">Research Insights</h2>
      <AIResponseDisplay content={result} isProcessing={isProcessing} />
    </Card>
  );
};
