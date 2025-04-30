
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot, User } from "lucide-react";
import { useAIProcessor } from "@/hooks/useAIProcessor";

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
  
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    const newMessages = [
      ...messages,
      { role: 'user', content: userInput }
    ];
    
    setMessages(newMessages);
    setUserInput('');
    
    // Process the query with the AI
    const response = await processQuery(`Context from learning materials: ${materialContext}\n\nQuestion: ${userInput}`, 'course-tutor');
    
    if (response) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: response }
      ]);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isProcessing) {
      handleSendMessage();
    }
  };
  
  return (
    <Card className="p-4 md:p-6 dark:bg-slate-900">
      <h3 className="text-lg font-medium mb-3 dark:text-white">Ask about your materials</h3>
      
      <div className="bg-slate-50 dark:bg-slate-800 rounded-md p-3 h-64 mb-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-3 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[75%] p-3 rounded-lg ${
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
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex justify-start mb-3">
            <div className="bg-white dark:bg-slate-700 p-3 rounded-lg max-w-[75%] dark:text-white">
              <div className="flex items-center">
                <Bot className="h-4 w-4 mr-1 text-blue-500 dark:text-blue-400" />
                <span className="text-xs font-medium">Study Assistant</span>
              </div>
              <div className="flex items-center mt-2">
                <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></div>
                <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse mx-1 [animation-delay:0.2s]"></div>
                <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <Input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask a question..."
          onKeyPress={handleKeyPress}
          disabled={isProcessing}
          className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={isProcessing || !userInput.trim()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};
