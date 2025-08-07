
import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { EnhancedChatContainer } from "@/components/chat/EnhancedChatContainer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { AuthModal } from "@/components/auth/AuthModal";
import { cn } from "@/lib/utils";

const Chat = () => {
  const isMobile = useIsMobile();
  const { isAuthenticated, showAuthModal, closeAuthModal } = useAuthGuard();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Initialize sidebar state based on screen size
  useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to CARITAS AI</h2>
          <p className="text-muted-foreground mb-6">Please sign in to start chatting</p>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={closeAuthModal} />
      </div>
    );
  }

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
      <AuthModal isOpen={showAuthModal} onClose={closeAuthModal} />
    </div>
  );
};

export default Chat;
