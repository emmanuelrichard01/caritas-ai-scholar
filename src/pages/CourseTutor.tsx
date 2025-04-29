
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Book, FileUp, Search, X } from "lucide-react";
import { toast } from "sonner";
import { useAIProcessor } from "@/hooks/useAIProcessor";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { FileList } from "@/components/FileList";
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

  // Check if storage bucket exists, create if not
  const checkAndCreateBucket = async () => {
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error("Error listing buckets:", listError);
        return;
      }
      
      const bucketExists = buckets?.some(bucket => bucket.name === 'course-materials');
      
      if (!bucketExists) {
        const { error } = await supabase.storage.createBucket('course-materials', {
          public: false
        });
        
        if (error) console.error("Error creating bucket:", error);
      }
    } catch (error) {
      console.error("Error checking buckets:", error);
    }
  };

  // Properly use useEffect for side effects instead of useState
  useEffect(() => {
    checkAndCreateBucket();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      toast.success(`Added ${e.target.files.length} file(s)`);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

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
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navigation />
      
      <div className="flex-1 pl-[70px] md:pl-[260px] transition-all duration-300">
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center mb-6 md:mb-8 gap-4 md:gap-0">
            <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white md:mr-4">
              <Book className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold dark:text-white">Course Concept Tutor</h1>
              <p className="text-muted-foreground dark:text-slate-400">Upload course materials and get AI explanations</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border mb-6 dark:bg-slate-900 dark:border-slate-800">
            <h2 className="text-lg font-medium mb-4 dark:text-white">Upload Course Materials</h2>
            
            <div className="mb-4">
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('file-input')?.click()}
                className="dark:border-slate-700 dark:text-slate-300 w-full md:w-auto"
              >
                <FileUp className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
              <Input
                id="file-input"
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              />
              <p className="text-xs text-muted-foreground mt-2 dark:text-slate-500">
                Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT
              </p>
            </div>
            
            <FileList files={files} onRemoveFile={removeFile} />
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
        </div>
      </div>
    </div>
  );
};

export default CourseTutor;
