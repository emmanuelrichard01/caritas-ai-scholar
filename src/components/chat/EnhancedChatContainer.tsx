
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Trash2, 
  MessageSquare, 
  Sparkles, 
  Brain, 
  BookOpen, 
  Calculator,
  Users,
  Lightbulb
} from 'lucide-react';
import { useAIProcessor } from '@/hooks/useAIProcessor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EnhancedChatInput } from './EnhancedChatInput';
import { EnhancedChatMessage } from './EnhancedChatMessage';

export interface Message {
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  timestamp?: Date;
}

const quickSuggestions = [
  {
    icon: Brain,
    title: "Study Help",
    prompt: "Help me understand complex calculus concepts with step-by-step explanations",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: BookOpen,
    title: "Research Paper",
    prompt: "Guide me through writing a research paper on quantum physics",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Calculator,
    title: "Problem Solving",
    prompt: "Help me solve advanced mathematics problems with detailed solutions",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Users,
    title: "Study Group",
    prompt: "Create a collaborative study plan for my upcoming finals",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: Lightbulb,
    title: "Creative Ideas",
    prompt: "Suggest innovative project ideas for my computer science course",
    color: "from-yellow-500 to-orange-500"
  }
];

export const EnhancedChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const { user } = useAuth();
  const { processQuery, isProcessing } = useAIProcessor();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = { 
      role: 'user', 
      content: message, 
      timestamp: new Date() 
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsFirstMessage(false);

    try {
      const response = await processQuery(message);
      
      if (response) {
        setMessages([...newMessages, { 
          role: 'assistant', 
          content: response,
          timestamp: new Date()
        }]);
      } else {
        setMessages([...newMessages, { 
          role: 'error', 
          content: 'I encountered an error processing your message. Please try again.',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages([...newMessages, { 
        role: 'error', 
        content: 'An unexpected error occurred. Please try again later.',
        timestamp: new Date()
      }]);
    }
  };

  const clearHistory = async () => {
    if (!user) return;

    try {
      await supabase
        .from('chat_history')
        .delete()
        .eq('user_id', user.id)
        .eq('category', 'google-ai');
      
      setMessages([]);
      setIsFirstMessage(true);
      toast.success('Chat history cleared');
    } catch (error) {
      console.error('Error clearing history:', error);
      toast.error('Failed to clear chat history');
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  CARITAS AI Chat
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Your intelligent academic companion
                </p>
              </div>
            </div>
            
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearHistory}
                className="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 border-slate-200 dark:border-slate-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Chat
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        <div 
          ref={chatContainerRef}
          className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
            {isFirstMessage && messages.length === 0 ? (
              // Welcome Screen
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
                    <MessageSquare className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                </div>
                
                <div className="space-y-4 max-w-2xl">
                  <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Welcome to CARITAS AI
                  </h2>
                  <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    Your intelligent academic companion is here to help with studies, research, 
                    problem-solving, and creative thinking. Let's start your learning journey!
                  </p>
                </div>
                
                {/* Quick Suggestions Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
                  {quickSuggestions.map((suggestion, index) => (
                    <Card
                      key={index}
                      className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 hover:scale-105"
                      onClick={() => handleSendMessage(suggestion.prompt)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${suggestion.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <suggestion.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                            {suggestion.title}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
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
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <EnhancedChatMessage
                    key={index}
                    message={message}
                    isUser={message.role === 'user'}
                  />
                ))}
                
                {isProcessing && (
                  <Card className="p-6 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 animate-fade-in">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <div>
                        <p className="font-semibold text-blue-900 dark:text-blue-100">
                          AI is thinking...
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Analyzing your request with care
                        </p>
                      </div>
                    </div>
                  </Card>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-slate-200/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <EnhancedChatInput 
            onSendMessage={handleSendMessage} 
            disabled={isProcessing}
          />
          
          {isFirstMessage && (
            <div className="mt-4 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Start a conversation by typing a message or selecting a suggestion above
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
