
import { useState } from "react";
import { Book, Upload, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { PageLayout } from "@/components/PageLayout";
import { FileUploader } from "@/components/FileUploader";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { StudyToolTabs } from "@/components/studytools/StudyToolTabs";
import { FlashcardItem } from "@/components/studytools/Flashcard";
import { QuizQuestion } from "@/components/studytools/QuizComponent";
import { Material, Segment, Summary, Flashcard, Quiz } from "@/types/database";

// Component for the material upload tab
const MaterialUploader = ({ 
  files, 
  setFiles, 
  title, 
  setTitle, 
  handleUploadMaterial, 
  isUploading 
}: { 
  files: File[],
  setFiles: (files: File[]) => void,
  title: string, 
  setTitle: (title: string) => void,
  handleUploadMaterial: () => Promise<void>,
  isUploading: boolean
}) => {
  return (
    <Card className="p-4 md:p-6 dark:bg-slate-900">
      <h2 className="text-lg font-medium mb-4 dark:text-white">Upload Course Materials</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Material Title
          </label>
          <Input
            id="title"
            placeholder="Introduction to Biology"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
        
        <FileUploader 
          files={files} 
          onFilesChange={setFiles}
          maxFiles={5}
          maxSizeMB={20}
          supportedFormats="PDF, DOC, DOCX, PPT, PPTX, TXT"
          acceptTypes=".pdf,.doc,.docx,.ppt,.pptx,.txt"
        />
        
        <Button 
          onClick={handleUploadMaterial} 
          disabled={isUploading || !title.trim() || files.length === 0}
          className="w-full md:w-auto"
        >
          {isUploading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Material
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

// Component to display the list of materials
const MaterialsList = ({ 
  materials, 
  isLoading, 
  selectedMaterial, 
  setSelectedMaterial, 
  setActiveTab 
}: { 
  materials: Material[] | undefined, 
  isLoading: boolean, 
  selectedMaterial: string | null, 
  setSelectedMaterial: (id: string) => void,
  setActiveTab: (tab: string) => void
}) => {
  return (
    <Card className="p-4 md:p-6 dark:bg-slate-900">
      <h2 className="text-lg font-medium mb-4 dark:text-white">My Materials</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        </div>
      ) : !materials || materials.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <FileText className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
          <p className="text-gray-500 dark:text-gray-400">No materials uploaded yet</p>
          <Button 
            variant="link" 
            className="mt-2"
            onClick={() => setActiveTab("upload")}
          >
            Upload your first material
          </Button>
        </div>
      ) : (
        <div className="divide-y dark:divide-slate-800">
          {materials.map((material) => (
            <div 
              key={material.id} 
              className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded px-2 cursor-pointer"
              onClick={() => setSelectedMaterial(material.id)}
            >
              <div>
                <h3 className="font-medium">{material.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Uploaded {new Date(material.uploaded_at).toLocaleString()}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
              >
                View
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// Component to display segments of a material
const SegmentsList = ({ 
  segments, 
  isLoading, 
  selectedSegment, 
  setSelectedSegment 
}: { 
  segments: Segment[] | undefined, 
  isLoading: boolean, 
  selectedSegment: string | null, 
  setSelectedSegment: (id: string) => void
}) => {
  return (
    <Card className="p-4 md:p-6 dark:bg-slate-900">
      <h2 className="text-lg font-medium mb-4 dark:text-white">Segments</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
        </div>
      ) : !segments || segments.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No segments available</p>
        </div>
      ) : (
        <div className="divide-y dark:divide-slate-800">
          {segments.map((segment) => (
            <div 
              key={segment.id} 
              className={`py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded px-2 cursor-pointer ${
                selectedSegment === segment.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              onClick={() => setSelectedSegment(segment.id)}
            >
              <div>
                <h3 className="font-medium">{segment.title || "Segment " + segment.id.substring(0, 8)}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {segment.text.substring(0, 100)}...
                </p>
              </div>
              <Button 
                variant={selectedSegment === segment.id ? "secondary" : "ghost"}
                size="sm"
              >
                Select
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// Component for the Study tab content
const StudyContent = ({
  selectedSegment,
  setActiveTab,
  summaries,
  flashcards,
  quizzes,
  segment,
  handleGenerateSummary,
  handleGenerateFlashcards,
  handleGenerateQuiz,
  isProcessing
}: {
  selectedSegment: string | null,
  setActiveTab: (tab: string) => void,
  summaries: Summary[] | undefined,
  flashcards: Flashcard[] | undefined,
  quizzes: Quiz[] | undefined,
  segment: Segment | undefined,
  handleGenerateSummary: () => Promise<void>,
  handleGenerateFlashcards: () => Promise<void>,
  handleGenerateQuiz: () => Promise<void>,
  isProcessing: boolean
}) => {
  // Convert database types to component prop types
  const flashcardItems: FlashcardItem[] | null = flashcards?.map(card => ({
    question: card.question,
    answer: card.answer
  })) || null;
  
  const quizItems: QuizQuestion[] | null = quizzes?.map(quiz => ({
    question: quiz.prompt,
    options: quiz.choices || ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: quiz.choices?.indexOf(quiz.correct_answer) || 0,
    explanation: quiz.explanation
  })) || null;
  
  const notes: string | null = summaries && summaries.length > 0 
    ? summaries[0].bullets.map(bullet => `• ${bullet}`).join('\n\n')
    : null;
    
  const materialContext = segment?.text || '';
  
  if (!selectedSegment) {
    return (
      <Card className="p-6 text-center dark:bg-slate-900">
        <FileText className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium mb-2 dark:text-white">No Segment Selected</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Please select a material and segment to generate study aids
        </p>
        <Button onClick={() => setActiveTab("materials")}>
          Select Material
        </Button>
      </Card>
    );
  }
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-4 md:p-6 dark:bg-slate-900">
          <h2 className="text-lg font-medium mb-2 dark:text-white flex items-center">
            <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-2">1</span>
            Summaries
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Generate key point summaries for quick review
          </p>
          
          <Button 
            onClick={handleGenerateSummary}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? 'Generating...' : 'Generate Summary'}
          </Button>
          
          {summaries && summaries.length > 0 && (
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
              <h4 className="font-medium mb-2 text-sm">Key Points:</h4>
              <ul className="list-disc pl-4 space-y-2">
                {summaries[0].bullets.map((bullet, index) => (
                  <li key={index} className="text-sm">{bullet}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
        
        <Card className="p-4 md:p-6 dark:bg-slate-900">
          <h2 className="text-lg font-medium mb-2 dark:text-white flex items-center">
            <span className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mr-2">2</span>
            Flashcards
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Create question-answer flashcards for memorization
          </p>
          
          <Button 
            onClick={handleGenerateFlashcards}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? 'Generating...' : 'Generate Flashcards'}
          </Button>
          
          {flashcards && flashcards.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2 text-sm">Sample Flashcard:</h4>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                <p className="font-medium text-sm">Q: {flashcards[0].question}</p>
                <p className="text-sm mt-2 pt-2 border-t dark:border-slate-700">A: {flashcards[0].answer}</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-right">
                {flashcards.length} flashcards available
              </p>
            </div>
          )}
        </Card>
        
        <Card className="p-4 md:p-6 dark:bg-slate-900">
          <h2 className="text-lg font-medium mb-2 dark:text-white flex items-center">
            <span className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 mr-2">3</span>
            Quizzes
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Test your knowledge with AI-generated quizzes
          </p>
          
          <Button 
            onClick={handleGenerateQuiz}
            disabled={isProcessing}
            className="w-full"
          >
            {isProcessing ? 'Generating...' : 'Generate Quiz'}
          </Button>
          
          {quizzes && quizzes.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2 text-sm">Sample Question:</h4>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                <p className="font-medium text-sm">{quizzes[0].prompt}</p>
                {quizzes[0].type === 'mcq' && quizzes[0].choices && (
                  <div className="mt-2 space-y-1">
                    {quizzes[0].choices.map((choice, i) => (
                      <div key={i} className="flex items-center">
                        <div className="w-5 h-5 rounded-full border dark:border-slate-600 flex items-center justify-center text-xs mr-2">
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span className="text-sm">{choice}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-right">
                {quizzes.length} questions available
              </p>
            </div>
          )}
        </Card>
      </div>
      
      {/* Study tools component displaying all generated study aids */}
      {(notes || flashcardItems || quizItems) && (
        <StudyToolTabs 
          notes={notes} 
          flashcards={flashcardItems} 
          quizQuestions={quizItems}
          materialContext={materialContext}
        />
      )}
    </>
  );
};

// Database placeholder component for development/testing
const DatabasePlaceholder = () => (
  <div className="p-6 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
    <div className="flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
      <div>
        <h3 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">
          Database Setup Required
        </h3>
        <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-4">
          The Course Tutor requires database tables, storage buckets, and edge functions to be created first.
          Please refer to the documentation or contact the administrator to complete the setup.
        </p>
        <div className="text-xs text-yellow-600 dark:text-yellow-500 font-mono bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded">
          Required: materials, segments, summaries, flashcards, quizzes tables and related edge functions.
        </div>
      </div>
    </div>
  </div>
);

// Main Course Tutor component
const CourseTutor = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Fetch user materials
  const { data: materials, isLoading: isLoadingMaterials, refetch: refetchMaterials } = useQuery({
    queryKey: ['materials', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Use a placeholder mock fetch since we don't have the tables yet
      // In production, this would be replaced with actual Supabase queries
      const mockMaterials: Material[] = [
        {
          id: "1",
          user_id: user.id,
          title: "Introduction to Biology",
          uploaded_at: new Date().toISOString()
        },
        {
          id: "2",
          user_id: user.id,
          title: "Advanced Mathematics",
          uploaded_at: new Date().toISOString()
        }
      ];
      
      return mockMaterials;
    },
    enabled: !!user
  });

  // Fetch segments for selected material
  const { data: segments, isLoading: isLoadingSegments } = useQuery({
    queryKey: ['segments', selectedMaterial],
    queryFn: async () => {
      if (!selectedMaterial) return [];
      
      // Mock segments data
      const mockSegments: Segment[] = [
        {
          id: "101",
          material_id: selectedMaterial,
          title: "Chapter 1: Introduction",
          text: "This is the introduction to the selected material."
        },
        {
          id: "102",
          material_id: selectedMaterial,
          title: "Chapter 2: Fundamentals",
          text: "This section covers the fundamental concepts."
        }
      ];
      
      return mockSegments;
    },
    enabled: !!selectedMaterial
  });

  // Get the current selected segment data
  const currentSegment = segments?.find(s => s.id === selectedSegment);

  // Fetch summaries for selected segment
  const { data: summaries, refetch: refetchSummaries } = useQuery({
    queryKey: ['summaries', selectedSegment],
    queryFn: async () => {
      if (!selectedSegment) return [];
      
      // Mock summaries
      const mockSummaries: Summary[] = [
        {
          id: "s1",
          segment_id: selectedSegment,
          bullets: [
            "First key point about this segment",
            "Second important concept to remember",
            "Third significant detail from the material"
          ]
        }
      ];
      
      return mockSummaries;
    },
    enabled: !!selectedSegment
  });

  // Fetch flashcards for selected segment
  const { data: flashcards, refetch: refetchFlashcards } = useQuery({
    queryKey: ['flashcards', selectedSegment],
    queryFn: async () => {
      if (!selectedSegment) return [];
      
      // Mock flashcards
      const mockFlashcards: Flashcard[] = [
        {
          id: "f1",
          segment_id: selectedSegment,
          question: "What is the main topic of this segment?",
          answer: "The main topic is the introduction to the subject matter.",
          next_review: new Date().toISOString().split('T')[0]
        },
        {
          id: "f2",
          segment_id: selectedSegment,
          question: "Why is this concept important?",
          answer: "It's important because it forms the foundation for advanced topics.",
          next_review: new Date().toISOString().split('T')[0]
        }
      ];
      
      return mockFlashcards;
    },
    enabled: !!selectedSegment
  });

  // Fetch quizzes for selected segment
  const { data: quizzes, refetch: refetchQuizzes } = useQuery({
    queryKey: ['quizzes', selectedSegment],
    queryFn: async () => {
      if (!selectedSegment) return [];
      
      // Mock quizzes
      const mockQuizzes: Quiz[] = [
        {
          id: "q1",
          segment_id: selectedSegment,
          type: "mcq",
          prompt: "Which of the following best describes the main concept?",
          choices: [
            "A fundamental principle in the field",
            "An advanced application",
            "A historical perspective",
            "A theoretical framework"
          ],
          correct_answer: "A fundamental principle in the field",
          explanation: "This is correct because it accurately describes the core concept discussed in the segment."
        }
      ];
      
      return mockQuizzes;
    },
    enabled: !!selectedSegment
  });

  const handleUploadMaterial = async () => {
    if (!user) {
      toast.error("Please sign in to upload materials");
      return;
    }
    
    if (!title.trim()) {
      toast.error("Please enter a title for your material");
      return;
    }
    
    if (files.length === 0) {
      toast.error("Please select files to upload");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Call the upload-material edge function
      const { data, error } = await supabase.functions.invoke('upload-material', {
        body: {
          userId: user.id,
          title: title,
          files: files.map(file => ({
            name: file.name,
            type: file.type,
            size: file.size
          }))
        }
      });
      
      if (error) throw error;
      
      // Get presigned URLs for direct upload
      const uploadUrls = data.uploadUrls;
      
      // Upload files directly
      const uploadPromises = files.map(async (file, index) => {
        const url = uploadUrls[index];
        const response = await fetch(url, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type
          }
        });
        
        if (!response.ok) throw new Error(`Failed to upload ${file.name}`);
        return response;
      });
      
      await Promise.all(uploadPromises);
      
      // Process the uploaded files
      const { data: processingData, error: processingError } = await supabase.functions.invoke('process-material', {
        body: {
          materialId: data.materialId,
          userId: user.id
        }
      });
      
      if (processingError) throw processingError;
      
      toast.success("Material uploaded and processed successfully");
      setFiles([]);
      setTitle("");
      refetchMaterials();
      
      // Switch to the materials tab
      setActiveTab("materials");
      
    } catch (error) {
      console.error("Error uploading material:", error);
      toast.error("Failed to upload material: " + 
        (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!selectedSegment) {
      toast.error("Please select a segment first");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('summarize', {
        body: {
          segmentId: selectedSegment,
          userId: user?.id
        }
      });
      
      if (error) throw error;
      
      toast.success("Summary generated successfully");
      
      // Refetch summaries
      refetchSummaries();
      
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate summary: " + 
        (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!selectedSegment) {
      toast.error("Please select a segment first");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Temporary flashcard generation - will be replaced with edge function
      if (user && currentSegment) {
        // Example flashcards for testing
        const demoFlashcards = [
          {
            segment_id: selectedSegment,
            question: "What is the main topic of this segment?",
            answer: `This segment discusses "${currentSegment.title}"`,
            next_review: new Date().toISOString().split('T')[0]
          },
          {
            segment_id: selectedSegment,
            question: "Why is this topic important?",
            answer: "It's a fundamental concept in this field of study",
            next_review: new Date().toISOString().split('T')[0]
          }
        ];
        
        // Insert demo flashcards into the database
        const { error } = await supabase
          .from('flashcards')
          .upsert(demoFlashcards);
          
        if (error) throw error;
      }
      
      toast.success("Flashcards generated successfully");
      
      // Refetch flashcards
      refetchFlashcards();
      
    } catch (error) {
      console.error("Error generating flashcards:", error);
      toast.error("Failed to generate flashcards: " + 
        (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!selectedSegment) {
      toast.error("Please select a segment first");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Temporary quiz generation - will be replaced with edge function
      if (user && currentSegment) {
        // Example quiz for testing
        const demoQuiz = {
          segment_id: selectedSegment,
          type: 'mcq',
          prompt: `What is the main focus of "${currentSegment.title}"?`,
          choices: ["Learning the fundamentals", "Advanced techniques", "Historical perspective", "Practical applications"],
          correct_answer: "Learning the fundamentals",
          explanation: "This segment primarily introduces the fundamental concepts of the topic."
        };
        
        // Insert demo quiz into the database
        const { error } = await supabase
          .from('quizzes')
          .upsert([demoQuiz as any]);
          
        if (error) throw error;
      }
      
      toast.success("Quiz generated successfully");
      
      // Refetch quizzes
      refetchQuizzes();
      
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast.error("Failed to generate quiz: " + 
        (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PageLayout
      title="Course Tutor"
      subtitle="Upload course materials and create AI-powered study aids"
      icon={<Book className="h-6 w-6" />}
    >
      <Tabs 
        defaultValue="upload" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-3/4">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="study">Study</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <MaterialUploader 
            files={files}
            setFiles={setFiles}
            title={title}
            setTitle={setTitle}
            handleUploadMaterial={handleUploadMaterial}
            isUploading={isUploading}
          />
        </TabsContent>
        
        <TabsContent value="materials" className="space-y-4">
          <MaterialsList 
            materials={materials}
            isLoading={isLoadingMaterials}
            selectedMaterial={selectedMaterial}
            setSelectedMaterial={setSelectedMaterial}
            setActiveTab={setActiveTab}
          />
          
          {selectedMaterial && (
            <SegmentsList
              segments={segments}
              isLoading={isLoadingSegments}
              selectedSegment={selectedSegment}
              setSelectedSegment={setSelectedSegment}
            />
          )}
        </TabsContent>
        
        <TabsContent value="study" className="space-y-4">
          <StudyContent
            selectedSegment={selectedSegment}
            setActiveTab={setActiveTab}
            summaries={summaries}
            flashcards={flashcards}
            quizzes={quizzes}
            segment={currentSegment}
            handleGenerateSummary={handleGenerateSummary}
            handleGenerateFlashcards={handleGenerateFlashcards}
            handleGenerateQuiz={handleGenerateQuiz}
            isProcessing={isProcessing}
          />
        </TabsContent>
        
        <TabsContent value="progress" className="space-y-4">
          <Card className="p-4 md:p-6 dark:bg-slate-900">
            <h2 className="text-lg font-medium mb-4 dark:text-white">Progress Dashboard</h2>
            
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Progress tracking will be available once you've completed some study activities
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default CourseTutor;
