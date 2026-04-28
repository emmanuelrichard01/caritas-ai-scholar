import { Sparkles, User, Copy, ThumbsUp, ThumbsDown, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { FormattedContent } from "@/components/FormattedContent";

interface Message {
  role: "user" | "assistant" | "system" | "error";
  content: string;
  timestamp?: Date;
}

interface EnhancedChatMessageProps {
  message: Message;
  isUser: boolean;
}

export const EnhancedChatMessage = ({ message, isUser }: EnhancedChatMessageProps) => {
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null);
  const [copied, setCopied] = useState(false);
  const isError = message.role === "error";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleFeedback = (type: "positive" | "negative") => {
    setFeedback(feedback === type ? null : type);
  };

  return (
    <div className={cn("group flex gap-3 animate-fade-in", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm",
          isUser
            ? "bg-brand/10 text-brand border border-brand/20"
            : isError
            ? "bg-destructive/10 text-destructive"
            : "bg-brand text-white"
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5" />
        ) : isError ? (
          <AlertCircle className="h-3.5 w-3.5" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
      </div>

      {/* Body */}
      <div className={cn("flex-1 min-w-0 max-w-[85%]", isUser ? "flex flex-col items-end" : "flex flex-col items-start")}>
        <div className={cn("flex items-baseline gap-2 mb-1", isUser ? "flex-row-reverse" : "flex-row")}>
          <span className="text-xs font-medium text-foreground">
            {isUser ? "You" : "CARITAS AI"}
          </span>
          {message.timestamp && (
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>

        <div
          className={cn(
            "px-5 py-3.5 rounded-3xl text-[15px] leading-relaxed transition-smooth shadow-sm",
            isUser
              ? "bg-brand text-white rounded-tr-sm"
              : isError
              ? "bg-destructive/5 border border-destructive/20 text-foreground rounded-tl-sm"
              : "bg-card border border-border/40 text-foreground rounded-tl-sm shadow-soft"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <FormattedContent content={message.content} variant="chat" className="max-w-none" />
          )}
        </div>

        {/* Actions */}
        {!isUser && !isError && (
          <div className="flex items-center gap-0.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button variant="ghost" size="iconSm" onClick={handleCopy} className="h-7 w-7 text-muted-foreground hover:text-foreground" title="Copy">
              {copied ? <CheckCircle className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="iconSm"
              onClick={() => handleFeedback("positive")}
              className={cn("h-7 w-7", feedback === "positive" ? "text-success" : "text-muted-foreground hover:text-foreground")}
              title="Helpful"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="iconSm"
              onClick={() => handleFeedback("negative")}
              className={cn("h-7 w-7", feedback === "negative" ? "text-destructive" : "text-muted-foreground hover:text-foreground")}
              title="Not helpful"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
