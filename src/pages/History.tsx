import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Clock, SortAsc, SortDesc } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { FormattedContent } from "@/components/FormattedContent";
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

interface HistoryItem {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

const History = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // Fetch chat history
  const { data: history, isLoading } = useQuery({
    queryKey: ["chatHistory", user?.id, sortOrder, categoryFilter],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from("chat_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: sortOrder === "asc" });
      
      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as HistoryItem[];
    },
    enabled: !!user,
  });
  
  // Delete history item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("chat_history")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
      toast.success("History item deleted");
    },
    onError: (error) => {
      toast.error(`Error deleting item: ${error.message}`);
    }
  });
  
  // Clear all history mutation
  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      
      let query = supabase
        .from("chat_history")
        .delete()
        .eq("user_id", user.id);
      
      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }
      
      const { error } = await query;
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
      toast.success(
        categoryFilter === "all" 
          ? "All history cleared" 
          : `All ${categoryFilter} history cleared`
      );
    },
    onError: (error) => {
      toast.error(`Error clearing history: ${error.message}`);
    }
  });
  
  const handleDeleteItem = (id: string) => {
    deleteItemMutation.mutate(id);
  };
  
  const handleClearHistory = () => {
    clearHistoryMutation.mutate();
  };
  
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "desc" ? "asc" : "desc");
  };
  
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
  
  return (
    <PageLayout 
      title="Chat History" 
      subtitle="Review your past conversations with Caritas AI"
      icon={<Clock className="h-6 w-6" />}
    >
      {/* Enhanced Controls Section - Mobile First */}
      <div className="mb-6 space-y-4">
        {/* Top Row - Sort and Filter */}
        <div className="flex flex-col xs:flex-row gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortOrder}
            className="flex items-center justify-center gap-2 min-w-0 flex-shrink-0"
          >
            {sortOrder === "desc" ? (
              <><SortDesc className="h-4 w-4" /> <span className="hidden xs:inline">Newest First</span><span className="xs:hidden">Newest</span></>
            ) : (
              <><SortAsc className="h-4 w-4" /> <span className="hidden xs:inline">Oldest First</span><span className="xs:hidden">Oldest</span></>
            )}
          </Button>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="min-w-0 flex-1 xs:w-48 xs:flex-initial">
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

        {/* Bottom Row - Clear Action */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {history ? (
              <span>
                Showing {history.length} {history.length === 1 ? 'conversation' : 'conversations'}
                {categoryFilter !== "all" && ` in ${getCategoryLabel(categoryFilter)}`}
              </span>
            ) : (
              <span>Loading...</span>
            )}
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm"
                disabled={!history || history.length === 0 || clearHistoryMutation.isPending}
                className="flex items-center gap-2"
              >
                {clearHistoryMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> <span className="hidden xs:inline">Clearing...</span></>
                ) : (
                  <><Trash2 className="h-4 w-4" /> <span className="hidden xs:inline">Clear History</span><span className="xs:hidden">Clear</span></>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="mx-4 max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>Clear chat history?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm leading-relaxed">
                  {categoryFilter === "all" 
                    ? "This will permanently delete all of your chat history. This action cannot be undone."
                    : `This will permanently delete all of your ${getCategoryLabel(categoryFilter)} chat history. This action cannot be undone.`}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col xs:flex-row gap-2">
                <AlertDialogCancel className="w-full xs:w-auto">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearHistory} className="w-full xs:w-auto">
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : !history || history.length === 0 ? (
        <Card className="text-center py-12 sm:py-16 bg-muted/30 border-dashed">
          <div className="mx-auto max-w-md px-4">
            <div className="mb-4">
              <Clock className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground/50" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
              No conversations yet
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {categoryFilter === "all" 
                ? "Start chatting with CARITAS AI to see your conversation history here."
                : `No ${getCategoryLabel(categoryFilter)} conversations found. Try a different filter or start a new conversation.`}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {history.map((item) => (
            <Card key={item.id} className="group relative overflow-hidden transition-all duration-200 hover:shadow-md">
              <div className="p-4 sm:p-5">
                {/* Header with title and delete button */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-base sm:text-lg text-foreground leading-tight line-clamp-2 min-w-0 flex-1">
                    {item.title}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={deleteItemMutation.isPending}
                  >
                    {deleteItemMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Meta information */}
                <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 mb-4">
                  <time className="text-xs sm:text-sm text-muted-foreground font-medium">
                    {format(new Date(item.created_at), "MMM d, yyyy · h:mm a")}
                  </time>
                  <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium w-fit ${getCategoryColor(item.category)}`}>
                    {getCategoryLabel(item.category)}
                  </span>
                </div>
                
                {/* Content */}
                <div className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  <FormattedContent 
                    content={item.content} 
                    variant="default"
                    className="max-w-none prose-sm sm:prose-base"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default History;
