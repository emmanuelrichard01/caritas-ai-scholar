
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ChatInput from '@/components/ChatInput';
import ChatMessage from '@/components/ChatMessage';
import WelcomeScreen from '@/components/WelcomeScreen';
import { APIInfoDisplay } from '@/components/APIInfoDisplay';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useAIProcessor } from '@/hooks/useAIProcessor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
  const isMobile = useIsMobile();

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message to chat
    const userMessage: Message = { role: 'user', content: message };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsFirstMessage(false);

    try {
      // Process the message with AI
      const response = await processQuery(message);
      
      if (response) {
        // Add AI response to chat
        setMessages([...newMessages, { role: 'assistant', content: response }]);
      } else {
        // Add error message if no response
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
    <div className={cn(
      "flex flex-col h-screen transition-all duration-300",
      isMobile ? 'pt-16' : 'pl-[70px] md:pl-[260px]'
    )}>
      {showApiInfo && <APIInfoDisplay onClose={() => setShowApiInfo(false)} />}
      
      {/* Chat messages area */}
      <div className="flex-grow overflow-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isFirstMessage && messages.length === 0 ? (
            <WelcomeScreen 
              onStartChat={() => setIsFirstMessage(false)}
              onSelectSuggestion={(suggestion) => handleSendMessage(suggestion)}
            />
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <ChatMessage 
                  key={index} 
                  message={message.content}
                  isUser={message.role === 'user'}
                  isLoading={false} 
                />
              ))}
              {isProcessing && (
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent dark:border-slate-400"></div>
                  Thinking...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Chat input area - Fixed at bottom */}
      <div className="border-t dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {messages.length > 0 && (
            <div className="flex justify-end mb-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs flex items-center text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                onClick={clearHistory}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear History
              </Button>
            </div>
          )}
          
          <ChatInput 
            onSendMessage={handleSendMessage} 
            disabled={isProcessing} 
            showPromptSuggestions={isFirstMessage}
          />
        </div>
      </div>
    </div>
  );
};
