
import { useState } from "react";
import { Copy, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface AIResponseDisplayProps {
  content: string;
  isProcessing?: boolean;
}

export const AIResponseDisplay = ({ content, isProcessing = false }: AIResponseDisplayProps) => {
  const [feedbackGiven, setFeedbackGiven] = useState<'liked' | 'disliked' | null>(null);
  
  if (isProcessing) {
    return (
      <div className="mt-6 text-center py-8">
        <div className="inline-flex gap-1">
          <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></div>
          <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse [animation-delay:0.2s]"></div>
          <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse [animation-delay:0.4s]"></div>
        </div>
        <p className="text-sm text-muted-foreground mt-2 dark:text-slate-400">Analyzing course materials...</p>
      </div>
    );
  }
  
  if (!content) return null;
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
  };
  
  const handleFeedback = (type: 'liked' | 'disliked') => {
    setFeedbackGiven(type);
    toast.success(`Thank you for your feedback!`);
    // In a production app, we would send this feedback to the server
  };
  
  return (
    <div className="mt-6 bg-slate-50 p-4 rounded-lg dark:bg-slate-800 border dark:border-slate-700">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium dark:text-white">Results:</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCopyToClipboard}
          className="h-8 text-xs"
        >
          <Copy className="h-3 w-3 mr-1" />
          Copy
        </Button>
      </div>
      
      <div className="prose prose-slate max-w-none dark:prose-invert">
        {content.split('\n').map((paragraph, index) => {
          // Handle bullet points and other formatting
          if (paragraph.startsWith('•') || paragraph.startsWith('-')) {
            return (
              <p key={index} className="ml-4 mb-2">
                {paragraph}
              </p>
            );
          } else if (paragraph.startsWith('##')) {
            return (
              <h3 key={index} className="text-lg font-medium mt-4 mb-2">
                {paragraph.replace('##', '').trim()}
              </h3>
            );
          } else if (paragraph.startsWith('#')) {
            return (
              <h2 key={index} className="text-xl font-medium mt-4 mb-2">
                {paragraph.replace('#', '').trim()}
              </h2>
            );
          } else if (paragraph.trim() === '') {
            return <div key={index} className="h-2"></div>;
          } else {
            return <p key={index} className="mb-2">{paragraph}</p>;
          }
        })}
      </div>
      
      <div className="mt-4 pt-3 border-t dark:border-slate-700 flex justify-between items-center">
        <div className="text-xs text-muted-foreground dark:text-slate-400">
          Was this response helpful?
        </div>
        <div className="flex gap-2">
          <Button
            variant={feedbackGiven === 'liked' ? "default" : "ghost"}
            size="sm"
            onClick={() => handleFeedback('liked')}
            disabled={feedbackGiven !== null}
            className={`h-8 text-xs ${feedbackGiven === 'liked' ? 'bg-green-600 hover:bg-green-700' : ''}`}
          >
            <ThumbsUp className="h-3 w-3 mr-1" />
            Yes
          </Button>
          <Button
            variant={feedbackGiven === 'disliked' ? "default" : "ghost"}
            size="sm"
            onClick={() => handleFeedback('disliked')}
            disabled={feedbackGiven !== null}
            className="h-8 text-xs"
          >
            <ThumbsDown className="h-3 w-3 mr-1" />
            No
          </Button>
        </div>
      </div>
    </div>
  );
};
