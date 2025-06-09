
import { MessageSquare, Sparkles } from 'lucide-react';
import { ChatContainer } from '@/components/chat/ChatContainer';
import LandingNavigation from '@/components/LandingNavigation';

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <LandingNavigation />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-caritas to-caritas-light flex items-center justify-center text-white shadow-lg shadow-caritas/20">
                <MessageSquare className="h-8 w-8" />
                <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-blue-500 animate-pulse" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-caritas to-caritas-light bg-clip-text text-transparent">
              CARITAS AI
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-2">
              Your intelligent academic companion
            </p>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              Empowering students with AI-driven learning tools, research assistance, and personalized study guidance
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
              <ChatContainer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
