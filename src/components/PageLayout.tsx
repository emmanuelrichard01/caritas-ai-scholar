
import { ReactNode } from "react";
import Navigation from "@/components/Navigation";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  children: ReactNode;
}

export const PageLayout = ({ title, subtitle, icon, children }: PageLayoutProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navigation />
      
      <div className={`flex-1 transition-all duration-300 ${isMobile ? 'pt-16' : 'pl-[70px] md:pl-[260px]'}`}>
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center mb-4 md:mb-6 gap-3 sm:gap-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
              {icon}
            </div>
            <div>
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold dark:text-white">{title}</h1>
              {subtitle && <p className="text-sm md:text-base text-muted-foreground dark:text-slate-400">{subtitle}</p>}
            </div>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
};
