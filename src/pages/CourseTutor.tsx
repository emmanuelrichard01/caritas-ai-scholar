
import { useState } from "react";
import { Book, Search, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { PageLayout } from "@/components/PageLayout";
import { FileUploader } from "@/components/FileUploader";
import { AIResponseDisplay } from "@/components/AIResponseDisplay";
import { StudyToolTabs } from "@/components/studytools/StudyToolTabs";
import { useStudyMaterials } from "@/hooks/useStudyMaterials";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

const CourseTutor = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [query, setQuery] = useState("");
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const {
    isGenerating,
    notes,
    flashcards,
    quizQuestions,
    materialContext,
    generateStudyMaterials
  } = useStudyMaterials();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error("Please enter a focus area for your study materials");
      return;
    }
    
    if (files.length === 0) {
      toast.error("Please upload at least one file");
      return;
    }
    
    await generateStudyMaterials(files, query);
  };

  return (
    <PageLayout
      title="Course Concept Tutor"
      subtitle="Transform your course materials into interactive study aids"
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
            <h2 className="text-lg font-medium mb-4 dark:text-white">Generate Study Materials</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col md:flex-row gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What would you like to focus on? (e.g., 'key concepts in chapter 3')"
                  className="dark:border-slate-700 dark:bg-slate-800 dark:text-white flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={isGenerating || files.length === 0}
                  className={`${isMobile ? "w-full" : ""} bg-blue-600 hover:bg-blue-700`}
                >
                  {isGenerating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Generate Materials
                    </>
                  )}
                </Button>
              </div>
            </form>
            
            <StudyToolTabs 
              notes={notes}
              flashcards={flashcards}
              quizQuestions={quizQuestions}
              materialContext={materialContext}
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
                <AccordionTrigger className="text-sm">Study Material Generation</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Our AI analyzes your course materials and transforms them into structured notes, flashcards, and quizzes. It extracts key concepts, definitions, and important points to help you learn efficiently.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-sm">Interactive Study Tools</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Use the generated notes for comprehensive review, flashcards for memorization, and quizzes to test your understanding. You can also chat with our AI to ask specific questions about your materials.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-sm">Supported File Types</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Upload PDF, DOC, DOCX, PPT, PPTX, and TXT files. The maximum file size is 20MB per file, with a limit of 5 files per generation.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-sm">Tips for Best Results</AccordionTrigger>
                <AccordionContent>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2 list-disc pl-5">
                    <li>Use clear, well-formatted documents</li>
                    <li>Be specific in your focus area query</li>
                    <li>Upload related materials for comprehensive study aids</li>
                    <li>For complex subjects, focus on one topic at a time</li>
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
