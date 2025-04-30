
import { useState } from "react";
import { Book, PenTool, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { AIResponseDisplay } from "@/components/AIResponseDisplay";
import { PageLayout } from "@/components/PageLayout";
import { useAIProcessor } from "@/hooks/useAIProcessor";
import { AssignmentTips } from "@/components/AssignmentTips";
import { FileUploader } from "@/components/FileUploader";

const AssignmentHelper = () => {
  const [query, setQuery] = useState("");
  const [assignmentType, setAssignmentType] = useState("essay");
  const [instructions, setInstructions] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const { processQuery, isProcessing, result } = useAIProcessor();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error("Please enter a question about your assignment");
      return;
    }
    
    try {
      // Build context with all available information
      const context = `
Assignment Type: ${assignmentType}
${instructions ? `Assignment Instructions: ${instructions}` : ''}
Question: ${query}
      `;
      
      await processQuery(context, "assignment-helper");
    } catch (error) {
      console.error("Error processing assignment query:", error);
      toast.error("Failed to process your request. Please try again.");
    }
  };
  
  return (
    <PageLayout
      title="Assignment Helper"
      subtitle="Get guidance and feedback on your academic assignments"
      icon={<PenTool className="h-6 w-6" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-4 md:p-6 space-y-4 dark:bg-slate-900">
            <h2 className="text-lg font-medium dark:text-white">Get Assignment Assistance</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Assignment Type</label>
                <select 
                  value={assignmentType}
                  onChange={(e) => setAssignmentType(e.target.value)}
                  className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                >
                  <option value="essay">Essay</option>
                  <option value="research-paper">Research Paper</option>
                  <option value="case-study">Case Study</option>
                  <option value="lab-report">Lab Report</option>
                  <option value="presentation">Presentation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Assignment Instructions (Optional)</label>
                <Textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Paste your assignment instructions here..."
                  className="min-h-[100px] dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Supporting Materials (Optional)</label>
                <FileUploader 
                  files={files} 
                  onFilesChange={setFiles}
                  maxFiles={3}
                  maxSizeMB={10}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-slate-300">Your Question</label>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What do you need help with? (e.g., 'How do I structure this essay?')"
                  className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={isProcessing || !query.trim()}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Get Help
                  </>
                )}
              </Button>
            </form>
          </Card>
          
          {result && (
            <AIResponseDisplay content={result} isProcessing={isProcessing} />
          )}
        </div>
        
        <div className="hidden lg:block">
          <AssignmentTips />
        </div>
      </div>
    </PageLayout>
  );
};

export default AssignmentHelper;
