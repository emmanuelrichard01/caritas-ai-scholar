import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const EnhancedChatInput = ({
  onSendMessage,
  disabled = false,
  onRetry,
  showRetry = false,
}: EnhancedChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
    }
  }, [message]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={cn(
          "relative flex items-end gap-2 p-2 pl-4 rounded-2xl border bg-card transition-smooth",
          isFocused ? "border-foreground/30 shadow-soft" : "border-border/60 hover:border-foreground/20"
        )}
      >
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Message CARITAS AI…"
          className="flex-1 min-h-[40px] max-h-[160px] resize-none bg-transparent border-0 p-2 text-[15px] focus-visible:ring-0 focus:outline-none placeholder:text-muted-foreground/60 text-foreground shadow-none"
          disabled={disabled}
          rows={1}
        />

        <div className="flex items-center gap-1 pb-1 pr-1">
          {showRetry && onRetry && (
            <Button
              type="button"
              onClick={onRetry}
              variant="ghost"
              size="iconSm"
              disabled={disabled}
              title="Retry"
              className="text-warning hover:text-warning"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}

          <Button
            type="submit"
            disabled={!canSend}
            size="iconSm"
            variant="default"
            className={cn(
              "rounded-full h-9 w-9 transition-smooth",
              canSend ? "scale-100 opacity-100" : "scale-95 opacity-50"
            )}
            title="Send"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex justify-center mt-2">
        <span className="text-[11px] text-muted-foreground/70">
          Press <kbd className="px-1.5 py-0.5 rounded bg-muted/60 text-foreground/70 font-mono text-[10px]">Enter</kbd> to send · <kbd className="px-1.5 py-0.5 rounded bg-muted/60 text-foreground/70 font-mono text-[10px]">Shift+Enter</kbd> for new line
        </span>
      </div>
    </form>
  );
};
