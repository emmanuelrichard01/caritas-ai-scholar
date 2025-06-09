
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
    <div className="flex flex-col items-center justify-center p-6 md:p-8 text-center max-w-4xl mx-auto mt-8 animate-fade-in">
      <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-caritas to-caritas-light flex items-center justify-center text-white mb-6 shadow-lg shadow-caritas/20">
        <MessageSquare className="h-10 w-10" />
        <Sparkles className="h-4 w-4 absolute -top-1 -right-1 text-blue-400 animate-pulse" />
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-caritas to-caritas-light bg-clip-text text-transparent">
        Welcome to CARITAS AI
      </h1>
      <p className="text-muted-foreground mb-8 max-w-2xl text-base md:text-lg leading-relaxed">
        Your intelligent academic assistant for personalized learning support, research guidance, and study optimization.
      </p>
      
      <Button 
        onClick={onStartChat} 
        size="lg"
        className="mb-12 bg-caritas hover:bg-caritas-light transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg px-8 py-3"
      >
        Start Conversation
      </Button>

      <div className="w-full max-w-3xl">
        <p className="text-sm font-medium mb-6 text-muted-foreground">
          Try asking about:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              className="flex items-center justify-start gap-4 h-auto p-6 text-left hover:bg-caritas/5 dark:hover:bg-caritas/10 transition-all duration-200 group border-2 hover:border-caritas/30 rounded-xl"
              onClick={() => onSelectSuggestion(suggestion.query)}
            >
              <div className="text-caritas group-hover:text-caritas-light transition-colors p-2 bg-caritas/10 rounded-lg">
                {suggestion.icon}
              </div>
              <div className="flex flex-col items-start">
                <span className="font-medium text-foreground">{suggestion.text}</span>
                <span className="text-xs text-muted-foreground mt-1 line-clamp-1">
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
