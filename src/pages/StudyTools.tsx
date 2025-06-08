
import { useState } from "react";
import { Book, FileText, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { PageLayout } from "@/components/PageLayout";
import { FileUploader } from "@/components/FileUploader";
import { Card } from "@/components/ui/card";
import { useStudyMaterials } from "@/hooks/useStudyMaterials";
import { StudyToolTabs } from "@/components/studytools/StudyToolTabs";

const StudyTools = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [query, setQuery] = useState("");
  
  const { user } = useAuth();
  const {
    isGenerating,
    notes,
    flashcards,
    quizQuestions,
    materialContext,
    generateStudyMaterials
  } = useStudyMaterials();

  const handleGenerateStudyMaterials = async () => {
    if (!user) {
      toast.error("Please log in to generate study materials");
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
      title="Study Tools"
      subtitle="Generate AI-powered study aids from your course materials"
      icon={<Brain className="h-6 w-6" />}
    >
      <div className="space-y-6">
        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
            <p className="font-medium">Authentication Required</p>
            <p className="text-sm">Please sign in to generate study materials.</p>
          </div>
        )}
        
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-4">
              <FileText className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Upload & Generate Study Materials</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Study Focus (Optional)</label>
              <Input
                placeholder="e.g., Focus on key concepts, important formulas, or specific topics..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isGenerating || !user}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Course Materials</label>
              <FileUploader 
                files={files} 
                onFilesChange={setFiles}
                maxFiles={3}
                maxSizeMB={20}
                supportedFormats="PDF, DOC, DOCX, PPT, PPTX, TXT"
                acceptTypes=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              />
            </div>
            
            <Button 
              onClick={handleGenerateStudyMaterials} 
              disabled={isGenerating || files.length === 0 || !user}
              className="w-full"
              size="lg"
            >
              {isGenerating ? "Generating Study Materials..." : `Generate Study Tools from ${files.length} File(s)`}
            </Button>
          </div>
        </Card>
        
        <StudyToolTabs 
          notes={notes}
          flashcards={flashcards}
          quizQuestions={quizQuestions}
          materialContext={materialContext}
        />
      </div>
    </PageLayout>
  );
};

export default StudyTools;
