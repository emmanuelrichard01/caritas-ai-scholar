
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const EnhancedChatInput = ({ onSendMessage, disabled = false }: EnhancedChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={cn(
        "relative flex items-end gap-3 p-3 rounded-lg border bg-white dark:bg-slate-800 transition-all duration-200",
        isFocused 
          ? "border-blue-500 ring-2 ring-blue-500/20" 
          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
      )}>
        {/* Text Input */}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about your studies..."
          className="flex-1 min-h-[40px] max-h-[120px] resize-none bg-transparent border-0 p-0 focus-visible:ring-0 focus:outline-none placeholder:text-slate-500 dark:placeholder:text-slate-400 text-slate-900 dark:text-white"
          disabled={disabled}
          rows={1}
        />

        {/* Send Button */}
        <Button
          type="submit"
          disabled={disabled || !message.trim()}
          size="sm"
          className={cn(
            "flex-shrink-0 transition-all duration-200",
            message.trim() && !disabled
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
          )}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Helper Text */}
      <div className="flex justify-between items-center mt-2 px-1">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Press Shift+Enter for new line
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Powered by AI
        </span>
      </div>
    </form>
  );
};
