
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import { ReactNode } from "react";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  isLoading?: boolean;
}

const ChatMessage = ({ message, isUser, isLoading = false }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex gap-3 p-4 animate-fade-in",
        isUser ? "bg-caritas/5" : "bg-background"
      )}
    >
      <div
        className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
          isUser ? "bg-slate-700" : "bg-caritas"
        )}
      >
        {isUser ? (
          <User className="h-5 w-5 text-white" />
        ) : (
          <Bot className="h-5 w-5 text-white" />
        )}
      </div>
      <div className="flex-1">
        <div className="mb-1 text-sm font-medium">
          {isUser ? "You" : "CARITAS AI"}
        </div>
        {isLoading ? (
          <div className="flex gap-1 mt-2">
            <div className="h-2 w-2 rounded-full bg-caritas animate-pulse"></div>
            <div className="h-2 w-2 rounded-full bg-caritas animate-pulse [animation-delay:0.2s]"></div>
            <div className="h-2 w-2 rounded-full bg-caritas animate-pulse [animation-delay:0.4s]"></div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            {message.split("\n").map((paragraph, index) => (
              <p key={index} className={`mb-2 ${paragraph.startsWith("•") ? "ml-4" : ""}`}>
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
