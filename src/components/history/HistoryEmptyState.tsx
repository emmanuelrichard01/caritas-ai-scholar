import { Card } from "@/components/ui/card";
import { Clock, MessageSquare } from "lucide-react";

interface HistoryEmptyStateProps {
  categoryFilter: string;
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

export const HistoryEmptyState = ({ categoryFilter }: HistoryEmptyStateProps) => {
  return (
    <Card className="text-center py-12 sm:py-16 lg:py-20 bg-muted/30 border-dashed">
      <div className="mx-auto max-w-md lg:max-w-lg px-4">
        <div className="mb-6 lg:mb-8">
          <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
            <Clock className="absolute inset-0 h-full w-full text-muted-foreground/40" />
            <MessageSquare className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-muted-foreground/60" />
          </div>
        </div>
        
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground mb-3 lg:mb-4">
          No conversations yet
        </h3>
        
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed">
          {categoryFilter === "all" 
            ? "Start chatting with CARITAS AI to see your conversation history here. Your previous conversations will be automatically saved and organized for easy access."
            : `No ${getCategoryLabel(categoryFilter)} conversations found. Try a different filter or start a new conversation in this category.`}
        </p>
        
        {categoryFilter !== "all" && (
          <p className="text-xs sm:text-sm text-muted-foreground/80 mt-3 lg:mt-4">
            You can change the filter above to view conversations from other categories.
          </p>
        )}
      </div>
    </Card>
  );
};