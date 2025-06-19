
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {showApiInfo && <APIInfoDisplay onClose={() => setShowApiInfo(false)} />}
      
      {/* Main content area - scrollable */}
      <div className="flex-grow overflow-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header - now scrollable */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white" />
                  <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    CARITAS AI Chat
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400">Your intelligent study companion</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApiInfo(true)}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <Info className="h-4 w-4" />
                </Button>
                
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Chat content */}
          {isFirstMessage && messages.length === 0 ? (
            <div className="space-y-12 animate-fade-in">
              <WelcomeScreen 
                onStartChat={() => setIsFirstMessage(false)}
                onSelectSuggestion={(suggestion) => handleSendMessage(suggestion)}
              />
              
              <div className="border-t pt-12">
                <SuggestionCarousel 
                  onSelectSuggestion={(suggestion) => handleSendMessage(suggestion)}
                />
              </div>
            </div>
          ) : (
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
                <Card className="p-6 border-blue-200 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:border-blue-800 dark:from-blue-950/20 dark:to-purple-950/20 animate-fade-in">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-100">AI is thinking...</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Processing your request with care</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Chat input area - Fixed at bottom */}
      <div className="sticky bottom-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ChatInput 
            onSendMessage={handleSendMessage} 
            disabled={isProcessing} 
            showPromptSuggestions={false}
          />
          
          {isFirstMessage && (
            <div className="mt-4 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Start a conversation or choose from the suggestions above
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
