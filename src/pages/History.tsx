
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { History as HistoryIcon, Clock, Search, Calendar, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ChatHistoryItem } from "@/types/auth";

const History = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: chatHistory = [], isLoading } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to load chat history');
        throw error;
      }

      return data as ChatHistoryItem[];
    }
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Chat deleted successfully');
    } catch (error) {
      toast.error('Failed to delete chat');
      console.error('Error:', error);
    }
  };

  const filteredHistory = chatHistory.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navigation />
      
      <div className="flex-1 pl-[70px] md:pl-[260px] transition-all duration-300">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <div className="h-12 w-12 rounded-full bg-caritas flex items-center justify-center text-white mr-4">
              <HistoryIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold dark:text-white">Chat History</h1>
              <p className="text-muted-foreground dark:text-slate-400">View and manage your past conversations</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 dark:bg-slate-900 dark:border-slate-800 dark:text-white"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-caritas" />
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground dark:text-slate-400">No chat history found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-4 shadow-sm border hover:border-caritas transition-colors cursor-pointer dark:bg-slate-900 dark:border-slate-800"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium dark:text-white">{item.title}</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-red-500 transition-colors"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2">{item.content}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center text-sm text-gray-500 dark:text-slate-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-500 dark:text-slate-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {item.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
