import { useState } from "react";
import { Book, Upload, FileText, Brain, Lightbulb, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { PageLayout } from "@/components/PageLayout";
import { FileUploader } from "@/components/FileUploader";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const CourseTutor = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch user materials
  const { data: materials, isLoading: isLoadingMaterials, refetch: refetchMaterials } = useQuery({
    queryKey: ['materials', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching materials for user:', user.id);
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching materials:", error);
        return [];
      }
      
      console.log('Fetched materials:', data);
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
      console.log('Starting upload process...');
      setUploadProgress(20);
      
      // Get current session for auth
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error("Please log in again - session expired");
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Uploading file ${i + 1}/${files.length}: ${file.name}`);
        
        // Create form data
        const formData = new FormData();
        formData.append('title', `${title} - ${file.name}`);
        formData.append('description', description || '');
        formData.append('file', file);
        
        setUploadProgress(20 + (i * 60) / files.length);

        console.log('Calling upload function with auth token...');
        
        // Upload file with proper authentication - using the direct URL
        const response = await fetch(`https://yvlrspteukuooobkvzdz.supabase.co/functions/v1/upload-course-material`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok || !data?.success) {
          console.error('Upload response:', { status: response.status, data });
          throw new Error(data?.error || `Upload failed with status ${response.status}`);
        }
        
        console.log('Upload successful:', data);
      }
      
      setUploadProgress(100);
      toast.success(`Successfully uploaded ${files.length} file(s)`);
      
      // Reset form
      setFiles([]);
      setTitle("");
      setDescription("");
      
      // Refresh materials list
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

  const handleGenerateStudyTools = () => {
    navigate('/study-tools');
  };

  return (
    <PageLayout
      title="Course Tutor"
      subtitle="Upload course materials and generate AI-powered study aids"
      icon={<Book className="h-6 w-6" />}
    >
      <div className="space-y-6">
        <Tabs defaultValue="upload" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload Materials</TabsTrigger>
            <TabsTrigger value="library">My Library</TabsTrigger>
            <TabsTrigger value="tools">Study Tools</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Upload className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Upload Course Materials</h2>
                </div>
                
                {!user && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                    <p className="font-medium">Authentication Required</p>
                    <p className="text-sm">Please sign in to upload course materials.</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Material Title *</label>
                    <Input
                      placeholder="e.g., Introduction to Computer Science"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={isUploading || !user}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                    <Textarea
                      placeholder="Brief description of the material..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isUploading || !user}
                      rows={3}
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
                  className="w-full"
                  size="lg"
                >
                  {isUploading ? "Uploading..." : `Upload ${files.length} File(s)`}
                </Button>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="library" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-5 w-5" />
                <h2 className="text-lg font-semibold">My Materials</h2>
              </div>
              
              {!user ? (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
                  <p className="text-gray-600">Please sign in to view your materials</p>
                </div>
              ) : isLoadingMaterials ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : materials?.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Materials Yet</h3>
                  <p className="text-gray-600 mb-4">Upload your first course material to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {materials?.map((material) => (
                    <Card key={material.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="space-y-2">
                        <h3 className="font-semibold line-clamp-2">{material.title}</h3>
                        {material.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{material.description}</p>
                        )}
                        <p className="text-xs text-gray-500">
                          Uploaded: {new Date(material.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
          
          <TabsContent value="tools" className="space-y-4">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Zap className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">AI Study Tools</h2>
                </div>
                
                <div className="text-center py-8">
                  <Brain className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Generate Study Materials</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Transform your uploaded course materials into comprehensive study aids including notes, flashcards, and quizzes.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 border rounded-lg">
                      <FileText className="h-8 w-8 mx-auto text-green-500 mb-2" />
                      <h4 className="font-medium">Smart Notes</h4>
                      <p className="text-sm text-gray-600">AI-generated summaries and key points</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Brain className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                      <h4 className="font-medium">Flashcards</h4>
                      <p className="text-sm text-gray-600">Interactive Q&A for active recall</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Lightbulb className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
                      <h4 className="font-medium">Practice Quizzes</h4>
                      <p className="text-sm text-gray-600">Test your knowledge with AI-generated questions</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleGenerateStudyTools}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Brain className="h-5 w-5 mr-2" />
                    Open Study Tools
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default CourseTutor;
