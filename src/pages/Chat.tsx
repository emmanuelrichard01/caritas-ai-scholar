
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { EnhancedChatContainer } from "@/components/chat/EnhancedChatContainer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const Chat = () => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Initialize sidebar state based on screen size
  useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Navigation onCollapseChange={setIsCollapsed} />
      
      <div className={cn(
        "flex-1 transition-all duration-300 ease-in-out flex flex-col",
        isMobile ? 'pt-16' : isCollapsed ? 'pl-[70px]' : 'pl-[260px]'
      )}>
        {/* Full-screen chat container with proper spacing */}
        <div className="flex-1 p-3 sm:p-4 md:p-6 overflow-hidden">
          <div className="h-full">
            <EnhancedChatContainer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
