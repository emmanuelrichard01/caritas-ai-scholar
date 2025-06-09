
import { useState } from "react";
import { Book, Upload, FileText, Brain, Lightbulb, Zap, GraduationCap, BookOpen, Sparkles, Trash2, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { PageLayout } from "@/components/PageLayout";
import { FileUploader } from "@/components/FileUploader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useStudyMaterials } from "@/hooks/useStudyMaterials";
import { StudyToolTabs } from "@/components/studytools/StudyToolTabs";
import { Badge } from "@/components/ui/badge";

const CourseAssistant = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [studyQuery, setStudyQuery] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const {
    isGenerating,
    notes,
    flashcards,
    quizQuestions,
    materialContext,
    generateStudyMaterials
  } = useStudyMaterials();

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
        return [];
      }
      
      return data || [];
    },
    enabled: !!user
  });

  const handleUploadMaterial = async () => {
    if (!user) {
      toast.error("Please log in to upload materials");
      return;
    }
    
    if (!title.trim()) {
      toast.error("Please enter a title for your material");
      return;
    }
    
    if (files.length === 0) {
      toast.error("Please select at least one file to upload");
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      setUploadProgress(20);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("Please log in again - session expired");
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        const formData = new FormData();
        formData.append('title', `${title} - ${file.name}`);
        formData.append('description', description || '');
        formData.append('file', file);
        
        setUploadProgress(20 + (i * 60) / files.length);
        
        const response = await fetch(`https://yvlrspteukuooobkvzdz.supabase.co/functions/v1/upload-course-material`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok || !data?.success) {
          throw new Error(data?.error || `Upload failed with status ${response.status}`);
        }
      }
      
      setUploadProgress(100);
      toast.success(`Successfully uploaded ${files.length} file(s)`);
      
      setFiles([]);
      setTitle("");
      setDescription("");
      refetchMaterials();
      
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Upload failed - please try again";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', materialId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast.success("Material deleted successfully");
      refetchMaterials();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete material");
    }
  };

  const handleGenerateFromMaterial = async (materialId: string) => {
    if (!user) {
      toast.error("Please log in to generate study materials");
      return;
    }
    
    // Find the material
    const material = materials?.find(m => m.id === materialId);
    if (!material) {
      toast.error("Material not found");
      return;
    }
    
    setSelectedMaterialId(materialId);
    
    // Create a mock file object to pass to the generation function
    const mockFile = new File([material.title], `${material.title}.txt`, { type: 'text/plain' });
    
    await generateStudyMaterials([mockFile], studyQuery || `Generate comprehensive study materials for: ${material.title}`);
  };

  return (
    <PageLayout
      title="Course Assistant"
      subtitle="Upload materials and generate AI-powered study aids"
      icon={<GraduationCap className="h-6 w-6" />}
    >
      <div className="space-y-8">
        {!user && (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Authentication Required</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">Please sign in to access course assistant features.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="upload" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Materials
            </TabsTrigger>
            <TabsTrigger value="library" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <BookOpen className="h-4 w-4 mr-2" />
              My Library
            </TabsTrigger>
            <TabsTrigger value="tools" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Study Tools
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  Upload Course Materials
                </CardTitle>
                <CardDescription>
                  Upload your course materials to build your study library
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Material Title *</label>
                    <Input
                      placeholder="e.g., Introduction to Computer Science"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={isUploading || !user}
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                    <Input
                      placeholder="Brief description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isUploading || !user}
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Files *</label>
                  <FileUploader 
                    files={files} 
                    onFilesChange={setFiles}
                    maxFiles={5}
                    maxSizeMB={50}
                    supportedFormats="PDF, DOC, DOCX, PPT, PPTX, TXT"
                    acceptTypes=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                  />
                </div>
                
                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Upload Progress</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                
                <Button 
                  onClick={handleUploadMaterial} 
                  disabled={isUploading || !title.trim() || files.length === 0 || !user}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {isUploading ? "Uploading..." : `Upload ${files.length} File(s)`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="library" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  My Materials Library
                </CardTitle>
                <CardDescription>
                  Manage your uploaded course materials and generate study tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!user ? (
                  <div className="text-center py-12">
                    <Lightbulb className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
                    <p className="text-gray-600">Please sign in to view your materials</p>
                  </div>
                ) : isLoadingMaterials ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : materials?.length === 0 ? (
                  <div className="text-center py-12">
                    <Book className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Materials Yet</h3>
                    <p className="text-gray-600 mb-4">Upload your first course material to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {materials?.map((material) => (
                      <Card key={material.id} className="hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <h3 className="font-semibold line-clamp-2 flex-1">{material.title}</h3>
                              <Badge variant="secondary" className="ml-2 shrink-0">
                                <FileText className="h-3 w-3 mr-1" />
                                Doc
                              </Badge>
                            </div>
                            {material.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">{material.description}</p>
                            )}
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Upload className="h-3 w-3" />
                              {new Date(material.uploaded_at).toLocaleDateString()}
                            </p>
                            
                            <div className="flex gap-2 pt-2">
                              <Button
                                size="sm"
                                onClick={() => handleGenerateFromMaterial(material.id)}
                                disabled={isGenerating}
                                className="flex-1 bg-purple-600 hover:bg-purple-700"
                              >
                                {isGenerating && selectedMaterialId === material.id ? (
                                  <>
                                    <Brain className="h-3 w-3 mr-1 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  <>
                                    <Zap className="h-3 w-3 mr-1" />
                                    Study Tools
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteMaterial(material.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tools" className="space-y-4">
            {notes || flashcards || quizQuestions ? (
              <div className="space-y-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Study Focus (Optional)</label>
                  <Input
                    placeholder="e.g., Focus on key concepts, important formulas..."
                    value={studyQuery}
                    onChange={(e) => setStudyQuery(e.target.value)}
                    disabled={isGenerating || !user}
                    className="focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <StudyToolTabs 
                  notes={notes}
                  flashcards={flashcards}
                  quizQuestions={quizQuestions}
                  materialContext={materialContext}
                />
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <Brain className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Study Tools Generated</h3>
                    <p className="text-gray-600 mb-4">
                      Go to "My Library" and click "Study Tools" on any material to generate AI-powered study aids
                    </p>
                    <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                      <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                        <FileText className="h-6 w-6 mx-auto text-green-600 mb-1" />
                        <p className="text-xs font-medium">Smart Notes</p>
                      </div>
                      <div className="p-3 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
                        <Brain className="h-6 w-6 mx-auto text-purple-600 mb-1" />
                        <p className="text-xs font-medium">Flashcards</p>
                      </div>
                      <div className="p-3 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                        <Lightbulb className="h-6 w-6 mx-auto text-orange-600 mb-1" />
                        <p className="text-xs font-medium">Quizzes</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default CourseAssistant;
