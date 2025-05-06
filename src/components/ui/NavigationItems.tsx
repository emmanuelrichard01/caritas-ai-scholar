
import { 
  MessageSquare, 
  History, 
  Book, 
  Calendar, 
  Search,
  LayoutDashboard 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavigationItemsProps {
  isCollapsed: boolean;
}

export function NavigationItems({ isCollapsed }: NavigationItemsProps) {
  const location = useLocation();
  
  const navItems = [
    { path: "/", icon: MessageSquare, label: "New Chat", title: "New Chat" },
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard", title: "User Dashboard" },
    { path: "/history", icon: History, label: "History", title: "History" },
    { path: "/course-tutor", icon: Book, label: "Course Tutor", title: "Course Concept Tutor" },
    { path: "/study-planner", icon: Calendar, label: "Study Planner", title: "Study Planner" },
    { path: "/research", icon: Search, label: "Research", title: "Research Assistant" }
    // Settings button removed as requested
  ];
  
  return (
    <div className={cn("space-y-2", isCollapsed ? "flex flex-col items-center p-2 gap-2" : "p-4")}>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link to={item.path} key={item.path}>
            <Button 
              variant={location.pathname === item.path ? "secondary" : "ghost"}
              className={cn(
                "transition-colors",
                isCollapsed ? "w-10 h-10 p-0 justify-center" : "w-full justify-start gap-2"
              )}
              title={item.title}
            >
              <Icon className="h-4 w-4" />
              {!isCollapsed && <span>{item.label}</span>}
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
