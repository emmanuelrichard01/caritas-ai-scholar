
import { MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavigationHeaderProps {
  isCollapsed: boolean;
  isMobile: boolean;
  onToggleSidebar: () => void;
}

export const NavigationHeader = ({ isCollapsed, isMobile, onToggleSidebar }: NavigationHeaderProps) => {
  return (
    <div className={cn(
      "hidden md:flex h-16 items-center gap-2 border-b px-4 bg-caritas/5 dark:bg-caritas/10 relative",
      isCollapsed ? "justify-center" : "justify-between"
    )}>
      {!isCollapsed && (
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-caritas flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-foreground">CARITAS AI</span>
        </div>
      )}
      {isCollapsed && (
        <div className="h-8 w-8 rounded-lg bg-caritas flex items-center justify-center">
          <MessageSquare className="h-4 w-4 text-white" />
        </div>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 absolute right-[-12px] top-[28px] bg-background dark:bg-slate-900 shadow border z-50"
        onClick={onToggleSidebar}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
