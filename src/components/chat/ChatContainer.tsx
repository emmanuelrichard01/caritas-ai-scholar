
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ChatInput from '@/components/ChatInput';
import ChatMessage from '@/components/ChatMessage';
import WelcomeScreen from '@/components/WelcomeScreen';
import { SuggestionCarousel } from '@/components/chat/SuggestionCarousel';
import { APIInfoDisplay } from '@/components/APIInfoDisplay';
import { Button } from '@/components/ui/button';
import { Trash2, Info, Sparkles } from 'lucide-react';
import { useAIProcessor } from '@/hooks/useAIProcessor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';

export interface Message {
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;
}

export const ChatContainer = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const { user } = useAuth();
  const { processQuery, isProcessing } = useAIProcessor();
  const [showApiInfo, setShowApiInfo] = useState(false);

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
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {showApiInfo && <APIInfoDisplay onClose={() => setShowApiInfo(false)} />}
      
      {/* Main content area - scrollable */}
      <div className="flex-grow overflow-auto">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Header actions - responsive */}
          <div className="mb-6 sm:mb-8 animate-fade-in">
            <div className="flex items-center justify-end gap-2 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowApiInfo(true)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <Info className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">API Info</span>
              </Button>
              
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Clear</span>
                </Button>
              )}
            </div>
          </div>

          {/* Chat content */}
          {isFirstMessage && messages.length === 0 ? (
            <div className="space-y-8 sm:space-y-12 animate-fade-in">
              <WelcomeScreen 
                onStartChat={() => setIsFirstMessage(false)}
                onSelectSuggestion={(suggestion) => handleSendMessage(suggestion)}
              />
              
              <div className="border-t pt-8 sm:pt-12">
                <SuggestionCarousel 
                  onSelectSuggestion={(suggestion) => handleSendMessage(suggestion)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
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
                <Card className="p-4 sm:p-6 border-blue-200 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:border-blue-800 dark:from-blue-950/20 dark:to-purple-950/20 animate-fade-in">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <div className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-100 text-sm sm:text-base">AI is thinking...</p>
                      <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">Processing your request with care</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Chat input area - Fixed at bottom, mobile responsive */}
      <div className="sticky bottom-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 shadow-lg">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <ChatInput 
            onSendMessage={handleSendMessage} 
            disabled={isProcessing} 
            showPromptSuggestions={false}
          />
          
          {isFirstMessage && (
            <div className="mt-3 sm:mt-4 text-center">
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Start a conversation or choose from the suggestions above
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
