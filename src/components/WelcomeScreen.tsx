
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Calendar, MessageSquare, Sparkles } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto mt-16 animate-fade-in">
      <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-caritas to-caritas-light flex items-center justify-center text-white mb-6 shadow-lg shadow-caritas/20">
        <MessageSquare className="h-8 w-8" />
        <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-blue-400 animate-pulse" />
      </div>
      
      <h1 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-caritas to-caritas-light bg-clip-text text-transparent">
        Welcome to CARITAS AI
      </h1>
      <p className="text-muted-foreground mb-8 max-w-xl text-sm md:text-base leading-relaxed">
        Your intelligent academic assistant for personalized learning support, research guidance, and study optimization.
      </p>
      
      <Button 
        onClick={onStartChat} 
        size="lg"
        className="mb-12 bg-caritas hover:bg-caritas-light transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 px-6 py-2"
      >
        Start Conversation
      </Button>

      <div className="w-full max-w-2xl">
        <p className="text-sm font-medium mb-4 text-muted-foreground">
          Try asking about:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              className="flex items-start gap-3 h-auto p-4 text-left hover:bg-caritas/5 dark:hover:bg-caritas/10 transition-all duration-200 group border hover:border-caritas/30 rounded-lg"
              onClick={() => onSelectSuggestion(suggestion.query)}
            >
              <div className="text-caritas group-hover:text-caritas-light transition-colors p-1.5 bg-caritas/10 rounded-md flex-shrink-0">
                {suggestion.icon}
              </div>
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="font-medium text-foreground text-sm truncate w-full">{suggestion.text}</span>
                <span className="text-xs text-muted-foreground mt-0.5 line-clamp-2 text-left">
                  {suggestion.query}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
