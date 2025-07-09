import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Copy, Check } from "lucide-react";
import { format } from "date-fns";
import { FormattedContent } from "@/components/FormattedContent";
import { useState } from "react";
import { toast } from "sonner";

interface HistoryItem {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

interface HistoryDetailModalProps {
  item: HistoryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const getCategoryLabel = (category: string) => {
  switch(category) {
    case "course-tutor": return "Course Tutor";
    case "study-planner": return "Study Planner";
    case "research": return "Research";
    case "google-ai": return "Google AI";
    case "openrouter": return "OpenRouter";
    default: return category.charAt(0).toUpperCase() + category.slice(1);
  }
};

const getCategoryColor = (category: string) => {
  switch(category) {
    case "course-tutor": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
    case "study-planner": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "research": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "google-ai": return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300";
    case "openrouter": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
};

export const HistoryDetailModal = ({ item, isOpen, onClose }: HistoryDetailModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyContent = async () => {
    if (!item?.content) return;
    
    try {
      await navigator.clipboard.writeText(item.content);
      setCopied(true);
      toast.success("Content copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy content");
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl lg:text-2xl font-bold leading-tight text-left pr-4">
                {item.title}
              </DialogTitle>
              
              {/* Meta information */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <time className="font-medium">
                    {format(new Date(item.created_at), "MMMM d, yyyy 'at' h:mm a")}
                  </time>
                </div>
                <span className={`inline-flex items-center text-sm px-3 py-1.5 rounded-full font-medium w-fit ${getCategoryColor(item.category)}`}>
                  {getCategoryLabel(item.category)}
                </span>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyContent}
              className="flex items-center gap-2 flex-shrink-0"
            >
              {copied ? (
                <><Check className="h-4 w-4" /> Copied</>
              ) : (
                <><Copy className="h-4 w-4" /> Copy</>
              )}
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="text-base lg:text-lg text-foreground leading-relaxed">
            <FormattedContent 
              content={item.content} 
              variant="default"
              className="max-w-none prose-base lg:prose-lg [&>*:first-child]:mt-0"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};