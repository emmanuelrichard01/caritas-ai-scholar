
import { useState } from "react";
import { Book, Search, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAIProcessor } from "@/hooks/useAIProcessor";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { PageLayout } from "@/components/PageLayout";
import { FileUploader } from "@/components/FileUploader";
import { AIResponseDisplay } from "@/components/AIResponseDisplay";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border mb-6 dark:bg-slate-900 dark:border-slate-800">
            <h2 className="text-lg font-medium mb-4 dark:text-white">Upload Course Materials</h2>
            <FileUploader 
              files={files} 
              onFilesChange={setFiles}
              maxFiles={5}
              maxSizeMB={20}
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
        </div>
        
        <div className="hidden lg:block">
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border dark:bg-slate-900 dark:border-slate-800 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-medium dark:text-white">How It Works</h2>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-sm">What files can I upload?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    You can upload PDF, DOC, DOCX, PPT, PPTX, and TXT files. The maximum file size is 20MB per file, with a limit of 5 files per query.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-sm">How to get the best results?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Upload clear, well-formatted documents with relevant information. Ask specific questions rather than broad ones. For example, instead of "Tell me about this course," try "Explain the concept of polymorphism discussed on page 3."
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-sm">Is my data secure?</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Yes! Your uploaded files and questions are only accessible to you. Files are stored securely with row-level security ensuring only you can access your own documents.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-sm">Example questions to ask</AccordionTrigger>
                <AccordionContent>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-5">
                    <li>Explain the key concepts in chapter 3</li>
                    <li>Summarize the main points about neural networks</li>
                    <li>What are the differences between X and Y discussed in the document?</li>
                    <li>Create a study guide based on these materials</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CourseTutor;
