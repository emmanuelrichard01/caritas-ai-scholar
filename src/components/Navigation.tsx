
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLocation } from "react-router-dom";
import { APIInfoDisplay } from "@/components/APIInfoDisplay";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";
import { NavigationMenu } from "@/components/navigation/NavigationMenu";
import { NavigationControls } from "@/components/navigation/NavigationControls";
import { MobileHeader } from "@/components/navigation/MobileHeader";

interface NavigationProps {
  onCollapseChange?: (isCollapsed: boolean) => void;
}

const Navigation = ({ onCollapseChange }: NavigationProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const isMobile = useIsMobile();
  const location = useLocation();
  const [showApiInfo, setShowApiInfo] = useState(false);
  
  // Initialize sidebar state based on screen size
  useEffect(() => {
    const collapsed = isMobile;
    setIsCollapsed(collapsed);
    setIsMobileMenuOpen(false);
    onCollapseChange?.(collapsed);
  }, [isMobile, onCollapseChange]);

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
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
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
        <div 
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" 
          onClick={toggleMobileMenu} 
        />
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed left-0 flex flex-col border-r bg-background/95 backdrop-blur-lg transition-all duration-300 ease-in-out",
          "dark:bg-slate-900/95 dark:border-slate-800",
          // Desktop styles
          "md:translate-x-0 md:top-0 md:h-full md:z-50",
          isCollapsed ? "md:w-[70px]" : "md:w-[260px]",
          // Mobile styles  
          isMobileMenuOpen ? "translate-x-0 top-16 w-[280px] h-[93vh] z-50" : "-translate-x-full top-16 w-[280px] h-[93vh] z-50"
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
