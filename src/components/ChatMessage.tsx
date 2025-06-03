
import { Bot, Copy, ThumbsDown, ThumbsUp, User, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { FormattedContent } from "./FormattedContent";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  isLoading?: boolean;
}

const ChatMessage = ({ message, isUser, isLoading = false }: ChatMessageProps) => {
  const [liked, setLiked] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("Message copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
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

  return (
    <div className={cn(
      "group/message relative transition-all duration-200 border-b border-border/50 last:border-b-0",
      isUser 
        ? "bg-gradient-to-r from-transparent to-muted/20" 
        : "bg-gradient-to-r from-muted/10 to-transparent"
    )}>
      <div className="mx-auto max-w-4xl px-4 py-6 md:px-6 md:py-8">
        <div className="flex gap-4 md:gap-6">
          {/* Avatar */}
          <div className={cn(
            "h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
            isUser 
              ? "bg-gradient-to-br from-slate-600 to-slate-700" 
              : "bg-gradient-to-br from-caritas to-caritas-light"
          )}>
            {isUser ? (
              <User className="h-4 w-4 md:h-5 md:w-5 text-white" />
            ) : (
              <Bot className="h-4 w-4 md:h-5 md:w-5 text-white" />
            )}
          </div>
          
          {/* Content */}
          <div className="flex-1 space-y-2 overflow-hidden min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm md:text-base text-foreground">
                {isUser ? "You" : "CARITAS AI"}
              </span>
              {!isUser && (
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-soft"></div>
              )}
            </div>
            
            {isLoading ? (
              <div className="flex items-center space-x-2 py-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-caritas rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-caritas rounded-full animate-pulse [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-caritas rounded-full animate-pulse [animation-delay:0.4s]"></div>
                </div>
                <span className="text-sm text-muted-foreground">
                  Thinking carefully about your question...
                </span>
              </div>
            ) : (
              <div className={cn(
                "transition-opacity duration-200",
                isUser ? "bg-muted/30 rounded-lg p-3 md:p-4" : ""
              )}>
                {isUser ? (
                  <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {message}
                  </p>
                ) : (
                  <FormattedContent 
                    content={message} 
                    variant="chat"
                    className="max-w-none"
                  />
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Action buttons */}
        {!isLoading && !isUser && (
          <div className="mt-4 flex items-center justify-between opacity-0 group-hover/message:opacity-100 transition-opacity duration-200">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyToClipboard}
                className="h-8 px-3 text-xs hover:bg-muted"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback(true)}
                className={cn(
                  "h-8 px-3 text-xs hover:bg-muted",
                  liked === true && "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                )}
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                Helpful
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFeedback(false)}
                className={cn(
                  "h-8 px-3 text-xs hover:bg-muted",
                  liked === false && "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                )}
              >
                <ThumbsDown className="h-3 w-3 mr-1" />
                Not helpful
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
