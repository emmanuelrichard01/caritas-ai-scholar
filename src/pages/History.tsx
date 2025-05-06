
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageLayout from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { History as HistoryIcon, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
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

interface ChatHistoryItem {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
}

const History = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: chatHistory, isLoading } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as ChatHistoryItem[];
    },
    enabled: !!user,
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', user.id);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
      toast.success('Chat history cleared successfully');
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error clearing history:', error);
      toast.error('Failed to clear history. Please try again.');
    }
  });

  const categories = chatHistory 
    ? [...new Set(chatHistory.map(item => item.category))]
    : [];

  const filteredHistory = selectedCategory
    ? chatHistory?.filter(item => item.category === selectedCategory)
    : chatHistory;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleClearHistory = () => {
    clearHistoryMutation.mutate();
  };

  return (
    <PageLayout>
      <div className="container max-w-5xl mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Chat History</h1>
          
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm"
                className="flex items-center gap-2"
                disabled={isLoading || !chatHistory || chatHistory.length === 0}
              >
                <Trash2 className="h-4 w-4" />
                Clear History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete all your chat history. 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearHistory} 
                  className="bg-red-500 hover:bg-red-600"
                >
                  {clearHistoryMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Delete All"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center my-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : chatHistory && chatHistory.length > 0 ? (
          <>
            <div className="mb-6 flex flex-wrap gap-2">
              <Button 
                variant={selectedCategory === null ? "secondary" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          
            <div className="space-y-4">
              {filteredHistory?.map((item) => (
                <Card key={item.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer" onClick={() => {}}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.content.split('\n\n')[0]}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-muted-foreground">{formatDate(item.created_at)}</span>
                      <span className="mt-1 text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                        {item.category}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <HistoryIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">No chat history yet</h3>
            <p className="text-muted-foreground mb-6">
              Your conversation history will appear here after you chat with the AI.
            </p>
            <Button onClick={() => navigate('/')}>Start a new chat</Button>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default History;
