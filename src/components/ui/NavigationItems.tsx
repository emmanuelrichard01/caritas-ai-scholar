
import { cn } from "@/lib/utils";
import { useLocation, NavLink } from "react-router-dom";
import { 
  MessageSquare, 
  BookOpen, 
  GraduationCap, 
  Calendar,
  PlusCircle,
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
      title: "Dashboard",
      href: "/",
      icon: <LayoutDashboard className="h-4 w-4" />
    },
    {
      title: "New Chat",
      href: "/chat/new",
      icon: <PlusCircle className="h-4 w-4" />
    },
    {
      title: "Course Tutor",
      href: "/course-tutor",
      icon: <BookOpen className="h-4 w-4" />
    },
    {
      title: "Study Assistant",
      href: "/study-assistant",
      icon: <GraduationCap className="h-4 w-4" />
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
