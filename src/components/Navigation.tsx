
import { History, MessageSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const Navigation = () => {
  const location = useLocation();
  
  return (
    <div className="fixed left-0 top-0 z-30 flex h-full w-[260px] flex-col border-r bg-background/80 backdrop-blur-lg transition-all duration-300 ease-in-out md:translate-x-0 -translate-x-full">
      <div className="flex h-16 items-center gap-2 border-b px-4 bg-caritas/5">
        <div className="h-8 w-8 rounded-lg bg-caritas flex items-center justify-center">
          <MessageSquare className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold">CARITAS AI</span>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2 p-4">
          <Link to="/">
            <Button 
              variant={location.pathname === "/" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              New Chat
            </Button>
          </Link>
          <Link to="/history">
            <Button 
              variant={location.pathname === "/history" ? "secondary" : "ghost"}
              className="w-full justify-start gap-2 transition-colors"
            >
              <History className="h-4 w-4" />
              History
            </Button>
          </Link>
        </div>
      </div>

      <div className="border-t p-4 bg-background/50">
        <Link to="/settings">
          <Button 
            variant={location.pathname === "/settings" ? "secondary" : "ghost"}
            className="w-full justify-start gap-2 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Navigation;
