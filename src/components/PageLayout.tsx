
import { ReactNode, useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  children: ReactNode;
}

export const PageLayout = ({ title, subtitle, icon, children }: PageLayoutProps) => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Initialize sidebar state based on screen size
  useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);
  
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navigation onCollapseChange={setIsCollapsed} />
      
      <div className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        isMobile ? 'pt-16' : isCollapsed ? 'pl-[70px]' : 'pl-[260px]'
      )}>
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-3 sm:gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-caritas to-caritas-light flex items-center justify-center text-white shadow-lg">
              {icon}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">{title}</h1>
              {subtitle && (
                <p className="text-sm md:text-base text-muted-foreground mt-1 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
