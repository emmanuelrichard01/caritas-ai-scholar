import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Eye, Calendar } from "lucide-react";
import { format } from "date-fns";
import { FormattedContent } from "@/components/FormattedContent";

interface HistoryItem {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

interface HistoryCardProps {
  item: HistoryItem;
  isDeleting: boolean;
  onDelete: (id: string) => void;
  onViewDetails: (item: HistoryItem) => void;
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

export const HistoryCard = ({ item, isDeleting, onDelete, onViewDetails }: HistoryCardProps) => {
  // Truncate content for preview
  const previewContent = item.content?.length > 300 
    ? item.content.substring(0, 300) + "..." 
    : item.content;

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg lg:hover:shadow-xl border-0 bg-card/80 backdrop-blur-sm lg:border lg:bg-card">
      <div className="p-4 sm:p-5 lg:p-6">
        {/* Header with title and actions */}
        <div className="flex items-start justify-between gap-4 lg:gap-6 mb-3 lg:mb-4">
          <h3 className="font-semibold text-base sm:text-lg lg:text-xl text-foreground leading-tight line-clamp-2 min-w-0 flex-1">
            {item.title}
          </h3>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 lg:h-9 lg:w-9 p-0 opacity-60 hover:opacity-100 transition-all duration-200 hover:bg-primary/10 hover:text-primary"
              onClick={() => onViewDetails(item)}
              title="View full content"
            >
              <Eye className="h-4 w-4 lg:h-5 lg:w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 lg:h-9 lg:w-9 p-0 opacity-60 hover:opacity-100 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDelete(item.id)}
              disabled={isDeleting}
              title="Delete conversation"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 lg:h-5 lg:w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Meta information */}
        <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 lg:gap-4 mb-4 lg:mb-5">
          <div className="flex items-center gap-2 text-xs sm:text-sm lg:text-base text-muted-foreground">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
            <time className="font-medium">
              {format(new Date(item.created_at), "MMM d, yyyy · h:mm a")}
            </time>
          </div>
          <span className={`inline-flex items-center text-xs lg:text-sm px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-full font-medium w-fit ${getCategoryColor(item.category)}`}>
            {getCategoryLabel(item.category)}
          </span>
        </div>
        
        {/* Content Preview */}
        <div className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed lg:leading-relaxed">
          <FormattedContent 
            content={previewContent} 
            variant="default"
            className="max-w-none prose-sm sm:prose-base lg:prose-lg [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
          />
          {item.content?.length > 300 && (
            <Button
              variant="link"
              size="sm"
              onClick={() => onViewDetails(item)}
              className="mt-2 p-0 h-auto text-primary hover:text-primary/80"
            >
              Read more...
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};