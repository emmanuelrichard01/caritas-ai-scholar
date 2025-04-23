
import { Bot, Copy, ThumbsUp, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  isLoading?: boolean;
}

const ChatMessage = ({ message, isUser, isLoading = false }: ChatMessageProps) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
    toast.success("Message copied to clipboard");
  };

  return (
    <div
      className={cn(
        "group/message relative transition-colors duration-200",
        isUser ? "bg-background" : "bg-slate-50/50"
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
            <div className="font-semibold text-sm">
              {isUser ? "You" : "CARITAS AI"}
            </div>
            {isLoading ? (
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-caritas animate-pulse"></div>
                <div className="h-2 w-2 rounded-full bg-caritas animate-pulse [animation-delay:0.2s]"></div>
                <div className="h-2 w-2 rounded-full bg-caritas animate-pulse [animation-delay:0.4s]"></div>
              </div>
            ) : (
              <div className="prose prose-slate prose-p:leading-relaxed prose-pre:p-0 max-w-none">
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
          <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover/message:opacity-100">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                className="h-8 w-8 hover:bg-slate-100"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-slate-100"
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
