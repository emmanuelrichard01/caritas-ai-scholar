
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Trash2, 
  MessageSquare, 
  Brain, 
  BookOpen, 
  Calculator,
  Users,
  Lightbulb,
  Bot,
  RefreshCw
} from 'lucide-react';
import { useAIProcessor } from '@/hooks/useAIProcessor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EnhancedChatInput } from './EnhancedChatInput';
import { EnhancedChatMessage } from './EnhancedChatMessage';
import { Skeleton } from '@/components/ui/skeleton';

export interface Message {
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  timestamp?: Date;
  id?: string;
  tokens?: number;
  responseTime?: number;
}

const quickSuggestions = [
  {
    icon: Brain,
    title: "Study Help",
    prompt: "Help me understand complex calculus concepts with step-by-step explanations"
  },
  {
    icon: BookOpen,
    title: "Research Paper",
    prompt: "Guide me through writing a research paper on quantum physics"
  },
  {
    icon: Calculator,
    title: "Problem Solving",
    prompt: "Help me solve advanced mathematics problems with detailed solutions"
  },
  {
    icon: Users,
    title: "Study Group",
    prompt: "Create a collaborative study plan for my upcoming finals"
  },
  {
    icon: Lightbulb,
    title: "Creative Ideas",
    prompt: "Suggest innovative project ideas for my computer science course"
  }
];

