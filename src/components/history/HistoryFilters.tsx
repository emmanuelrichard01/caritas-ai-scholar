import { Button } from "@/components/ui/button";
import { SortAsc, SortDesc, Trash2, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface HistoryFiltersProps {
  sortOrder: "asc" | "desc";
  categoryFilter: string;
  historyCount: number;
  isClearing: boolean;
  onSortToggle: () => void;
  onCategoryChange: (value: string) => void;
  onClearHistory: () => void;
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

export const HistoryFilters = ({
  sortOrder,
  categoryFilter,
  historyCount,
  isClearing,
  onSortToggle,
  onCategoryChange,
  onClearHistory
}: HistoryFiltersProps) => {
  return (
    <div className="mb-6 space-y-4 lg:space-y-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
        {/* Left side: Sort and Filter controls */}
        <div className="flex flex-col xs:flex-row gap-3 lg:gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onSortToggle}
            className="flex items-center justify-center gap-2 min-w-0 flex-shrink-0 lg:px-4"
          >
            {sortOrder === "desc" ? (
              <><SortDesc className="h-4 w-4" /> <span className="hidden xs:inline">Newest First</span></>
            ) : (
              <><SortAsc className="h-4 w-4" /> <span className="hidden xs:inline">Oldest First</span></>
            )}
          </Button>
          
          <Select value={categoryFilter} onValueChange={onCategoryChange}>
            <SelectTrigger className="min-w-0 flex-1 xs:w-48 lg:w-56 xs:flex-initial">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="google-ai">Google AI</SelectItem>
              <SelectItem value="openrouter">OpenRouter</SelectItem>
              <SelectItem value="course-tutor">Course Tutor</SelectItem>
              <SelectItem value="study-planner">Study Planner</SelectItem>
              <SelectItem value="research">Research</SelectItem>
              <SelectItem value="default">Default</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Right side: Stats and Clear Action */}
        <div className="flex flex-col xs:flex-row xs:items-center gap-3 lg:gap-6">
          <div className="text-sm text-muted-foreground lg:text-base">
            <span className="font-medium">
              {historyCount > 0 ? (
                `Showing ${historyCount} ${historyCount === 1 ? 'conversation' : 'conversations'}${categoryFilter !== "all" ? ` in ${getCategoryLabel(categoryFilter)}` : ''}`
              ) : (
                'No conversations found'
              )}
            </span>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm"
                disabled={historyCount === 0 || isClearing}
                className="flex items-center gap-2 lg:px-4"
              >
                {isClearing ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> <span className="hidden xs:inline">Clearing...</span></>
                ) : (
                  <><Trash2 className="h-4 w-4" /> <span className="hidden xs:inline lg:inline">Clear History</span><span className="xs:hidden lg:hidden">Clear</span></>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="mx-4 max-w-md lg:max-w-lg">
              <AlertDialogHeader>
                <AlertDialogTitle className="lg:text-xl">Clear chat history?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm lg:text-base leading-relaxed">
                  {categoryFilter === "all" 
                    ? "This will permanently delete all of your chat history. This action cannot be undone."
                    : `This will permanently delete all of your ${getCategoryLabel(categoryFilter)} chat history. This action cannot be undone.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col xs:flex-row gap-2 lg:gap-3">
                <AlertDialogCancel className="w-full xs:w-auto lg:px-6">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onClearHistory} className="w-full xs:w-auto lg:px-6">
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};