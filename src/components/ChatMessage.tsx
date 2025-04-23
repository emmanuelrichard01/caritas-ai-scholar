
import { Bot, Copy, ThumbsDown, ThumbsUp, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useState } from "react";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  isLoading?: boolean;
}

const ChatMessage = ({ message, isUser, isLoading = false }: ChatMessageProps) => {
  const [liked, setLiked] = useState<boolean | null>(null);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
    toast.success("Message copied to clipboard");
  };

  const handleFeedback = (isPositive: boolean) => {
    if (liked === isPositive) {
      setLiked(null);
      toast.info("Feedback removed");
    } else {
      setLiked(isPositive);
      toast.success(isPositive ? "Thank you for your positive feedback!" : "Thank you for your feedback. We'll work to improve.");
    }
  };

  // Function to render markdown-like content
  const renderFormattedText = (text: string) => {
    // Format bold text
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Format italic text
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Format underlined text
    formattedText = formattedText.replace(/_(.*?)_/g, '<u>$1</u>');
    
    // Split into paragraphs
    const paragraphs = formattedText.split('\n');
    
    return paragraphs.map((paragraph, index) => {
      if (!paragraph.trim()) return <br key={index} />;
      
      if (paragraph.startsWith('•') || paragraph.startsWith('-')) {
        return (
          <p 
            key={index} 
            className="ml-4 mb-2" 
            dangerouslySetInnerHTML={{ __html: paragraph }}
          />
        );
      }
      
      return (
        <p 
          key={index} 
          className="mb-2" 
          dangerouslySetInnerHTML={{ __html: paragraph }}
        />
      );
    });
  };

  return (
    <div
      className={cn(
        "group/message relative transition-colors duration-200",
        isUser ? "bg-background dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-800/30"
      )}
    >
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
        <div className="flex gap-4 md:gap-6">
          <div
            className={cn(
              "h-8 w-8 rounded-md flex items-center justify-center flex-shrink-0",
              isUser ? "bg-slate-700" : "bg-caritas"
            )}
          >
            {isUser ? (
              <User className="h-5 w-5 text-white" />
            ) : (
              <Bot className="h-5 w-5 text-white" />
            )}
          </div>
          <div className="flex-1 space-y-2 overflow-hidden">
            <div className="font-semibold text-sm dark:text-white">
              {isUser ? "You" : "CARITAS AI"}
            </div>
            {isLoading ? (
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-caritas animate-pulse"></div>
                <div className="h-2 w-2 rounded-full bg-caritas animate-pulse [animation-delay:0.2s]"></div>
                <div className="h-2 w-2 rounded-full bg-caritas animate-pulse [animation-delay:0.4s]"></div>
              </div>
            ) : (
              <div className="prose prose-slate prose-p:leading-relaxed prose-pre:p-0 max-w-none dark:prose-invert">
                {renderFormattedText(message)}
              </div>
            )}
          </div>
        </div>
        
        {!isLoading && !isUser && (
          <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover/message:opacity-100">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Copy message"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleFeedback(true)}
                className={cn(
                  "h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800",
                  liked === true && "text-green-600 bg-green-50 dark:bg-green-900/20"
                )}
                title="Helpful"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleFeedback(false)}
                className={cn(
                  "h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-800",
                  liked === false && "text-red-600 bg-red-50 dark:bg-red-900/20"
                )}
                title="Not helpful"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
