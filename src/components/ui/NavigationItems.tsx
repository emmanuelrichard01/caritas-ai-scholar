
import { cn } from "@/lib/utils";
import { useLocation, NavLink } from "react-router-dom";
import { 
  MessageSquare, 
  BookOpen, 
  Calculator, 
  Calendar,
  Book,
  LayoutDashboard,
  Settings
} from "lucide-react";

interface NavigationItemsProps {
  isCollapsed: boolean;
}

interface NavItem {
  title: string;
  href: string;
  icon: JSX.Element;
}

export function NavigationItems({ isCollapsed }: NavigationItemsProps) {
  const location = useLocation();
  
  const navItems: NavItem[] = [
    {
      title: "Chat",
      href: "/",
      icon: <MessageSquare className="h-4 w-4" />
    },
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />
    },
    {
      title: "Course Tutor",
      href: "/course-tutor",
      icon: <BookOpen className="h-4 w-4" />
    },
    {
      title: "Research Assistant",
      href: "/research",
      icon: <Book className="h-4 w-4" />
    },
    {
      title: "GP Calculator",
      href: "/gp-calculator",
      icon: <Calculator className="h-4 w-4" />
    },
    {
      title: "Study Planner",
      href: "/study-planner",
      icon: <Calendar className="h-4 w-4" />
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-4 w-4" />
    }
  ];
  
  return (
    <div className="space-y-1 py-2">
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
              isCollapsed ? "justify-center" : "justify-start",
              isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            )
          }
        >
          {item.icon}
          {!isCollapsed && <span>{item.title}</span>}
        </NavLink>
      ))}
    </div>
  );
}
