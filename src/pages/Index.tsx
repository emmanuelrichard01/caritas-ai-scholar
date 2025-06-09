
import { MessageSquare, Sparkles } from 'lucide-react';
import { ChatContainer } from '@/components/chat/ChatContainer';

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-8">
            <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-caritas to-caritas-light flex items-center justify-center text-white shadow-xl shadow-caritas/30">
              <MessageSquare className="h-10 w-10" />
              <Sparkles className="h-4 w-4 absolute -top-1 -right-1 text-blue-500 animate-pulse" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-caritas to-caritas-light bg-clip-text text-transparent">
            CARITAS AI
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            Your intelligent academic companion
          </p>
          <p className="text-base text-muted-foreground/80 max-w-xl mx-auto">
            Start a conversation or explore our academic tools
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-2xl border shadow-xl overflow-hidden">
            <ChatContainer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
