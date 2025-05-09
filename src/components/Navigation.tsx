
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  Moon, 
  Sun, 
  ChevronLeft, 
  ChevronRight,
  Home,
  History,
  Book,
  Calendar,
  Search,
  Calculator,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { NavbarProfile } from "./ui/NavbarProfile";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link, useLocation } from "react-router-dom";
import { APIInfoDisplay } from "@/components/APIInfoDisplay";

const Navigation = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const isMobile = useIsMobile();
  const location = useLocation();
  const [showApiInfo, setShowApiInfo] = useState(false);
  
  // Initialize sidebar state based on screen size
  useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);

  useEffect(() => {
    // Check if user has a theme preference saved
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (prefersDark) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const navItems = [
    { path: "/", icon: Home, label: "New Chat", title: "New Chat" },
    { path: "/dashboard", icon: Home, label: "Dashboard", title: "User Dashboard" },
    { path: "/history", icon: History, label: "History", title: "History" },
    { path: "/course-tutor", icon: Book, label: "Course Tutor", title: "Course Concept Tutor" },
    { path: "/study-planner", icon: Calendar, label: "Study Planner", title: "Study Planner" },
    { path: "/research", icon: Search, label: "Research", title: "Research Assistant" },
    { path: "/gpa-calculator", icon: Calculator, label: "GPA Calculator", title: "GPA Calculator" }
  ];
  
  return (
    <>
      <div 
        className={cn(
          "fixed left-0 top-0 z-30 flex h-full flex-col border-r bg-background/80 backdrop-blur-lg transition-all duration-300 ease-in-out md:translate-x-0",
          isCollapsed ? "w-[70px]" : "w-[260px]",
          "dark:bg-slate-900/90 dark:border-slate-800"
        )}
      >
        <div className={cn(
          "flex h-16 items-center gap-2 border-b px-4 bg-caritas/5 dark:bg-caritas/10",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-caritas flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">CARITAS AI</span>
            </div>
          )}
          {isCollapsed && (
            <div className="h-8 w-8 rounded-lg bg-caritas flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
          )}
          {/* Only show toggle button on desktop */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 absolute right-[-12px] top-[28px] bg-background dark:bg-slate-900 shadow border z-50 hidden md:flex"
            onClick={toggleSidebar}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className={cn("space-y-2", isCollapsed ? "flex flex-col items-center p-2 gap-2" : "p-4")}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link to={item.path} key={item.path}>
                  <Button 
                    variant={isActive ? "secondary" : "ghost"}
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
        </div>

        <div className="border-t p-4 bg-background/50 dark:bg-slate-900/50 flex flex-col gap-2">
          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "default"}
            onClick={toggleTheme}
            className={cn(
              "transition-colors",
              isCollapsed ? "w-10 h-10 p-0 justify-center" : "w-full justify-start gap-2"
            )}
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-4 w-4" />
                {!isCollapsed && <span>Light Mode</span>}
              </>
            ) : (
              <>
                <Moon className="h-4 w-4" />
                {!isCollapsed && <span>Dark Mode</span>}
              </>
            )}
          </Button>
          
          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "default"}
            onClick={() => setShowApiInfo(true)}
            className={cn(
              "transition-colors",
              isCollapsed ? "w-10 h-10 p-0 justify-center" : "w-full justify-start gap-2"
            )}
            title="API Status"
          >
            <AlertTriangle className="h-4 w-4" />
            {!isCollapsed && <span>API Status</span>}
          </Button>

          <NavbarProfile isCollapsed={isCollapsed} />
        </div>
      </div>
      
      {showApiInfo && <APIInfoDisplay onClose={() => setShowApiInfo(false)} />}
    </>
  );
};

export default Navigation;
