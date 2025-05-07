
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ChatInput from '@/components/ChatInput';
import ChatMessage from '@/components/ChatMessage';
import WelcomeScreen from '@/components/WelcomeScreen';
import { APIInfoDisplay } from '@/components/APIInfoDisplay';
import { Button } from '@/components/ui/button';
import { MessageSquare, AlertTriangle, Trash2 } from 'lucide-react';
import { useAIProcessor } from '@/hooks/useAIProcessor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    <div className="flex flex-col h-full">
      {showApiInfo && <APIInfoDisplay onClose={() => setShowApiInfo(false)} />}
      
      {/* Chat messages area */}
      <div className="flex-grow overflow-auto p-4">
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
      
      {/* Chat input area */}
      <div className="border-t dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="container max-w-4xl mx-auto p-4 flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs flex items-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                onClick={() => setShowApiInfo(true)}
              >
                <AlertTriangle className="h-3 w-3 mr-1" />
                API Status & Limits
              </Button>
            </div>
            
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs flex items-center text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                onClick={clearHistory}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear History
              </Button>
            )}
          </div>
          
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
