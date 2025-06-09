
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Moon, Sun, AlertTriangle } from "lucide-react";
import { NavbarProfile } from "@/components/ui/NavbarProfile";

interface NavigationControlsProps {
  isCollapsed: boolean;
  isMobile: boolean;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onShowApiInfo: () => void;
}

export const NavigationControls = ({ 
  isCollapsed, 
  isMobile, 
  theme, 
  onToggleTheme, 
  onShowApiInfo 
}: NavigationControlsProps) => {
  return (
    <div className="border-t p-4 bg-background/50 dark:bg-slate-900/50 flex flex-col gap-2">
      <Button
        variant="ghost"
        size={isCollapsed && !isMobile ? "icon" : "default"}
        onClick={onToggleTheme}
        className={cn(
          "transition-colors",
          isCollapsed && !isMobile ? "w-10 h-10 p-0 justify-center" : "w-full justify-start gap-2"
        )}
        title="Toggle theme"
      >
        {theme === "dark" ? (
          <>
            <Sun className="h-4 w-4" />
            {(!isCollapsed || isMobile) && <span>Light Mode</span>}
          </>
        ) : (
          <>
            <Moon className="h-4 w-4" />
            {(!isCollapsed || isMobile) && <span>Dark Mode</span>}
          </>
        )}
      </Button>
      
      <Button
        variant="ghost"
        size={isCollapsed && !isMobile ? "icon" : "default"}
        onClick={onShowApiInfo}
        className={cn(
          "transition-colors",
          isCollapsed && !isMobile ? "w-10 h-10 p-0 justify-center" : "w-full justify-start gap-2"
        )}
        title="API Status"
      >
        <AlertTriangle className="h-4 w-4" />
        {(!isCollapsed || isMobile) && <span>API Status</span>}
      </Button>

      <NavbarProfile isCollapsed={isCollapsed && !isMobile} />
    </div>
  );
};
