import { useState } from "react";
import ChatHeader from "@/components/ChatHeader";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import WelcomeScreen from "@/components/WelcomeScreen";
import Navigation from "@/components/Navigation";
import { findResponse } from "@/data/chatResponses";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  text: string;
  isUser: boolean;
  id: string;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = isMobileMenuOpen ? 'auto' : 'hidden';
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleMobileMenu}
      />
      
      <div 
        className={cn(
          "fixed left-0 top-0 z-30 h-full w-[260px] transform transition-transform duration-300 ease-in-out md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Navigation />
      </div>
      
      <div className="flex-1 pl-0 md:pl-[260px]">
        <div className="relative flex h-full flex-col">
          <div className="flex items-center md:hidden border-b px-4 h-16 bg-background/80 backdrop-blur">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="mr-2"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <ChatHeader />
          </div>
          
          <div className="hidden md:block">
            <ChatHeader />
          </div>
          
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
            <ChatInput 
              onSendMessage={handleSendMessage} 
              disabled={isResponseLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
