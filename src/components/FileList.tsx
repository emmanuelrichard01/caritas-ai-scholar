
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileListProps {
  files: File[];
  onRemoveFile: (index: number) => void;
}

export const FileList = ({ files, onRemoveFile }: FileListProps) => {
  if (files.length === 0) return null;
  
  return (
    <div className="mb-4">
      <p className="text-sm font-medium mb-2 dark:text-slate-300">Uploaded Files:</p>
      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {files.map((file, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between bg-slate-50 p-2 rounded dark:bg-slate-800"
          >
            <span className="text-sm truncate max-w-[80%] dark:text-slate-300">{file.name}</span>
            <Button variant="ghost" size="icon" onClick={() => onRemoveFile(index)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
