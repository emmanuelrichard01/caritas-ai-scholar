
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";
import { APIInfoDisplay } from "@/components/APIInfoDisplay";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";
import { NavigationMenu } from "@/components/navigation/NavigationMenu";
import { NavigationControls } from "@/components/navigation/NavigationControls";
import { MobileHeader } from "@/components/navigation/MobileHeader";

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
      <MobileHeader 
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={toggleMobileMenu}
      />

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
        <NavigationHeader 
          isCollapsed={isCollapsed}
          isMobile={isMobile}
          onToggleSidebar={toggleSidebar}
        />
        
        <NavigationMenu 
          isCollapsed={isCollapsed}
          isMobile={isMobile}
        />

        <NavigationControls 
          isCollapsed={isCollapsed}
          isMobile={isMobile}
          theme={theme}
          onToggleTheme={toggleTheme}
          onShowApiInfo={() => setShowApiInfo(true)}
        />
      </div>
      
      {showApiInfo && <APIInfoDisplay onClose={() => setShowApiInfo(false)} />}
    </>
  );
};

export default Navigation;
