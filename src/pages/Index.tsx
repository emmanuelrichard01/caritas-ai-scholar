
import { useState } from "react";
import ChatHeader from "@/components/ChatHeader";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import WelcomeScreen from "@/components/WelcomeScreen";
import Navigation from "@/components/Navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useApiConfig } from "@/hooks/useApiConfig";

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
  const { getAiResponse } = useApiConfig();

  const handleStartChat = () => {
    setShowWelcome(false);
  };

  const handleSendMessage = async (message: string) => {
    const newMessage = {
      text: message,
      isUser: true,
      id: Date.now().toString()
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setIsResponseLoading(true);

    try {
      const aiResponse = await getAiResponse(message);
      
      const response = {
        text: aiResponse,
        isUser: false,
        id: (Date.now() + 1).toString()
      };
      
      setMessages((prev) => [...prev, response]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      const errorResponse = {
        text: "Sorry, I encountered an error processing your request. Please try again later.",
        isUser: false,
        id: (Date.now() + 1).toString()
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsResponseLoading(false);
    }
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
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleMobileMenu}
      />
      
      <Navigation />
      
      <div className="flex-1 pl-[70px] md:pl-[260px] transition-all duration-300">
        <div className="relative flex h-full flex-col">
          <div className="flex items-center md:hidden border-b px-4 h-16 bg-background/80 backdrop-blur dark:bg-slate-900/80 dark:border-slate-800">
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
          
          <div className="flex-1 overflow-y-auto bg-slate-50/30 dark:bg-slate-900/30">
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
