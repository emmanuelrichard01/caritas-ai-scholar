
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  Moon, 
  Sun, 
  ChevronLeft, 
  ChevronRight,
  AlertTriangle,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { NavbarProfile } from "./ui/NavbarProfile";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";
import { APIInfoDisplay } from "@/components/APIInfoDisplay";
import { NavigationItems } from "./ui/NavigationItems";

const Navigation = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const isMobile = useIsMobile();
  const location = useLocation();
  const [showApiInfo, setShowApiInfo] = useState(false);
  
  // Initialize sidebar state based on screen size
  useEffect(() => {
    setIsCollapsed(isMobile);
    setIsMobileMenuOpen(false);
  }, [isMobile]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-background/80 backdrop-blur-lg border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-caritas flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold">CARITAS AI</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileMenu}
          className="h-8 w-8"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={toggleMobileMenu} />
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed left-0 z-50 flex h-full flex-col border-r bg-background/95 backdrop-blur-lg transition-all duration-300 ease-in-out",
          "dark:bg-slate-900/95 dark:border-slate-800",
          // Desktop styles
          "md:translate-x-0 md:top-0",
          isCollapsed ? "md:w-[70px]" : "md:w-[260px]",
          // Mobile styles  
          isMobileMenuOpen ? "translate-x-0 top-16 w-[280px]" : "-translate-x-full top-16 w-[280px]",
          "md:top-0"
        )}
      >
        {/* Header - Desktop only */}
        <div className={cn(
          "hidden md:flex h-16 items-center gap-2 border-b px-4 bg-caritas/5 dark:bg-caritas/10",
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
          {/* Toggle button - Desktop only */}
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
        
        <div className="flex-1 overflow-y-auto pt-4 md:pt-0">
          <NavigationItems isCollapsed={isCollapsed && !isMobile} />
        </div>

        <div className="border-t p-4 bg-background/50 dark:bg-slate-900/50 flex flex-col gap-2">
          <Button
            variant="ghost"
            size={isCollapsed && !isMobile ? "icon" : "default"}
            onClick={toggleTheme}
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
            onClick={() => setShowApiInfo(true)}
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
      </div>
      
      {showApiInfo && <APIInfoDisplay onClose={() => setShowApiInfo(false)} />}
    </>
  );
};

export default Navigation;
