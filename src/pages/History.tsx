import { useState, useMemo, Suspense, lazy } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { supabase } from "@/integrations/supabase/client";
import { HistoryFilters } from "@/components/history/HistoryFilters";
import { HistoryEmptyState } from "@/components/history/HistoryEmptyState";
import { HistorySkeleton } from "@/components/history/HistorySkeleton";
import { AuthModal } from "@/components/auth/AuthModal";

// Lazy load the history list for better performance
const HistoryList = lazy(() => import("@/components/history/HistoryList").then(module => ({ default: module.HistoryList })));

interface HistoryItem {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

const History = () => {
  const { user } = useAuth();
  const { isAuthenticated, showAuthModal, closeAuthModal, loading: authLoading } = useAuthGuard();
  const queryClient = useQueryClient();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // Fetch chat history with optimized query
  const { data: history = [], isLoading, error } = useQuery({
    queryKey: ["chatHistory", user?.id, sortOrder, categoryFilter],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from("chat_history")
        .select("id, title, content, category, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: sortOrder === "asc" });
      
      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as HistoryItem[];
    },
    enabled: !!user && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Memoize filtered and processed data
  const processedHistory = useMemo(() => {
    return history.map(item => ({
      ...item,
      // Ensure content is properly formatted
      content: item.content || "No content available"
    }));
  }, [history]);
  
  // Delete history item mutation with optimistic updates
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("chat_history")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id); // Additional security check
        
      if (error) throw error;
      return id;
    },
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["chatHistory"] });

      // Snapshot the previous value
      const previousHistory = queryClient.getQueryData(["chatHistory", user?.id, sortOrder, categoryFilter]);

      // Optimistically update to the new value
      queryClient.setQueryData(
        ["chatHistory", user?.id, sortOrder, categoryFilter],
        (old: HistoryItem[] | undefined) => old?.filter(item => item.id !== deletedId) || []
      );

      return { previousHistory };
    },
    onError: (error, deletedId, context) => {
      // Rollback on error
      if (context?.previousHistory) {
        queryClient.setQueryData(
          ["chatHistory", user?.id, sortOrder, categoryFilter],
          context.previousHistory
        );
      }
      toast.error(`Error deleting item: ${error.message}`);
    },
    onSuccess: () => {
      toast.success("History item deleted successfully");
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
    }
  });
  
  // Clear all history mutation with optimistic updates
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
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["chatHistory"] });

      // Snapshot the previous value
      const previousHistory = queryClient.getQueryData(["chatHistory", user?.id, sortOrder, categoryFilter]);

      // Optimistically update to empty array
      queryClient.setQueryData(
        ["chatHistory", user?.id, sortOrder, categoryFilter],
        []
      );

      return { previousHistory };
    },
    onError: (error, _, context) => {
      // Rollback on error
      if (context?.previousHistory) {
        queryClient.setQueryData(
          ["chatHistory", user?.id, sortOrder, categoryFilter],
          context.previousHistory
        );
      }
      toast.error(`Error clearing history: ${error.message}`);
    },
    onSuccess: () => {
      toast.success(
        categoryFilter === "all" 
          ? "All history cleared successfully" 
          : `All ${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} history cleared successfully`
      );
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["chatHistory"] });
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

  // Show auth modal if not authenticated
  if (!isAuthenticated && !authLoading) {
    return (
      <>
        <PageLayout 
          title="Chat History" 
          subtitle="Review your past conversations with Caritas AI"
          icon={<Clock className="h-6 w-6" />}
        >
          <div className="text-center py-16">
            <p className="text-muted-foreground">Please sign in to view your chat history.</p>
          </div>
        </PageLayout>
        <AuthModal isOpen={showAuthModal} onClose={closeAuthModal} />
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <PageLayout 
        title="Chat History" 
        subtitle="Review your past conversations with Caritas AI"
        icon={<Clock className="h-6 w-6" />}
      >
        <div className="text-center py-12">
          <p className="text-destructive">Failed to load history. Please try again later.</p>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <>
      <PageLayout 
        title="Chat History" 
        subtitle="Review your past conversations with Caritas AI"
        icon={<Clock className="h-6 w-6" />}
      >
        <HistoryFilters
          sortOrder={sortOrder}
          categoryFilter={categoryFilter}
          historyCount={processedHistory.length}
          isClearing={clearHistoryMutation.isPending}
          onSortToggle={toggleSortOrder}
          onCategoryChange={setCategoryFilter}
          onClearHistory={handleClearHistory}
        />

        {isLoading ? (
          <HistorySkeleton />
        ) : processedHistory.length === 0 ? (
          <HistoryEmptyState categoryFilter={categoryFilter} />
        ) : (
          <Suspense fallback={<HistorySkeleton />}>
            <HistoryList
              history={processedHistory}
              onDeleteItem={handleDeleteItem}
              isDeleting={deleteItemMutation.isPending}
            />
          </Suspense>
        )}
      </PageLayout>
      <AuthModal isOpen={showAuthModal} onClose={closeAuthModal} />
    </>
  );
};

export default History;