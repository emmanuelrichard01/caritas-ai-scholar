
import { useState } from "react";
import { Copy, ThumbsUp, ThumbsDown, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormattedContent } from "@/components/FormattedContent";
import { cn } from "@/lib/utils";

interface AIResponseDisplayProps {
  content: string | null;
  isProcessing?: boolean;
  variant?: 'default' | 'chat' | 'research';
  showFeedback?: boolean;
}

export const AIResponseDisplay = ({ 
  content, 
  isProcessing = false, 
  variant = 'default',
  showFeedback = true 
}: AIResponseDisplayProps) => {
  const [feedbackGiven, setFeedbackGiven] = useState<'liked' | 'disliked' | null>(null);
  const [copied, setCopied] = useState(false);
  
  if (isProcessing) {
    return (
      <div className="py-8">
        <div className="flex items-center justify-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:0.4s]"></div>
          </div>
          <span className="text-sm text-muted-foreground ml-3">
            {variant === 'research' ? 'Finding research insights...' : 'Analyzing and generating response...'}
          </span>
        </div>
      </div>
    );
  }
  
  if (!content) return null;
  
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Response copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };
  
  const handleFeedback = (type: 'liked' | 'disliked') => {
    setFeedbackGiven(type);
    toast.success(type === 'liked' ? "Thank you for the positive feedback!" : "Thank you for your feedback!");
  };
  
  return (
    <div className={cn(
      "bg-card border rounded-lg overflow-hidden transition-all duration-200",
      "shadow-sm hover:shadow-md"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <h3 className="font-medium text-sm text-foreground">
            {variant === 'research' ? 'Research Insights' : 'AI Response'}
          </h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCopyToClipboard}
          className="h-8 text-xs hover:bg-background"
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
      </div>
      
      {/* Content */}
      <div className="p-4">
        <FormattedContent 
          content={content} 
          variant={variant}
          className="max-w-none"
        />
      </div>
      
      {/* Footer with feedback */}
      {showFeedback && (
        <div className="px-4 py-3 border-t bg-muted/20 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Was this response helpful?
          </span>
          <div className="flex space-x-1">
            <Button
              variant={feedbackGiven === 'liked' ? "default" : "ghost"}
              size="sm"
              onClick={() => handleFeedback('liked')}
              disabled={feedbackGiven !== null}
              className={cn(
                "h-7 px-3 text-xs",
                feedbackGiven === 'liked' && "bg-green-600 hover:bg-green-700 text-white"
              )}
            >
              <ThumbsUp className="h-3 w-3 mr-1" />
              Yes
            </Button>
            <Button
              variant={feedbackGiven === 'disliked' ? "destructive" : "ghost"}
              size="sm"
              onClick={() => handleFeedback('disliked')}
              disabled={feedbackGiven !== null}
              className="h-7 px-3 text-xs"
            >
              <ThumbsDown className="h-3 w-3 mr-1" />
              No
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
