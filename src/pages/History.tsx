
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { History as HistoryIcon, Clock, Search, Calendar, Trash2, Loader2, Edit2, Save, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ChatHistoryItem } from "@/types/auth";

const History = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const queryClient = useQueryClient();

  // Fetch chat history with real-time updates
  const { data: chatHistory = [], isLoading } = useQuery({
    queryKey: ['chatHistory'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast.error('Failed to load chat history');
        throw error;
      }

      return data as ChatHistoryItem[];
    },
    enabled: !!user
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;
    
    const subscription = supabase
      .channel('chat_history_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'chat_history',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, queryClient]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('chat_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Chat deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
    } catch (error) {
      toast.error('Failed to delete chat');
      console.error('Error:', error);
    }
  };

  const handleEdit = (item: ChatHistoryItem) => {
    setEditingItem(item.id);
    setEditTitle(item.title);
  };

  const saveEdit = async (id: string) => {
    try {
      const { error } = await supabase
        .from('chat_history')
        .update({
          title: editTitle,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Chat title updated successfully');
      setEditingItem(null);
      queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
    } catch (error) {
      toast.error('Failed to update chat title');
      console.error('Error:', error);
    }
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditTitle("");
  };

  const uniqueCategories = Array.from(new Set(chatHistory.map(item => item.category)));

  const filteredHistory = chatHistory.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation />
      
      <div className="flex-1 pl-[70px] md:pl-[260px] transition-all duration-300">
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          <div className="flex items-center mb-6 md:mb-8">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-caritas flex items-center justify-center text-white mr-3 md:mr-4 shadow-md">
              <HistoryIcon className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold dark:text-white">Chat History</h1>
              <p className="text-sm text-muted-foreground dark:text-slate-300">View and manage your past conversations</p>
            </div>
          </div>

          <div className="mb-6 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
            
            {isMobile ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="dark:bg-slate-800 dark:border-slate-700">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="dark:bg-slate-800">
                  <SheetHeader>
                    <SheetTitle className="dark:text-white">Filter by Category</SheetTitle>
                    <SheetDescription>Select a category to filter your chat history.</SheetDescription>
                  </SheetHeader>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button
                      key="all"
                      variant={categoryFilter === "" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCategoryFilter("")}
                      className={categoryFilter === "" ? "bg-caritas hover:bg-caritas-light" : "dark:bg-slate-900"}
                    >
                      All
                    </Button>
                    {uniqueCategories.map(category => (
                      <Button
                        key={category}
                        variant={categoryFilter === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCategoryFilter(category)}
                        className={categoryFilter === category ? "bg-caritas hover:bg-caritas-light" : "dark:bg-slate-900"}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button
                  key="all"
                  variant={categoryFilter === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter("")}
                  className={categoryFilter === "" ? "bg-caritas hover:bg-caritas-light" : "dark:bg-slate-800 dark:border-slate-700"}
                >
                  All
                </Button>
                {uniqueCategories.map(category => (
                  <Button
                    key={category}
                    variant={categoryFilter === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCategoryFilter(category)}
                    className={categoryFilter === category ? "bg-caritas hover:bg-caritas-light" : "dark:bg-slate-800 dark:border-slate-700"}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-caritas" />
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8 px-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border dark:border-slate-700">
              <p className="text-muted-foreground dark:text-slate-300">No chat history found</p>
              {searchQuery && <p className="mt-2 text-sm text-muted-foreground dark:text-slate-400">Try adjusting your search term</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-4 shadow-sm border hover:border-caritas transition-colors dark:bg-slate-800 dark:border-slate-700 dark:hover:border-caritas"
                >
                  {editingItem === item.id ? (
                    <div className="flex flex-col gap-2">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="font-medium dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-caritas hover:bg-caritas-light"
                          onClick={() => saveEdit(item.id)}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEdit}
                          className="dark:bg-slate-700 dark:border-slate-600"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium dark:text-white break-words pr-8">{item.title}</h3>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-caritas transition-colors"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-red-500 transition-colors"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 dark:text-slate-300 line-clamp-2 mb-3">{item.content}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-slate-400">
                    <div className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
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
