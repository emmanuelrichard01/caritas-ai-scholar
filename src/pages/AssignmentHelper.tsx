
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, Calendar, AlertCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useAIProcessor } from "@/hooks/useAIProcessor";
import { useIsMobile } from "@/hooks/use-mobile";
import { FormattedContent } from "@/components/FormattedContent";
import { AssignmentTips } from "@/components/AssignmentTips";

const AssignmentHelper = () => {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const { processQuery, isProcessing } = useAIProcessor();

  const handleAnalyze = async () => {
    if (!prompt.trim()) {
      return;
    }
    
    const response = await processQuery(prompt, 'assignment-helper');
    if (response) {
      setResult(response);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navigation />
      
      <div className="flex-1 pl-[70px] md:pl-[260px] transition-all duration-300">
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center mb-6 md:mb-8 gap-4 md:gap-0">
            <div className="h-12 w-12 rounded-full bg-amber-600 flex items-center justify-center text-white md:mr-4">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold dark:text-white">Assignment Decomposer</h1>
              <p className="text-muted-foreground dark:text-slate-400">Break down complex assignments into manageable steps</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border mb-4 md:mb-6 dark:bg-slate-900 dark:border-slate-800">
                <h2 className="text-lg font-medium mb-4 dark:text-white">Enter Your Assignment Prompt</h2>
                
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Paste your assignment description or prompt here..."
                  className="min-h-[200px] mb-4 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                
                <Button 
                  onClick={handleAnalyze} 
                  disabled={isProcessing || !prompt.trim()}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  {isProcessing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Analyze Assignment
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className={`${isMobile && result ? 'hidden' : ''}`}>
              <AssignmentTips />
            </div>
          </div>
          
          {result && (
            <div className="mt-4 md:mt-6 bg-white rounded-xl p-4 md:p-6 shadow-sm border dark:bg-slate-900 dark:border-slate-800">
              <h2 className="text-lg font-medium mb-4 dark:text-white">Assignment Analysis</h2>
              <div className="prose prose-slate max-w-none dark:prose-invert">
                <FormattedContent content={result} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentHelper;
