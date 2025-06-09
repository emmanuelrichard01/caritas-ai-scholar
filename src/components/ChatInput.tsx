
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { FormEvent, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  showPromptSuggestions?: boolean;
}

const ChatInput = ({ onSendMessage, disabled = false, showPromptSuggestions = false }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-resize textarea based on content
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue);
      setInputValue("");
      // Reset height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter without shift key
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={cn(
        "relative flex items-end rounded-2xl border bg-background shadow-sm transition-all duration-200",
        isFocused ? "ring-2 ring-caritas/20 border-caritas/30" : "border-border",
        "hover:border-caritas/40"
      )}>
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about Caritas University, study tips, or academic guidance..."
          className="flex-1 min-h-[52px] max-h-[120px] resize-none bg-transparent border-0 p-4 pr-12 focus-visible:ring-0 focus:outline-none placeholder:text-muted-foreground/60 text-sm"
          disabled={disabled}
          rows={1}
        />
        <Button 
          type="submit" 
          size="icon"
          disabled={disabled || !inputValue.trim()}
          className="absolute right-2 bottom-2 h-8 w-8 bg-caritas hover:bg-caritas-light transition-all duration-200 rounded-lg shadow-sm"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex justify-between items-center mt-2 px-1">
        <span className="text-xs text-muted-foreground/70">
          Press Shift+Enter for new line
        </span>
        <span className="text-xs text-muted-foreground/50">
          Powered by AI
        </span>
      </div>
    </form>
  );
};

export default ChatInput;
