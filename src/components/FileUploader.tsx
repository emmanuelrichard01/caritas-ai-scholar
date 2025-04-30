
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { FileList } from "./FileList";
import { Progress } from "@/components/ui/progress";

interface FileUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  supportedFormats?: string;
  acceptTypes?: string;
  maxSizeMB?: number;
  maxFiles?: number;
}

export const FileUploader = ({
  files,
  onFilesChange,
  supportedFormats = "PDF, DOC, DOCX, PPT, PPTX, TXT",
  acceptTypes = ".pdf,.doc,.docx,.ppt,.pptx,.txt",
  maxSizeMB = 20,
  maxFiles = 5
}: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    
    setIsLoading(true);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const next = prev + Math.random() * 15;
        return next > 95 ? 95 : next;
      });
    }, 200);
    
    setTimeout(() => {
      try {
        // Validate file count
        if (files.length + fileList.length > maxFiles) {
          toast.error(`Maximum ${maxFiles} files allowed`);
          clearTimeout(progressInterval);
          setIsLoading(false);
          setUploadProgress(0);
          return;
        }
        
        // Validate file types and size
        const newFiles: File[] = [];
        let totalSize = files.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024);
        
        Array.from(fileList).forEach(file => {
          const fileExtension = file.name.split('.').pop()?.toLowerCase();
          const isValidType = acceptTypes
            .split(',')
            .some(type => type.includes(fileExtension || ''));
            
          if (!isValidType) {
            toast.error(`Invalid file type: ${file.name}`);
            return;
          }
          
          const fileSizeMB = file.size / (1024 * 1024);
          totalSize += fileSizeMB;
          
          if (fileSizeMB > maxSizeMB) {
            toast.error(`File too large: ${file.name} (${fileSizeMB.toFixed(1)}MB). Max size: ${maxSizeMB}MB`);
            return;
          }
          
          newFiles.push(file);
        });
        
        if (totalSize > maxSizeMB) {
          toast.error(`Total size (${totalSize.toFixed(1)}MB) exceeds maximum allowed (${maxSizeMB}MB)`);
          return;
        }
        
        if (newFiles.length > 0) {
          onFilesChange([...files, ...newFiles]);
          toast.success(`Added ${newFiles.length} file(s)`);
        }
      } finally {
        clearTimeout(progressInterval);
        setUploadProgress(100);
        setTimeout(() => {
          setUploadProgress(0);
          setIsLoading(false);
        }, 500);
      }
    }, 800); // Simulate processing time for better UX
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(e.target.files);
    // Reset the input value so the same file can be uploaded again if removed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <div 
        className={`mb-4 border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragging 
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
            : "border-gray-300 dark:border-slate-700"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center">
          <FileUp className="h-10 w-10 text-gray-400 dark:text-slate-500 mb-2" />
          <p className="mb-2 text-sm text-gray-500 dark:text-slate-400">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-500">
            {supportedFormats} (Max: {maxSizeMB}MB{maxFiles ? `, ${maxFiles} files` : ''})
          </p>
          
          {isLoading && (
            <div className="w-full mt-4">
              <Progress value={uploadProgress} className="h-1" />
            </div>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            className="dark:border-slate-700 dark:text-slate-300 mt-3 w-full max-w-xs"
            disabled={isLoading}
          >
            <FileUp className="h-4 w-4 mr-2" />
            Select Files
          </Button>
          
          <Input
            ref={fileInputRef}
            id="file-input"
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept={acceptTypes}
            disabled={isLoading}
          />
        </div>
      </div>
      
      {files.length >= maxFiles && (
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 text-xs mb-3">
          <AlertCircle className="h-3 w-3" />
          <span>Maximum number of files reached ({maxFiles})</span>
        </div>
      )}
      
      <FileList files={files} onRemoveFile={removeFile} />
    </div>
  );
};
