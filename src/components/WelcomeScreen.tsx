
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, Library, Search, BookMarked } from "lucide-react";

interface WelcomeScreenProps {
  onStartChat: () => void;
  onSelectSuggestion: (suggestion: string) => void;
}

const WelcomeScreen = ({ onStartChat, onSelectSuggestion }: WelcomeScreenProps) => {
  const suggestions = [
    {
      icon: <BookOpen className="h-5 w-5" />,
      text: "Available courses",
      query: "What are the available courses at Caritas University?"
    },
    {
      icon: <Search className="h-5 w-5" />,
      text: "Study habits guide",
      query: "How can I improve my study habits?"
    },
    {
      icon: <Library className="h-5 w-5" />,
      text: "Library resources",
      query: "Tell me about the library resources"
    },
    {
      icon: <BookMarked className="h-5 w-5" />,
      text: "Academic calendar",
      query: "What's the current academic calendar?"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto mt-8 animate-fade-in">
      <div className="h-20 w-20 rounded-full bg-caritas flex items-center justify-center text-white mb-6 shadow-lg shadow-caritas/20">
        <GraduationCap className="h-10 w-10" />
      </div>
      
      <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-caritas to-caritas-light bg-clip-text text-transparent">
        Welcome to CARITAS AI
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Your intelligent academic assistant. Get personalized help with courses, study techniques, and university resources.
      </p>
      
      <Button 
        onClick={onStartChat} 
        size="lg"
        className="mb-12 bg-caritas hover:bg-caritas-light transition-colors"
      >
        Start learning
      </Button>

      <div className="w-full">
        <h2 className="text-lg font-medium mb-4">Popular questions:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              className="flex items-center justify-start gap-2 h-auto p-4 text-left hover:bg-caritas/5 transition-colors group"
              onClick={() => onSelectSuggestion(suggestion.query)}
            >
              <div className="text-caritas group-hover:text-caritas-light transition-colors">
                {suggestion.icon}
              </div>
              <span>{suggestion.text}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
