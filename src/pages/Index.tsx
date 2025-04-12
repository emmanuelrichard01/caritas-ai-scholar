
import { useState } from "react";
import ChatHeader from "@/components/ChatHeader";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import WelcomeScreen from "@/components/WelcomeScreen";
import { findResponse } from "@/data/chatResponses";

interface Message {
  text: string;
  isUser: boolean;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isResponseLoading, setIsResponseLoading] = useState(false);

  const handleStartChat = () => {
    setShowWelcome(false);
  };

  const handleSendMessage = (message: string) => {
    // Add user message
    setMessages((prev) => [...prev, { text: message, isUser: true }]);
    setIsResponseLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = findResponse(message);
      setMessages((prev) => [...prev, { text: response, isUser: false }]);
      setIsResponseLoading(false);
    }, 1500);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setShowWelcome(false);
    handleSendMessage(suggestion);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <ChatHeader />
      
      <div className="flex-1 overflow-y-auto">
        {showWelcome ? (
          <WelcomeScreen 
            onStartChat={handleStartChat} 
            onSelectSuggestion={handleSelectSuggestion}
          />
        ) : (
          <>
            <div className="pb-24">
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
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
          </>
        )}
      </div>
      
      {!showWelcome && (
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={isResponseLoading}
        />
      )}
    </div>
  );
};

export default Index;
