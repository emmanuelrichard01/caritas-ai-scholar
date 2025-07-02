
import { Bot, User, Copy, ThumbsUp, ThumbsDown, Clock, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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

  const formatTime = (timestamp?: Date) => {
    if (!timestamp) return '';
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn(
      "group flex gap-4 sm:gap-6 animate-fade-in",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-lg",
        isUser 
          ? "bg-gradient-to-br from-slate-600 to-slate-700" 
          : "bg-gradient-to-br from-blue-500 to-purple-600"
      )}>
        {isUser ? (
          <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        ) : (
          <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 min-w-0 max-w-[85%] sm:max-w-[80%]",
        isUser ? "flex flex-col items-end" : "flex flex-col items-start"
      )}>
        {/* Header */}
        <div className={cn(
          "flex items-center gap-2 mb-2",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          <span className="font-semibold text-sm text-slate-900 dark:text-white">
            {isUser ? "You" : "CARITAS AI"}
          </span>
          {message.timestamp && (
            <>
              <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(message.timestamp)}
              </span>
            </>
          )}
          {!isUser && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </div>

        {/* Message Bubble */}
        <Card className={cn(
          "p-4 sm:p-6 shadow-lg border-0 transition-all duration-300 hover:shadow-xl",
          isUser 
            ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white" 
            : message.role === 'error'
            ? "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 border border-red-200 dark:border-red-800"
            : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
        )}>
          <div className="space-y-3">
            {isUser ? (
              <p className="text-white leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            ) : (
              <FormattedContent 
                content={message.content} 
                variant="chat"
                className={cn(
                  "max-w-none",
                  message.role === 'error' && "text-red-800 dark:text-red-200"
                )}
              />
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        {!isUser && (
          <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-3 text-xs hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
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
            
            <Separator orientation="vertical" className="h-4" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFeedback('positive')}
              className={cn(
                "h-8 px-3 text-xs hover:bg-slate-100 dark:hover:bg-slate-700",
                feedback === 'positive' 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
                  : "text-slate-600 dark:text-slate-400"
              )}
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              Helpful
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFeedback('negative')}
              className={cn(
                "h-8 px-3 text-xs hover:bg-slate-100 dark:hover:bg-slate-700",
                feedback === 'negative' 
                  ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" 
                  : "text-slate-600 dark:text-slate-400"
              )}
            >
              <ThumbsDown className="h-3 w-3 mr-1" />
              Not helpful
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
