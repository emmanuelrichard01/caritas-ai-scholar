
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ChatInput from '@/components/ChatInput';
import ChatMessage from '@/components/ChatMessage';
import { Button } from '@/components/ui/button';
import { Trash2, Sparkles, MessageSquare } from 'lucide-react';
import { useAIProcessor } from '@/hooks/useAIProcessor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Message {
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;
}

const welcomeSuggestions = [
  "Help me understand calculus concepts",
  "Create a study schedule for finals",
  "Explain quantum physics basics",
  "Research paper writing tips"
];

export const ModernChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const { user } = useAuth();
  const { processQuery, isProcessing } = useAIProcessor();

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = { role: 'user', content: message };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsFirstMessage(false);

    try {
      const response = await processQuery(message);
      
      if (response) {
        setMessages([...newMessages, { role: 'assistant', content: response }]);
      } else {
        setMessages([...newMessages, { 
          role: 'error', 
          content: 'I encountered an error processing your message. Please try again.' 
        }]);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages([...newMessages, { 
        role: 'error', 
        content: 'An unexpected error occurred. Please try again later.' 
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
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50/20 dark:from-slate-950 dark:to-slate-900">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {isFirstMessage && messages.length === 0 ? (
            // Welcome Screen - Modern & Clean
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="relative mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
                  <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-yellow-800" />
                </div>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome to CARITAS AI
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md text-base sm:text-lg">
                Your intelligent academic companion. Ask me anything about your studies!
              </p>
              
              {/* Quick Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mb-8">
                {welcomeSuggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="p-4 h-auto text-left justify-start bg-white/60 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
                    onClick={() => handleSendMessage(suggestion)}
                  >
                    <span className="text-sm font-medium">{suggestion}</span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            // Chat Messages
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div key={index} className="animate-fade-in">
                  <ChatMessage 
                    message={message.content}
                    isUser={message.role === 'user'}
                    isLoading={false} 
                  />
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex items-center gap-3 p-4 bg-white/80 dark:bg-slate-800/80 rounded-2xl border border-blue-200 dark:border-blue-800 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">AI is thinking...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Input Area - Clean & Minimal */}
      <div className="border-t border-slate-200/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* Clear History Button - Only show when there are messages */}
          {messages.length > 0 && (
            <div className="flex justify-end mb-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear chat
              </Button>
            </div>
          )}
          
          <ChatInput 
            onSendMessage={handleSendMessage} 
            disabled={isProcessing} 
            showPromptSuggestions={false}
          />
          
          {isFirstMessage && (
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-2">
              Start a conversation or choose from the suggestions above
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
