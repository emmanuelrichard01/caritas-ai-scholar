
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Calendar, MessageSquare } from "lucide-react";

interface WelcomeScreenProps {
  onStartChat: () => void;
  onSelectSuggestion: (suggestion: string) => void;
}

const WelcomeScreen = ({ onStartChat, onSelectSuggestion }: WelcomeScreenProps) => {
  const suggestions = [
    {
      icon: <BookOpen className="h-4 w-4" />,
      text: "Available courses",
      query: "What are the available courses at Caritas University?"
    },
    {
      icon: <Search className="h-4 w-4" />,
      text: "Study techniques",
      query: "How can I improve my study habits?"
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      text: "Academic calendar",
      query: "What's the current academic calendar?"
    },
    {
      icon: <MessageSquare className="h-4 w-4" />,
      text: "Assignment help",
      query: "Help me break down this research assignment"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 text-center max-w-2xl mx-auto mt-4 md:mt-12 animate-fade-in">
      <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-gradient-to-br from-caritas to-caritas-light flex items-center justify-center text-white mb-6 shadow-lg shadow-caritas/20">
        <MessageSquare className="h-8 w-8 md:h-10 md:w-10" />
      </div>
      
      <h1 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-caritas to-caritas-light bg-clip-text text-transparent">
        Welcome to CARITAS AI
      </h1>
      <p className="text-muted-foreground mb-8 max-w-lg text-sm md:text-base dark:text-slate-400">
        Your intelligent academic assistant for personalized learning support.
      </p>
      
      <Button 
        onClick={onStartChat} 
        size="lg"
        className="mb-10 bg-caritas hover:bg-caritas-light transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        Start Conversation
      </Button>

      <div className="w-full">
        <p className="text-sm font-medium mb-4 text-muted-foreground dark:text-slate-400">
          Try asking about:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              className="flex items-center justify-start gap-3 h-auto p-4 text-left hover:bg-caritas/5 dark:hover:bg-caritas/10 transition-all duration-200 group dark:border-slate-700 hover:border-caritas/30"
              onClick={() => onSelectSuggestion(suggestion.query)}
            >
              <div className="text-caritas group-hover:text-caritas-light transition-colors">
                {suggestion.icon}
              </div>
              <span className="text-sm dark:text-slate-200">{suggestion.text}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
