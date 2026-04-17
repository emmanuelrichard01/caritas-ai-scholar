import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavigationHeaderProps {
  isCollapsed: boolean;
  isMobile: boolean;
  onToggleSidebar: () => void;
}

export const NavigationHeader = ({ isCollapsed, onToggleSidebar }: NavigationHeaderProps) => {
  return (
    <div
      className={cn(
        "hidden md:flex h-16 items-center gap-2 border-b border-border/60 px-4 relative",
        isCollapsed ? "justify-center" : "justify-between"
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="h-8 w-8 rounded-xl bg-foreground text-background flex items-center justify-center shadow-subtle flex-shrink-0">
          <Sparkles className="h-4 w-4" />
        </div>
        {!isCollapsed && (
          <span className="font-semibold text-foreground tracking-tight truncate">CARITAS AI</span>
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="h-7 w-7 rounded-full absolute right-[-14px] top-[28px] bg-background shadow-soft border-border/60 z-50 hover:bg-muted"
        onClick={onToggleSidebar}
        title={isCollapsed ? "Expand" : "Collapse"}
      >
        {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
};
