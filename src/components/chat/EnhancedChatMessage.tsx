
import { Bot, User, Copy, ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { FormattedContent } from '@/components/FormattedContent';

interface Message {
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  timestamp?: Date;
}

interface EnhancedChatMessageProps {
  message: Message;
  isUser: boolean;
}

export const EnhancedChatMessage = ({ message, isUser }: EnhancedChatMessageProps) => {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success('Message copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  const handleFeedback = (type: 'positive' | 'negative') => {
    if (feedback === type) {
      setFeedback(null);
      toast.info('Feedback removed');
    } else {
      setFeedback(type);
      toast.success(type === 'positive' ? 'Thanks for the positive feedback!' : 'Thanks for the feedback, we\'ll improve!');
    }
  };

  return (
    <div className={cn(
      "group flex gap-3 animate-fade-in max-w-4xl",
      isUser ? "flex-row-reverse ml-auto" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser 
          ? "bg-slate-600" 
          : "bg-blue-600"
      )}>
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 min-w-0",
        isUser ? "flex flex-col items-end" : "flex flex-col items-start"
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center gap-2 mb-1",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          <span className="font-medium text-sm text-slate-900 dark:text-white">
            {isUser ? "You" : "CARITAS AI"}
          </span>
          {message.timestamp && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Message Bubble */}
        <Card className={cn(
          "p-3 max-w-[85%] border-0",
          isUser 
            ? "bg-blue-600 text-white" 
            : message.role === 'error'
            ? "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
            : "bg-slate-50 dark:bg-slate-800"
        )}>
          {isUser ? (
            <p className="text-white leading-relaxed whitespace-pre-wrap text-sm">
              {message.content}
            </p>
          ) : (
            <FormattedContent 
              content={message.content} 
              variant="chat"
              className={cn(
                "max-w-none text-sm",
                message.role === 'error' && "text-red-800 dark:text-red-200"
              )}
            />
          )}
        </Card>

        {/* Action Buttons */}
        {!isUser && (
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
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
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFeedback('positive')}
              className={cn(
                "h-7 px-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700",
                feedback === 'positive' 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
                  : "text-slate-600 dark:text-slate-400"
              )}
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFeedback('negative')}
              className={cn(
                "h-7 px-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-700",
                feedback === 'negative' 
                  ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" 
                  : "text-slate-600 dark:text-slate-400"
              )}
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
