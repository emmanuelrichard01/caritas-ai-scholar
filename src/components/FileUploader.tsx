
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
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = acceptTypes.split(',').map(type => type.trim().replace('.', ''));
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return `Invalid file type. Supported formats: ${supportedFormats}`;
    }
    
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `File too large (${fileSizeMB.toFixed(1)}MB). Maximum size: ${maxSizeMB}MB`;
    }
    
    return null;
  };

  const processFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      console.log('No files selected');
      return;
    }
    
    console.log(`Processing ${fileList.length} files`);
    setIsProcessing(true);
    setUploadProgress(20);
    
    try {
      // Check total file count
      if (files.length + fileList.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }
      
      const validFiles: File[] = [];
      
      // Validate each file
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        console.log(`Validating: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
        
        const validationError = validateFile(file);
        if (validationError) {
          toast.error(`${file.name}: ${validationError}`);
          continue;
        }
        
        // Check for duplicates
        const isDuplicate = files.some(existingFile => 
          existingFile.name === file.name && existingFile.size === file.size
        );
        
        if (isDuplicate) {
          toast.error(`File already added: ${file.name}`);
          continue;
        }
        
        validFiles.push(file);
      }
      
      setUploadProgress(80);
      
      if (validFiles.length > 0) {
        console.log(`Adding ${validFiles.length} valid files`);
        onFilesChange([...files, ...validFiles]);
        toast.success(`Added ${validFiles.length} file(s)`);
        setUploadProgress(100);
      } else {
        toast.error('No valid files to add');
      }
      
    } catch (error) {
      console.error('Error processing files:', error);
      toast.error('Error processing files');
    } finally {
      setTimeout(() => {
        setUploadProgress(0);
        setIsProcessing(false);
      }, 1000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed');
    processFiles(e.target.files);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    console.log(`Removing file at index ${index}`);
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
    toast.success('File removed');
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    console.log('Files dropped');
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
            {supportedFormats} (Max: {maxSizeMB}MB, {maxFiles} files)
          </p>
          
          {isProcessing && uploadProgress > 0 && (
            <div className="w-full mt-4">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-xs text-center mt-1">Processing files...</p>
            </div>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 w-full max-w-xs"
            disabled={isProcessing}
          >
            <FileUp className="h-4 w-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Select Files'}
          </Button>
          
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept={acceptTypes}
            disabled={isProcessing}
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