export const EnhancedChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());
  const [retryCount, setRetryCount] = useState(0);
  const { user } = useAuth();
  const { processQuery, isProcessing } = useAIProcessor();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load chat history on mount
  useEffect(() => {
    if (user && isFirstMessage) {
      loadChatHistory();
    }
  }, [user, isFirstMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-refresh activity timer
  useEffect(() => {
    const interval = setInterval(() => {
      setLastActivity(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadChatHistory = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    try {
      const { data: history, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'google-ai')
        .order('created_at', { ascending: true })
        .limit(50); // Load last 50 messages

      if (error) throw error;

      if (history && history.length > 0) {
        const loadedMessages: Message[] = history.flatMap(record => [
          {
            role: 'user' as const,
            content: record.title, // Using title field which contains the query
            timestamp: new Date(record.created_at),
            id: `${record.id}-query`
          },
          {
            role: 'assistant' as const,
            content: record.content, // Using content field which contains the response
            timestamp: new Date(record.created_at),
            id: `${record.id}-response`
          }
        ]);
        
        setMessages(loadedMessages);
        setIsFirstMessage(false);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast.error('Failed to load chat history');
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isProcessing) return;

    const startTime = Date.now();
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();

    const userMessage: Message = { 
      role: 'user', 
      content: message, 
      timestamp: new Date(),
      id: `${messageId}-user`
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsFirstMessage(false);
    setRetryCount(0);

    try {
      const response = await processQuery(message, 'google-ai');
      const responseTime = Date.now() - startTime;
      
      if (response) {
        const assistantMessage: Message = { 
          role: 'assistant', 
          content: response,
          timestamp: new Date(),
          id: `${messageId}-assistant`,
          responseTime
        };
        setMessages([...newMessages, assistantMessage]);
        setLastActivity(new Date());
      } else {
        throw new Error('Empty response received');
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        role: 'error',
        content: 'I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
        id: `${messageId}-error`
      };
      setMessages([...newMessages, errorMessage]);
    }
  }, [messages, isProcessing, processQuery]);

  const clearHistory = useCallback(async () => {
    if (!user) return;

    try {
      await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', user.id)
        .eq('category', 'google-ai');
      
      setMessages([]);
      setIsFirstMessage(true);
      setLastActivity(new Date());
      toast.success('Chat history cleared');
    } catch (error) {
      console.error('Error clearing history:', error);
      toast.error('Failed to clear chat history');
    }
  }, [user]);

  const refreshChat = useCallback(async () => {
    if (isProcessing) return;
    
    setMessages([]);
    setIsFirstMessage(true);
    await loadChatHistory();
    toast.success('Chat refreshed');
  }, [isProcessing, loadChatHistory]);

  const retryLastMessage = useCallback(async () => {
    if (messages.length === 0 || isProcessing) return;
    
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    if (!lastUserMessage) return;

    setRetryCount(prev => prev + 1);
    if (retryCount >= 3) {
      toast.error('Maximum retry attempts reached');
      return;
    }

    // Remove last assistant/error message if exists
    const filteredMessages = messages.filter(msg => 
      !(msg.role === 'assistant' || msg.role === 'error') || 
      msg.timestamp! < lastUserMessage.timestamp!
    );
    
    setMessages(filteredMessages);
    await handleSendMessage(lastUserMessage.content);
  }, [messages, isProcessing, retryCount, handleSendMessage]);

  // Memoized values for performance
  const chatStats = useMemo(() => {
    const userMessages = messages.filter(m => m.role === 'user').length;
    const assistantMessages = messages.filter(m => m.role === 'assistant').length;
    const avgResponseTime = messages
      .filter(m => m.role === 'assistant' && m.responseTime)
      .reduce((acc, m) => acc + (m.responseTime || 0), 0) / assistantMessages || 0;
    
    return { userMessages, assistantMessages, avgResponseTime };
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
      {/* Enhanced Header with better spacing */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                {isProcessing && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm" />
                )}
              </div>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                CARITAS AI Chat
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your intelligent academic companion
              </p>
              {chatStats.assistantMessages > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {chatStats.userMessages} messages • Avg {chatStats.avgResponseTime.toFixed(0)}ms response
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshChat}
                  disabled={isProcessing}
                  className="text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  title="Refresh chat"
                >
                  <RefreshCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span className="sr-only sm:not-sr-only sm:ml-2 text-sm">Refresh</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearHistory}
                  disabled={isProcessing}
                  className="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-slate-300 dark:border-slate-600 transition-colors"
                  title="Clear history"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:ml-2 text-sm">Clear</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chat Content with optimized spacing */}
      <div className="flex-1 overflow-hidden min-h-0">
        <div 
          ref={chatContainerRef}
          className="h-full overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth"
        >
          {isLoadingHistory ? (
            // Loading skeleton
            <div className="space-y-4 p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-16 w-3/4" />
                </div>
              </div>
              <div className="flex items-center gap-3 justify-end">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4 ml-auto" />
                  <Skeleton className="h-12 w-2/3 ml-auto" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ) : isFirstMessage && messages.length === 0 ? (
            // Welcome Screen
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-white" />
              </div>
              
              <div className="space-y-3 max-w-lg">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Welcome to CARITAS AI
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Your intelligent academic companion is here to help with studies, research, 
                  and problem-solving.
                </p>
              </div>
              
              {/* Quick Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-2xl">
                {quickSuggestions.map((suggestion, index) => (
                  <Card
                    key={index}
                    className="p-3 sm:p-4 hover:shadow-md transition-all duration-200 cursor-pointer group border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600"
                    onClick={() => handleSendMessage(suggestion.prompt)}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                        <suggestion.icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm mb-1">
                          {suggestion.title}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 hidden sm:block">
                          {suggestion.prompt}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            // Chat Messages
            <div className="space-y-4">
              {messages.map((message, index) => (
                <EnhancedChatMessage
                  key={index}
                  message={message}
                  isUser={message.role === 'user'}
                />
              ))}
              
              {isProcessing && (
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="relative w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      AI is thinking...
                      {retryCount > 0 && (
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                          (Retry {retryCount}/3)
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Processing your request...
                    </p>
                  </div>
                  {retryCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (abortControllerRef.current) {
                          abortControllerRef.current.abort();
                        }
                      }}
                      className="h-7 px-2 text-xs"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Input Area */}
      <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 px-4 sm:px-6 py-4">
        <EnhancedChatInput 
          onSendMessage={handleSendMessage} 
          disabled={isProcessing || isLoadingHistory}
          onRetry={retryLastMessage}
          showRetry={messages.length > 0 && messages[messages.length - 1]?.role === 'error'}
        />
      </div>
    </div>
  );
};
