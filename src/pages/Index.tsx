
import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ChatHeader from "@/components/ChatHeader";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import WelcomeScreen from "@/components/WelcomeScreen";
import Navigation from "@/components/Navigation";
import { APIInfoDisplay } from "@/components/APIInfoDisplay";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAIProcessor } from "@/hooks/useAIProcessor";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  text: string;
  isUser: boolean;
  id: string;
}

const Index = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { processQuery } = useAIProcessor();
  const queryClient = useQueryClient();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save chat to history
  const saveChatMutation = useMutation({
    mutationFn: async (data: { title: string, content: string }) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('chat_history')
        .insert({
          user_id: user.id,
          title: data.title,
          content: data.content,
          category: 'general'
        });
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
    }
  });

  const handleStartChat = () => {
    setShowWelcome(false);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    
    const newMessage = {
      text: message,
      isUser: true,
      id: Date.now().toString()
    };
    
    setMessages((prev) => [...prev, newMessage]);
    setIsResponseLoading(true);

    try {
      // Use the edge function to process the query
      const aiResponse = await processQuery(message, 'google-ai'); // Prioritize Google AI
      
      if (aiResponse) {
        const response = {
          text: aiResponse,
          isUser: false,
          id: (Date.now() + 1).toString()
        };
        
        setMessages((prev) => [...prev, response]);
        
        // Save conversation to chat history
        if (user) {
          saveChatMutation.mutate({
            title: message.length > 30 ? `${message.substring(0, 27)}...` : message,
            content: `Q: ${message}\n\nA: ${aiResponse}`
          });
        }
      }
    } catch (error) {
      console.error("Error getting AI response:", error);
      let errorMessage = "Sorry, I encountered an error processing your request. Please try again later.";
      
      // Check if this is an API quota exceeded error
      if (error instanceof Error && 
          (error.message.includes("quota") || 
           error.message.includes("capacity") || 
           error.message.includes("rate limit"))) {
        errorMessage = "I'm currently experiencing high demand and have reached my capacity limit. Please try again in a few minutes.";
        toast.error("AI service temporarily unavailable due to high demand", {
          description: "Please try again in a few minutes."
        });
      }
      
      const errorResponse = {
        text: errorMessage,
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
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity duration-300",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleMobileMenu}
      />
      
      <Navigation />
      
      <div className="flex-1 pl-[70px] md:pl-[260px] transition-all duration-300">
        <div className="relative flex h-full flex-col">
          <div className="flex items-center md:hidden border-b px-4 h-16 bg-background/80 backdrop-blur dark:bg-slate-800/80 dark:border-slate-700 sticky top-0 z-10">
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
          
          <div className="flex-1 overflow-y-auto bg-slate-50/30 dark:bg-slate-900/30 scrollbar-thin">
            {showWelcome ? (
              <WelcomeScreen 
                onStartChat={handleStartChat} 
                onSelectSuggestion={handleSelectSuggestion}
              />
            ) : (
              <div className="pb-32 px-4">
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
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {!showWelcome && (
            <div className="sticky bottom-0 z-10">
              <ChatInput 
                onSendMessage={handleSendMessage} 
                disabled={isResponseLoading}
              />
            </div>
          )}
          
          {/* Add API Status Display */}
          {!showWelcome && !isMobile && (
            <div className="absolute bottom-20 right-4 z-10 w-80">
              <APIInfoDisplay />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
