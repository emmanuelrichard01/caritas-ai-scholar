
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
        <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto w-full overflow-x-hidden">
          {/* Page Header - Mobile Optimized */}
          <div className="flex flex-col sm:flex-row sm:items-start mb-4 sm:mb-6 gap-3 sm:gap-4">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-caritas to-caritas-light flex items-center justify-center text-white shadow-lg flex-shrink-0">
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground leading-tight">{title}</h1>
              {subtitle && (
                <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2 leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {/* Page Content */}
          <div className="space-y-4 sm:space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
