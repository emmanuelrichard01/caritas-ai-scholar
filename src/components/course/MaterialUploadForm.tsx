
import { useState } from "react";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileUploader } from "@/components/FileUploader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MaterialUploadFormProps {
  onUploadSuccess: () => void;
}

export const MaterialUploadForm = ({ onUploadSuccess }: MaterialUploadFormProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();

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
      
      // Reset form
      setFiles([]);
      setTitle("");
      setDescription("");
      onUploadSuccess();
      
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Upload failed - please try again";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  return (
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
  );
};
