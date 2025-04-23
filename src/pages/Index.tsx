
import { useState } from "react";
import ChatHeader from "@/components/ChatHeader";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import WelcomeScreen from "@/components/WelcomeScreen";
import Navigation from "@/components/Navigation";
import { findResponse } from "@/data/chatResponses";

interface Message {
  text: string;
  isUser: boolean;
  id: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isResponseLoading, setIsResponseLoading] = useState(false);

  const handleStartChat = () => {
    setShowWelcome(false);
  };

  const handleSendMessage = (message: string) => {
    const newMessage = {
      text: message,
      isUser: true,
      id: Date.now().toString()
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setIsResponseLoading(true);

    setTimeout(() => {
      const response = {
        text: findResponse(message),
        isUser: false,
        id: (Date.now() + 1).toString()
      };
      setMessages((prev) => [...prev, response]);
      setIsResponseLoading(false);
    }, 1500);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setShowWelcome(false);
    handleSendMessage(suggestion);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Navigation />
      
      <div className="flex-1 pl-[260px]">
        <div className="relative flex h-full flex-col">
          <ChatHeader />
          
          <div className="flex-1 overflow-y-auto">
            {showWelcome ? (
              <WelcomeScreen 
                onStartChat={handleStartChat} 
                onSelectSuggestion={handleSelectSuggestion}
              />
            ) : (
              <div className="pb-32">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message.text}
                    isUser={message.isUser}
                  />
                ))}
                {isResponseLoading && (
                  <ChatMessage
                    message=""
                    isUser={false}
                    isLoading
                  />
                )}
              </div>
            )}
          </div>
          
          {!showWelcome && (
            <div className="absolute bottom-0 left-0 right-0 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="mx-auto max-w-3xl px-4 py-4">
                <ChatInput 
                  onSendMessage={handleSendMessage} 
                  disabled={isResponseLoading}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
