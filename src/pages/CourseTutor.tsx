
import { useState } from "react";
import { Book, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAIProcessor } from "@/hooks/useAIProcessor";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { PageLayout } from "@/components/PageLayout";
import { FileUploader } from "@/components/FileUploader";
import { AIResponseDisplay } from "@/components/AIResponseDisplay";

const CourseTutor = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string | null>(null);
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { processDocuments, isProcessing } = useAIProcessor({
    onSuccess: (data) => {
      setResults(data.answer);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error("Please enter a question");
      return;
    }
    
    if (files.length === 0) {
      toast.error("Please upload at least one file");
      return;
    }
    
    setResults(null);
    await processDocuments(files, query);
  };

  return (
    <PageLayout
      title="Course Concept Tutor"
      subtitle="Upload course materials and get AI explanations"
      icon={<Book className="h-6 w-6" />}
    >
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border mb-6 dark:bg-slate-900 dark:border-slate-800">
        <h2 className="text-lg font-medium mb-4 dark:text-white">Upload Course Materials</h2>
        <FileUploader 
          files={files} 
          onFilesChange={setFiles} 
        />
      </div>
      
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border dark:bg-slate-900 dark:border-slate-800">
        <h2 className="text-lg font-medium mb-4 dark:text-white">Ask About Your Course</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about your course material..."
              className="dark:border-slate-700 dark:bg-slate-800 dark:text-white flex-1"
            />
            <Button 
              type="submit" 
              disabled={isProcessing || files.length === 0}
              className={isMobile ? "w-full" : ""}
            >
              {isProcessing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </form>
        
        <AIResponseDisplay 
          isProcessing={isProcessing} 
          results={results} 
        />
      </div>
    </PageLayout>
  );
};

export default CourseTutor;
