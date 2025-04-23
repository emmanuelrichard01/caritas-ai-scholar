
import { History, MessageSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <div className="fixed left-0 top-0 z-30 flex h-full w-[260px] flex-col border-r bg-background/80 backdrop-blur-lg">
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <div className="h-8 w-8 rounded-lg bg-caritas flex items-center justify-center">
          <MessageSquare className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold">CARITAS AI</span>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2 p-4">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <MessageSquare className="h-4 w-4" />
              New Chat
            </Button>
          </Link>
          <Link to="/history">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <History className="h-4 w-4" />
              History
            </Button>
          </Link>
        </div>
      </div>

      <div className="border-t p-4">
        <Link to="/settings">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Navigation;
