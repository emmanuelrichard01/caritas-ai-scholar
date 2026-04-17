import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { navigationItems } from "@/components/ui/NavigationItems";

interface NavigationMenuProps {
  isCollapsed: boolean;
  isMobile: boolean;
}

export const NavigationMenu = ({ isCollapsed, isMobile }: NavigationMenuProps) => {
  const location = useLocation();
  const showLabels = !isCollapsed || isMobile;

  return (
    <nav className="flex-1 overflow-y-auto pt-4 md:pt-3 px-3">
      <ul className="space-y-0.5">
        {navigationItems.map((item) => {
          const active = location.pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                to={item.href}
                title={!showLabels ? item.label : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl text-sm transition-smooth focus-ring",
                  showLabels ? "px-3 py-2.5" : "p-2.5 justify-center",
                  active
                    ? "bg-foreground/[0.06] text-foreground font-medium"
                    : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-foreground" />
                )}
                <item.icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-smooth",
                    active ? "text-foreground" : "text-foreground/60 group-hover:text-foreground"
                  )}
                />
                {showLabels && (
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="truncate leading-tight">{item.label}</span>
                    {item.description && !isCollapsed && (
                      <span className="text-[11px] text-muted-foreground/70 truncate leading-tight mt-0.5">
                        {item.description}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
