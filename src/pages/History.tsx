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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Lazy load the history list for better performance
const HistoryList = lazy(() => import("@/components/history/HistoryList").then(module => ({ default: module.HistoryList })));

interface HistoryItem {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

interface HistoryResponse {
  data: HistoryItem[];
  totalCount: number;
  totalPages: number;
}

const History = () => {
  const { user } = useAuth();
  const { isAuthenticated, showAuthModal, closeAuthModal, loading: authLoading } = useAuthGuard();
  const queryClient = useQueryClient();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  const ITEMS_PER_PAGE = 10;
  
  // Fetch chat history with pagination
  const { data: historyResponse, isLoading, error } = useQuery({
    queryKey: ["chatHistory", user?.id, sortOrder, categoryFilter, currentPage],
    queryFn: async (): Promise<HistoryResponse> => {
      if (!user) return { data: [], totalCount: 0, totalPages: 0 };
      
      // First get total count for pagination
      let countQuery = supabase
        .from("chat_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      
      if (categoryFilter !== "all") {
        countQuery = countQuery.eq("category", categoryFilter);
      }
      
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;
      
      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
      
      // Then get paginated data
      let dataQuery = supabase
        .from("chat_history")
        .select("id, title, content, category, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: sortOrder === "asc" })
        .range((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE - 1);
      
      if (categoryFilter !== "all") {
        dataQuery = dataQuery.eq("category", categoryFilter);
      }
      
      const { data, error } = await dataQuery;
      if (error) throw error;
      
      return {
        data: data as HistoryItem[],
        totalCount,
        totalPages
      };
    },
    enabled: !!user && isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Memoize filtered and processed data
  const processedHistory = useMemo(() => {
    const history = historyResponse?.data || [];
    return history.map(item => ({
      ...item,
      // Ensure content is properly formatted
      content: item.content || "No content available"
    }));
  }, [historyResponse?.data]);
  
  // Reset to page 1 when filters change
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };
  
  const handleSortToggle = () => {
    setSortOrder(prev => prev === "desc" ? "asc" : "desc");
    setCurrentPage(1);
  };
  
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
        ["chatHistory", user?.id, sortOrder, categoryFilter, currentPage],
        (old: HistoryResponse | undefined) => {
          if (!old) return { data: [], totalCount: 0, totalPages: 0 };
          const newData = old.data.filter(item => item.id !== deletedId);
          return {
            ...old,
            data: newData,
            totalCount: Math.max(0, old.totalCount - 1),
            totalPages: Math.ceil(Math.max(0, old.totalCount - 1) / ITEMS_PER_PAGE)
          };
        }
      );

      return { previousHistory };
    },
    onError: (error, deletedId, context) => {
      // Rollback on error
      if (context?.previousHistory) {
        queryClient.setQueryData(
          ["chatHistory", user?.id, sortOrder, categoryFilter, currentPage],
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
      const previousHistory = queryClient.getQueryData(["chatHistory", user?.id, sortOrder, categoryFilter, currentPage]);

      // Optimistically update to empty array
      queryClient.setQueryData(
        ["chatHistory", user?.id, sortOrder, categoryFilter, currentPage],
        { data: [], totalCount: 0, totalPages: 0 }
      );

      return { previousHistory };
    },
    onError: (error, _, context) => {
      // Rollback on error
      if (context?.previousHistory) {
        queryClient.setQueryData(
          ["chatHistory", user?.id, sortOrder, categoryFilter, currentPage],
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
  
  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          historyCount={historyResponse?.totalCount || 0}
          isClearing={clearHistoryMutation.isPending}
          onSortToggle={handleSortToggle}
          onCategoryChange={handleCategoryChange}
          onClearHistory={handleClearHistory}
        />

        {isLoading ? (
          <HistorySkeleton />
        ) : processedHistory.length === 0 ? (
          <HistoryEmptyState categoryFilter={categoryFilter} />
        ) : (
          <>
            <Suspense fallback={<HistorySkeleton />}>
              <HistoryList
                history={processedHistory}
                onDeleteItem={handleDeleteItem}
                isDeleting={deleteItemMutation.isPending}
              />
            </Suspense>
            
            {/* Pagination Controls */}
            {historyResponse && historyResponse.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) {
                            handlePageChange(currentPage - 1);
                          }
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {/* Page numbers */}
                    {Array.from({ length: Math.min(5, historyResponse.totalPages) }, (_, i) => {
                      let pageNum;
                      if (historyResponse.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= historyResponse.totalPages - 2) {
                        pageNum = historyResponse.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(pageNum);
                            }}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < historyResponse.totalPages) {
                            handlePageChange(currentPage + 1);
                          }
                        }}
                        className={currentPage === historyResponse.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </PageLayout>
      <AuthModal isOpen={showAuthModal} onClose={closeAuthModal} />
    </>
  );
};

export default History;