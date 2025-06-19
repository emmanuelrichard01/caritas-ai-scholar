
import { Button } from "@/components/ui/button";
import { MessageSquare, Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  onStartChat: () => void;
  onSelectSuggestion: (suggestion: string) => void;
}

const WelcomeScreen = ({ onStartChat, onSelectSuggestion }: WelcomeScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto animate-fade-in">
      <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 flex items-center justify-center text-white mb-8 shadow-2xl shadow-blue-500/25">
        <MessageSquare className="h-10 w-10" />
        <Sparkles className="h-4 w-4 absolute -top-2 -right-2 text-yellow-400 animate-pulse" />
      </div>
      
      <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Welcome to CARITAS AI
      </h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl text-lg leading-relaxed">
        Your intelligent academic assistant for personalized learning support, research guidance, and study optimization. 
        Ask me anything about your studies!
      </p>
      
      <Button 
        onClick={onStartChat} 
        size="lg"
        className="mb-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 px-8 py-3 text-lg font-semibold rounded-xl"
      >
        <MessageSquare className="mr-2 h-5 w-5" />
        Start Conversation
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Academic Support</h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">Get help with coursework, assignments, and study strategies</p>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 border border-purple-200 dark:border-purple-800">
          <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Research Assistance</h3>
          <p className="text-sm text-purple-700 dark:text-purple-300">Find resources and guidance for your research projects</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
