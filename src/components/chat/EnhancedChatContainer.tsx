
import { useState, useRef, useEffect } from 'react';
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
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
      {/* Simple Header */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
              CARITAS AI Chat
            </h1>
          </div>
          
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearHistory}
              className="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 overflow-hidden">
        <div 
          ref={chatContainerRef}
          className="h-full overflow-y-auto p-3 sm:p-4"
        >
          {isFirstMessage && messages.length === 0 ? (
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
                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      AI is thinking...
                    </p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 p-3 sm:p-4">
        <EnhancedChatInput 
          onSendMessage={handleSendMessage} 
          disabled={isProcessing}
        />
      </div>
    </div>
  );
};
