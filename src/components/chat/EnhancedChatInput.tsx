
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, Paperclip } from 'lucide-react';
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
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
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
        "relative flex items-end gap-3 p-4 rounded-2xl border-2 bg-white dark:bg-slate-800 shadow-lg transition-all duration-300",
        isFocused 
          ? "border-blue-500 shadow-blue-200/50 dark:shadow-blue-900/50 shadow-2xl" 
          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
      )}>
        {/* Attachment Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-shrink-0 w-10 h-10 rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
          disabled={disabled}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        {/* Text Input */}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about your studies, research, or academic needs..."
          className="flex-1 min-h-[48px] max-h-[150px] resize-none bg-transparent border-0 p-0 focus-visible:ring-0 focus:outline-none placeholder:text-slate-500 dark:placeholder:text-slate-400 text-slate-900 dark:text-white"
          disabled={disabled}
          rows={1}
        />

        {/* Voice Input Button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="flex-shrink-0 w-10 h-10 rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
          disabled={disabled}
        >
          <Mic className="h-5 w-5" />
        </Button>

        {/* Send Button */}
        <Button
          type="submit"
          disabled={disabled || !message.trim()}
          className={cn(
            "flex-shrink-0 w-12 h-12 rounded-full transition-all duration-300 shadow-lg",
            message.trim() && !disabled
              ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-blue-500/25 hover:shadow-blue-500/50 hover:scale-105"
              : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500"
          )}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>

      {/* Helper Text */}
      <div className="flex justify-between items-center mt-3 px-2">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Press Shift+Enter for new line
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Powered by AI • Always learning
        </span>
      </div>
    </form>
  );
};
