
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Calendar, Search, FileText, Award } from "lucide-react";

interface WelcomeScreenProps {
  onStartChat: () => void;
  onSelectSuggestion: (suggestion: string) => void;
}

const WelcomeScreen = ({ onStartChat, onSelectSuggestion }: WelcomeScreenProps) => {
  const suggestions = [
    {
      icon: <BookOpen className="h-5 w-5" />,
      text: "Tell me about Caritas University",
      query: "What can you tell me about Caritas University?"
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      text: "Academic calendar",
      query: "What's the current academic calendar?"
    },
    {
      icon: <Search className="h-5 w-5" />,
      text: "Study techniques",
      query: "What are some effective study techniques for university students?"
    },
    {
      icon: <FileText className="h-5 w-5" />,
      text: "Thesis writing guide",
      query: "How do I write a good thesis or dissertation?"
    },
    {
      icon: <Award className="h-5 w-5" />,
      text: "Tips for becoming a 5.0 student",
      query: "What does it take to become a 5.0 GPA student?"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto mt-8 animate-fade-in">
      <div className="h-20 w-20 rounded-full bg-caritas flex items-center justify-center text-white mb-6">
        <GraduationCap className="h-10 w-10" />
      </div>
      
      <h1 className="text-3xl font-bold mb-2">Welcome to CARITAS AI</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        Your personal assistant for all things Caritas University. Get help with studying, academic guidance, and university information.
      </p>
      
      <Button 
        onClick={onStartChat} 
        size="lg"
        className="mb-8 bg-caritas hover:bg-caritas-light"
      >
        Start a new conversation
      </Button>

      <div className="w-full">
        <h2 className="text-lg font-medium mb-4">Try asking about:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              className="flex items-center justify-start gap-2 h-auto p-4 text-left"
              onClick={() => onSelectSuggestion(suggestion.query)}
            >
              <div className="text-caritas">{suggestion.icon}</div>
              <span>{suggestion.text}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
