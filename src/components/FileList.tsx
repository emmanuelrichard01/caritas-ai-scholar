
import { X, FileText, FileImage, File } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileListProps {
  files: File[];
  onRemoveFile: (index: number) => void;
}

export const FileList = ({ files, onRemoveFile }: FileListProps) => {
  if (files.length === 0) return null;
  
  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) {
      return <FileText className="h-4 w-4 text-red-500" />;
    } else if (file.type.includes('image')) {
      return <FileImage className="h-4 w-4 text-blue-500" />;
    } else if (file.type.includes('word') || file.type.includes('doc')) {
      return <FileText className="h-4 w-4 text-blue-600" />;
    } else if (file.type.includes('presentation') || file.type.includes('powerpoint')) {
      return <FileText className="h-4 w-4 text-orange-500" />;
    } else {
      return <File className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  return (
    <div className="mb-4">
      <p className="text-sm font-medium mb-2 dark:text-slate-300">Uploaded Files ({files.length}):</p>
      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {files.map((file, index) => (
          <div 
            key={index} 
            className="flex items-center justify-between bg-slate-50 p-2 rounded dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center space-x-2 truncate max-w-[80%]">
              {getFileIcon(file)}
              <div className="truncate">
                <p className="text-sm truncate font-medium dark:text-slate-300">{file.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onRemoveFile(index)} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
