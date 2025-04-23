
import { Bot, Copy, ThumbsUp, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { toast } from "@/hooks/use-toast";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  isLoading?: boolean;
}

const ChatMessage = ({ message, isUser, isLoading = false }: ChatMessageProps) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
    toast({
      description: "Message copied to clipboard",
      duration: 2000
    });
  };

  return (
    <div
      className={cn(
        "group relative",
        isUser ? "bg-background" : "bg-slate-50"
      )}
    >
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex gap-4">
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
          <div className="flex-1 space-y-2">
            <div className="font-semibold">
              {isUser ? "You" : "CARITAS AI"}
            </div>
            {isLoading ? (
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-caritas animate-pulse"></div>
                <div className="h-2 w-2 rounded-full bg-caritas animate-pulse [animation-delay:0.2s]"></div>
                <div className="h-2 w-2 rounded-full bg-caritas animate-pulse [animation-delay:0.4s]"></div>
              </div>
            ) : (
              <div className="prose prose-slate max-w-none">
                {message.split("\n").map((paragraph, index) => (
                  <p key={index} className={paragraph.startsWith("•") ? "ml-4" : ""}>
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {!isLoading && (
          <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                className="h-8 w-8"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
