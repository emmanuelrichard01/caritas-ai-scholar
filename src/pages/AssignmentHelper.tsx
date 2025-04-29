
import { useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PageLayout } from "@/components/PageLayout";
import { AssignmentTips } from "@/components/AssignmentTips";
import { useAIProcessor } from "@/hooks/useAIProcessor";
import { toast } from "sonner";
import { AIResponseDisplay } from "@/components/AIResponseDisplay";

const AssignmentHelper = () => {
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentDescription, setAssignmentDescription] = useState("");
  const [results, setResults] = useState<string | null>(null);
  
  const { processQuery, isProcessing } = useAIProcessor({
    onSuccess: (data) => {
      setResults(data.answer);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assignmentTitle.trim()) {
      toast.error("Please enter an assignment title");
      return;
    }
    
    if (!assignmentDescription.trim()) {
      toast.error("Please describe your assignment");
      return;
    }
    
    setResults(null);
    
    await processQuery(`
      Assignment Title: ${assignmentTitle}
      
      Assignment Description: ${assignmentDescription}
      
      Please help me break down this assignment into manageable tasks, suggest a structure,
      outline key components, and provide tips for completing it successfully.
    `, 'assignment-helper');
  };

  return (
    <PageLayout
      title="Assignment Helper"
      subtitle="Get help breaking down and planning your assignments"
      icon={<FileText className="h-6 w-6" />}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border dark:bg-slate-900 dark:border-slate-800">
            <h2 className="text-lg font-medium mb-4 dark:text-white">Assignment Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1 dark:text-slate-300">
                  Assignment Title
                </label>
                <Input
                  id="title"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  placeholder="Enter the title of your assignment"
                  className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1 dark:text-slate-300">
                  Assignment Description
                </label>
                <Textarea
                  id="description"
                  value={assignmentDescription}
                  onChange={(e) => setAssignmentDescription(e.target.value)}
                  placeholder="Paste or type your assignment instructions here..."
                  className="min-h-[200px] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isProcessing}
                className="w-full md:w-auto"
              >
                {isProcessing ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  "Break Down Assignment"
                )}
              </Button>
            </form>
            
            <AIResponseDisplay 
              isProcessing={isProcessing} 
              results={results} 
            />
          </div>
        </div>
        
        <div className="hidden md:block">
          <AssignmentTips />
        </div>
      </div>
      
      <div className="mt-6 md:hidden">
        <AssignmentTips />
      </div>
    </PageLayout>
  );
};

export default AssignmentHelper;
