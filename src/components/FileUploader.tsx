
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUp } from "lucide-react";
import { toast } from "sonner";
import { FileList } from "./FileList";

interface FileUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  supportedFormats?: string;
  acceptTypes?: string;
}

export const FileUploader = ({
  files,
  onFilesChange,
  supportedFormats = "PDF, DOC, DOCX, PPT, PPTX, TXT",
  acceptTypes = ".pdf,.doc,.docx,.ppt,.pptx,.txt"
}: FileUploaderProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      onFilesChange([...files, ...newFiles]);
      toast.success(`Added ${e.target.files.length} file(s)`);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  return (
    <div>
      <div className="mb-4">
        <Button 
          variant="outline" 
          onClick={() => document.getElementById('file-input')?.click()}
          className="dark:border-slate-700 dark:text-slate-300 w-full md:w-auto"
        >
          <FileUp className="h-4 w-4 mr-2" />
          Upload Files
        </Button>
        <Input
          id="file-input"
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          accept={acceptTypes}
        />
        <p className="text-xs text-muted-foreground mt-2 dark:text-slate-500">
          Supported formats: {supportedFormats}
        </p>
      </div>
      
      <FileList files={files} onRemoveFile={removeFile} />
    </div>
  );
};
