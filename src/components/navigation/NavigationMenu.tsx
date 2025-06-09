
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { navigationItems } from "@/components/ui/NavigationItems";

interface NavigationMenuProps {
  isCollapsed: boolean;
  isMobile: boolean;
}

export const NavigationMenu = ({ isCollapsed, isMobile }: NavigationMenuProps) => {
  const location = useLocation();

  return (
    <div className="flex-1 overflow-y-auto pt-4 md:pt-0">
      <div className="px-3 py-2">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Button
              key={item.href}
              variant={location.pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 text-left font-normal h-auto min-h-[44px]",
                isCollapsed && !isMobile ? "px-2 justify-center" : "px-3"
              )}
              onClick={() => window.location.href = item.href}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {(!isCollapsed || isMobile) && (
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span className="text-sm font-medium truncate">{item.label}</span>
                  {item.description && !isCollapsed && (
                    <span className="text-xs text-muted-foreground truncate leading-tight">
                      {item.description}
                    </span>
                  )}
                </div>
              )}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
