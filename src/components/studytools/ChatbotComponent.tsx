
import { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Info, AlertTriangle, Loader2 } from "lucide-react";
import { useAIProcessor } from "@/hooks/useAIProcessor";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FormattedContent } from "@/components/FormattedContent";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotComponentProps {
  materialContext: string;
}

export const ChatbotComponent = ({ materialContext }: ChatbotComponentProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your study assistant. Ask me anything about your learning materials." }
  ]);
  const [userInput, setUserInput] = useState('');
  const { processQuery, isProcessing } = useAIProcessor();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    const userMessage: Message = { role: 'user', content: userInput };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setUserInput('');
    
    // Process the query with the AI
    const response = await processQuery(
      `Context from learning materials: ${materialContext}\n\nQuestion: ${userInput}`, 
      'material-tutor'
    );
    
    if (response) {
      const assistantMessage: Message = { role: 'assistant', content: response };
      setMessages([...newMessages, assistantMessage]);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isProcessing) {
      handleSendMessage();
    }
  };
  
  return (
    <Card className="p-4 md:p-6 dark:bg-slate-900 flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium dark:text-white flex items-center">
          Ask about your materials
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-blue-500 ml-2 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              Ask specific questions about your uploaded learning materials. I'll provide personalized answers based on your content.
            </TooltipContent>
          </Tooltip>
        </h3>
        
        {materialContext ? (
          <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
            Materials loaded
          </span>
        ) : (
          <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            No materials
          </span>
        )}
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3 flex-grow mb-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-3 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white ml-4' 
                  : 'bg-white dark:bg-slate-700 dark:text-white mr-4'
              }`}
            >
              <div className="flex items-center mb-1">
                {message.role === 'assistant' ? (
                  <Bot className="h-4 w-4 mr-1 text-blue-500 dark:text-blue-400" />
                ) : (
                  <User className="h-4 w-4 mr-1" />
                )}
                <span className="text-xs font-medium">
                  {message.role === 'assistant' ? 'Study Assistant' : 'You'}
                </span>
              </div>
              {message.role === 'assistant' ? (
                <FormattedContent content={message.content} variant="chat" />
              ) : (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              )}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start mb-3">
            <div className="bg-white dark:bg-slate-700 p-3 rounded-lg max-w-[80%] dark:text-white">
              <div className="flex items-center">
                <Bot className="h-4 w-4 mr-1 text-blue-500 dark:text-blue-400" />
                <span className="text-xs font-medium">Study Assistant</span>
              </div>
              <div className="flex items-center mt-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-xs ml-2">Analyzing your materials...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex gap-2">
        <Input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={materialContext ? "Ask about your materials..." : "Upload materials first, then ask questions..."}
          onKeyPress={handleKeyPress}
          disabled={isProcessing || !materialContext}
          className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={isProcessing || !userInput.trim() || !materialContext}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      {!materialContext && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
          Please upload study materials and generate notes first to enable the chat feature.
        </p>
      )}
    </Card>
  );
};
