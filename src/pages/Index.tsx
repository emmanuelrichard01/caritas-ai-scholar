
import { MessageSquare, Sparkles } from 'lucide-react';
import { ChatContainer } from '@/components/chat/ChatContainer';
import Navigation from '@/components/Navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const Index = () => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Initialize sidebar state based on screen size
  useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);
  
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navigation onCollapseChange={setIsCollapsed} />
      
      <div className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        isMobile ? "pt-16" : isCollapsed ? "pl-[70px]" : "pl-[260px]"
      )}>
        <div className="h-full">
          <ChatContainer />
        </div>
      </div>
    </div>
  );
};

export default Index;
