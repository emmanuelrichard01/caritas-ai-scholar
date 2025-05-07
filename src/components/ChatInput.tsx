
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bold, Italic, Send, Underline } from "lucide-react";
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
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
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

  const applyFormatting = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = inputValue.substring(start, end);

    let formattedText = '';
    let cursorPosition = 0;

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        cursorPosition = start + 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        cursorPosition = start + 1;
        break;
      case 'underline':
        formattedText = `_${selectedText}_`;
        cursorPosition = start + 1;
        break;
      default:
        return;
    }

    // Insert the formatted text
    const newText = inputValue.substring(0, start) + formattedText + inputValue.substring(end);
    setInputValue(newText);

    // Set cursor position after formatting
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.selectionStart = start;
        textarea.selectionEnd = start + formattedText.length;
      } else {
        textarea.selectionStart = cursorPosition;
        textarea.selectionEnd = cursorPosition;
      }
    }, 0);
  };

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0 py-4 dark:bg-slate-900/80 dark:border-slate-800">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-2 max-w-3xl mx-auto px-4"
      >
        <div className={cn(
          "w-full relative flex flex-col rounded-xl",
          isFocused ? "ring-2 ring-caritas ring-opacity-50" : "ring-1 ring-border dark:ring-slate-700",
          "transition-all duration-200"
        )}>
          {/* Formatting toolbar */}
          <div className="flex items-center gap-1 px-3 py-2 border-b dark:border-slate-700">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800" 
              onClick={() => applyFormatting('bold')}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800" 
              onClick={() => applyFormatting('italic')}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800" 
              onClick={() => applyFormatting('underline')}
              title="Underline"
            >
              <Underline className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex w-full items-end">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Caritas University, study tips, or academic guidance..."
              className="flex-1 min-h-[40px] max-h-[200px] resize-none bg-transparent border-0 p-3 pt-2 pb-1 focus-visible:ring-0 focus:outline-none placeholder:text-muted-foreground/70"
              disabled={disabled}
              rows={1}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={disabled || !inputValue.trim()}
              className="bg-caritas hover:bg-caritas-light transition-colors my-1 mr-2 rounded-lg"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="text-xs text-muted-foreground flex justify-between w-full px-2">
          <span>Use Shift+Enter for new line</span>
          <span>Markdown formatting supported</span>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
