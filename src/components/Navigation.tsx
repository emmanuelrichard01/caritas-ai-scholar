
import { History, MessageSquare, Settings, Book, Calendar, FileText, Search, Moon, Sun, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const Navigation = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

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
  
  return (
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
          <>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-caritas flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold">CARITAS AI</span>
            </div>
          </>
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
        <div className={cn("space-y-2 p-4", isCollapsed && "flex flex-col items-center p-2 gap-2")}>
          <Link to="/">
            <Button 
              variant={location.pathname === "/" ? "secondary" : "ghost"}
              className={cn(
                "transition-colors",
                isCollapsed ? "w-10 h-10 p-0 justify-center" : "w-full justify-start gap-2"
              )}
              title="New Chat"
            >
              <MessageSquare className="h-4 w-4" />
              {!isCollapsed && <span>New Chat</span>}
            </Button>
          </Link>

          <Link to="/history">
            <Button 
              variant={location.pathname === "/history" ? "secondary" : "ghost"}
              className={cn(
                "transition-colors",
                isCollapsed ? "w-10 h-10 p-0 justify-center" : "w-full justify-start gap-2"
              )}
              title="History"
            >
              <History className="h-4 w-4" />
              {!isCollapsed && <span>History</span>}
            </Button>
          </Link>

          <Link to="/course-tutor">
            <Button 
              variant={location.pathname === "/course-tutor" ? "secondary" : "ghost"}
              className={cn(
                "transition-colors",
                isCollapsed ? "w-10 h-10 p-0 justify-center" : "w-full justify-start gap-2"
              )}
              title="Course Concept Tutor"
            >
              <Book className="h-4 w-4" />
              {!isCollapsed && <span>Course Tutor</span>}
            </Button>
          </Link>

          <Link to="/study-planner">
            <Button 
              variant={location.pathname === "/study-planner" ? "secondary" : "ghost"}
              className={cn(
                "transition-colors",
                isCollapsed ? "w-10 h-10 p-0 justify-center" : "w-full justify-start gap-2"
              )}
              title="Study Planner"
            >
              <Calendar className="h-4 w-4" />
              {!isCollapsed && <span>Study Planner</span>}
            </Button>
          </Link>

          <Link to="/assignment-helper">
            <Button 
              variant={location.pathname === "/assignment-helper" ? "secondary" : "ghost"}
              className={cn(
                "transition-colors",
                isCollapsed ? "w-10 h-10 p-0 justify-center" : "w-full justify-start gap-2"
              )}
              title="Assignment Helper"
            >
              <FileText className="h-4 w-4" />
              {!isCollapsed && <span>Assignments</span>}
            </Button>
          </Link>

          <Link to="/research">
            <Button 
              variant={location.pathname === "/research" ? "secondary" : "ghost"}
              className={cn(
                "transition-colors",
                isCollapsed ? "w-10 h-10 p-0 justify-center" : "w-full justify-start gap-2"
              )}
              title="Research Assistant"
            >
              <Search className="h-4 w-4" />
              {!isCollapsed && <span>Research</span>}
            </Button>
          </Link>
        </div>
      </div>

      <div className="border-t p-4 bg-background/50 dark:bg-slate-900/50 flex flex-col gap-2">
        <Button
          variant="ghost"
          size={isCollapsed ? "icon" : "default"}
          onClick={toggleTheme}
          className={cn(
            "transition-colors",
            isCollapsed ? "w-10 h-10 p-0 justify-center mx-auto" : "w-full justify-start gap-2"
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

        <Link to="/settings">
          <Button 
            variant={location.pathname === "/settings" ? "secondary" : "ghost"}
            className={cn(
              "transition-colors",
              isCollapsed ? "w-10 h-10 p-0 justify-center mx-auto" : "w-full justify-start gap-2"
            )}
            title="Settings"
          >
            <Settings className="h-4 w-4" />
            {!isCollapsed && <span>Settings</span>}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Navigation;
