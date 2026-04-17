import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Moon, Sun, Activity } from "lucide-react";
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
  onShowApiInfo,
}: NavigationControlsProps) => {
  const showLabels = !isCollapsed || isMobile;

  return (
    <div className="border-t border-border/60 p-3 flex flex-col gap-1">
      <Button
        variant="ghost"
        onClick={onToggleTheme}
        className={cn(
          "transition-smooth text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]",
          showLabels ? "w-full justify-start gap-3 px-3" : "w-10 h-10 p-0 justify-center mx-auto"
        )}
        title="Toggle theme"
      >
        {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
        {showLabels && <span className="text-sm">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
      </Button>

      <Button
        variant="ghost"
        onClick={onShowApiInfo}
        className={cn(
          "transition-smooth text-muted-foreground hover:text-foreground hover:bg-foreground/[0.04]",
          showLabels ? "w-full justify-start gap-3 px-3" : "w-10 h-10 p-0 justify-center mx-auto"
        )}
        title="API Status"
      >
        <Activity className="h-[18px] w-[18px]" />
        {showLabels && <span className="text-sm">API Status</span>}
      </Button>

      <div className="pt-1 mt-1 border-t border-border/60">
        <NavbarProfile isCollapsed={isCollapsed && !isMobile} />
      </div>
    </div>
  );
};
