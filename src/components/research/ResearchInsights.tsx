
import { Card } from "@/components/ui/card";
import { AIResponseDisplay } from "@/components/AIResponseDisplay";
import { Brain, Sparkles } from "lucide-react";

interface ResearchInsightsProps {
  result: string | null;
  isProcessing: boolean;
}

export const ResearchInsights = ({ result, isProcessing }: ResearchInsightsProps) => {
  if (!result && !isProcessing) return null;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
          <Brain className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">AI Research Insights</h2>
          <p className="text-sm text-muted-foreground">
            Intelligent analysis of your research topic
          </p>
        </div>
        {!isProcessing && result && (
          <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
        )}
      </div>
      
      <AIResponseDisplay 
        content={result} 
        isProcessing={isProcessing}
        variant="research"
        showFeedback={true}
      />
    </div>
  );
};
