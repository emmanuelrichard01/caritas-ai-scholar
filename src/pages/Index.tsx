
import { MessageSquare, Sparkles } from 'lucide-react';
import { ChatContainer } from '@/components/chat/ChatContainer';
import Navigation from '@/components/Navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const Index = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navigation />
      
      <div className={cn(
        "flex-1 transition-all duration-300",
        isMobile ? 'pt-16' : 'pl-[70px] md:pl-[260px]'
      )}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl border shadow-xl overflow-hidden">
              <ChatContainer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
