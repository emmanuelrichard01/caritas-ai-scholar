
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
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortOrder}
            className="flex items-center gap-1"
          >
            {sortOrder === "desc" ? (
              <><SortDesc className="h-4 w-4" /> Newest</>
            ) : (
              <><SortAsc className="h-4 w-4" /> Oldest</>
            )}
          </Button>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-36 sm:w-40">
              <SelectValue placeholder="Filter by type" />
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
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              size="sm"
              disabled={!history || history.length === 0 || clearHistoryMutation.isPending}
              className="flex items-center gap-1"
            >
              {clearHistoryMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Clearing...</>
              ) : (
                <><Trash2 className="h-4 w-4" /> Clear History</>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear chat history?</AlertDialogTitle>
              <AlertDialogDescription>
                {categoryFilter === "all" 
                  ? "This will delete all of your chat history. This action cannot be undone."
                  : `This will delete all of your ${getCategoryLabel(categoryFilter)} chat history. This action cannot be undone.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearHistory}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : !history || history.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border dark:bg-slate-900 dark:border-slate-800">
          <p className="text-slate-600 dark:text-slate-400">No chat history yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <Card key={item.id} className="p-4 relative">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2">
                <h3 className="font-medium text-lg mb-1 pr-8">{item.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {format(new Date(item.created_at), "MMM d, yyyy h:mm a")}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(item.category)}`}>
                    {getCategoryLabel(item.category)}
                  </span>
                </div>
              </div>
              
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {item.content}
              </pre>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 h-8 w-8"
                onClick={() => handleDeleteItem(item.id)}
                disabled={deleteItemMutation.isPending}
              >
                {deleteItemMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default History;
