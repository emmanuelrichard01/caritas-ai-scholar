
import { useState } from "react";
import { Book, Upload, FileText, Brain, Lightbulb, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { PageLayout } from "@/components/PageLayout";
import { FileUploader } from "@/components/FileUploader";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { StudyToolTabs } from "@/components/studytools/StudyToolTabs";
import { FlashcardItem } from "@/components/studytools/Flashcard";
import { QuizQuestion } from "@/components/studytools/QuizComponent";
import { Material, Segment, Summary, Flashcard, Quiz, QuizType } from "@/types/database";

const CourseTutor = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { user } = useAuth();

  // Fetch user materials
  const { data: materials, isLoading: isLoadingMaterials, refetch: refetchMaterials } = useQuery({
    queryKey: ['materials', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching materials:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user
  });

  // Fetch segments for selected material
  const { data: segments, isLoading: isLoadingSegments } = useQuery({
    queryKey: ['segments', selectedMaterial],
    queryFn: async () => {
      if (!selectedMaterial) return [];
      
      const { data, error } = await supabase
        .from('segments')
        .select('*')
        .eq('material_id', selectedMaterial)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error("Error fetching segments:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!selectedMaterial
  });

  // Get study aids for selected segment
  const { data: summaries, refetch: refetchSummaries } = useQuery({
    queryKey: ['summaries', selectedSegment],
    queryFn: async () => {
      if (!selectedSegment) return [];
      const { data, error } = await supabase.from('summaries').select('*').eq('segment_id', selectedSegment);
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedSegment
  });

  const { data: flashcards, refetch: refetchFlashcards } = useQuery({
    queryKey: ['flashcards', selectedSegment],
    queryFn: async () => {
      if (!selectedSegment) return [];
      const { data, error } = await supabase.from('flashcards').select('*').eq('segment_id', selectedSegment);
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedSegment
  });

  const { data: quizzes, refetch: refetchQuizzes } = useQuery({
    queryKey: ['quizzes', selectedSegment],
    queryFn: async () => {
      if (!selectedSegment) return [];
      const { data, error } = await supabase.from('quizzes').select('*').eq('segment_id', selectedSegment);
      if (error) throw error;
      return (data || []).map(quiz => ({
        ...quiz,
        type: (quiz.type === 'mcq' || quiz.type === 'short' ? quiz.type : 'mcq') as QuizType
      }));
    },
    enabled: !!selectedSegment
  });

  const handleUploadMaterial = async () => {
    if (!user || !title.trim() || files.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Create material record
      const { data: material, error: materialError } = await supabase
        .from('materials')
        .insert({
          user_id: user.id,
          title: title.trim(),
        })
        .select()
        .single();
      
      if (materialError) throw materialError;
      
      // Process files
      await Promise.all(files.map(async (file) => {
        const filePath = `${user.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        const { error: uploadError } = await supabase.storage
          .from('course-materials')
          .upload(filePath, file);
        
        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
        
        const { error: processError } = await supabase.functions.invoke('process-course-material', {
          body: {
            filePath,
            title: file.name,
            userId: user.id,
            materialId: material.id
          }
        });
        
        if (processError) throw new Error(`Processing failed: ${processError.message}`);
      }));
      
      toast.success("Material uploaded and processed successfully");
      setFiles([]);
      setTitle("");
      refetchMaterials();
      setSelectedMaterial(material.id);
      setActiveTab("library");
      
    } catch (error) {
      console.error("Error uploading material:", error);
      toast.error("Failed to upload material: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsUploading(false);
    }
  };

  const generateStudyAid = async (type: 'summary' | 'flashcards' | 'quiz') => {
    if (!selectedSegment) {
      toast.error("Please select a segment first");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const { error } = await supabase.functions.invoke('generate-study-aids', {
        body: { segmentId: selectedSegment, type }
      });
      
      if (error) throw error;
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} generated successfully`);
      
      // Refresh the appropriate data
      if (type === 'summary') refetchSummaries();
      else if (type === 'flashcards') refetchFlashcards();
      else if (type === 'quiz') refetchQuizzes();
      
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      toast.error(`Failed to generate ${type}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentSegment = segments?.find(s => s.id === selectedSegment);
  
  // Convert for StudyToolTabs
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

  return (
    <PageLayout
      title="Course Tutor"
      subtitle="Upload course materials and generate AI-powered study aids with advanced learning analytics"
      icon={<Book className="h-6 w-6" />}
    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Materials</p>
                <p className="text-2xl font-bold">{materials?.length || 0}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Study Aids</p>
                <p className="text-2xl font-bold">{(summaries?.length || 0) + (flashcards?.length || 0) + (quizzes?.length || 0)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <Target className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <Progress value={selectedSegment ? 75 : 0} className="mt-1" />
              </div>
            </div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="study">Study Tools</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Upload className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Upload Course Materials</h2>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Material Title</label>
                  <Input
                    placeholder="e.g., Introduction to Computer Science"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <FileUploader 
                  files={files} 
                  onFilesChange={setFiles}
                  maxFiles={5}
                  maxSizeMB={50}
                  supportedFormats="PDF, DOC, DOCX, PPT, PPTX, TXT"
                  acceptTypes=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                />
                
                <Button 
                  onClick={handleUploadMaterial} 
                  disabled={isUploading || !title.trim() || files.length === 0}
                  className="w-full"
                >
                  {isUploading ? "Processing..." : "Upload & Process Material"}
                </Button>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="library" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">My Materials</h2>
                {isLoadingMaterials ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : materials?.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No materials uploaded yet</p>
                    <Button variant="link" onClick={() => setActiveTab("upload")}>
                      Upload your first material
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {materials?.map((material) => (
                      <div 
                        key={material.id} 
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedMaterial === material.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedMaterial(material.id)}
                      >
                        <h3 className="font-medium">{material.title}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(material.uploaded_at).toLocaleDateString()}
                        </p>
                        {selectedMaterial === material.id && (
                          <Badge variant="secondary" className="mt-2">Selected</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
              
              {selectedMaterial && (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Segments</h2>
                  {isLoadingSegments ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : segments?.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No segments available</p>
                  ) : (
                    <div className="space-y-3">
                      {segments?.map((segment, index) => (
                        <div 
                          key={segment.id} 
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedSegment === segment.id ? 'bg-green-50 border-green-200' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setSelectedSegment(segment.id)}
                        >
                          <h4 className="font-medium">
                            {segment.title || `Segment ${index + 1}`}
                          </h4>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {segment.text.substring(0, 100)}...
                          </p>
                          {selectedSegment === segment.id && (
                            <Badge variant="secondary" className="mt-2">Active</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="study" className="space-y-4">
            {!selectedSegment ? (
              <Card className="p-8 text-center">
                <Lightbulb className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Ready to Study?</h3>
                <p className="text-gray-600 mb-4">
                  Select a material and segment from the Library tab to generate study aids
                </p>
                <Button onClick={() => setActiveTab("library")}>
                  Go to Library
                </Button>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Study Aid Generation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold">Summary</h3>
                      <p className="text-sm text-gray-600">Key points and highlights</p>
                      <Button 
                        onClick={() => generateStudyAid('summary')}
                        disabled={isProcessing}
                        size="sm"
                        className="w-full"
                      >
                        {summaries?.length ? 'Regenerate' : 'Generate'}
                      </Button>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                        <Brain className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold">Flashcards</h3>
                      <p className="text-sm text-gray-600">Q&A for memorization</p>
                      <Button 
                        onClick={() => generateStudyAid('flashcards')}
                        disabled={isProcessing}
                        size="sm"
                        className="w-full"
                      >
                        {flashcards?.length ? 'Regenerate' : 'Generate'}
                      </Button>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto">
                        <Target className="h-6 w-6 text-purple-600" />
                      </div>
                      <h3 className="font-semibold">Quiz</h3>
                      <p className="text-sm text-gray-600">Test your knowledge</p>
                      <Button 
                        onClick={() => generateStudyAid('quiz')}
                        disabled={isProcessing}
                        size="sm"
                        className="w-full"
                      >
                        {quizzes?.length ? 'Regenerate' : 'Generate'}
                      </Button>
                    </div>
                  </Card>
                </div>
                
                {/* Study Tools Display */}
                {(notes || flashcardItems || quizItems) && (
                  <StudyToolTabs 
                    notes={notes} 
                    flashcards={flashcardItems} 
                    quizQuestions={quizItems}
                    materialContext={currentSegment?.text || ''}
                  />
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Learning Analytics</h2>
              <div className="text-center py-12">
                <Target className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
                <p className="text-gray-600">
                  Track your learning progress, study patterns, and performance metrics
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Coming soon with study session tracking and performance insights
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default CourseTutor;
