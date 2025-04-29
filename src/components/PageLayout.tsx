
import { ReactNode } from "react";
import Navigation from "@/components/Navigation";

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  children: ReactNode;
}

export const PageLayout = ({ title, subtitle, icon, children }: PageLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navigation />
      
      <div className="flex-1 pl-[70px] md:pl-[260px] transition-all duration-300">
        <div className="p-4 md:p-6 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center mb-6 md:mb-8 gap-4 md:gap-0">
            <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white md:mr-4">
              {icon}
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold dark:text-white">{title}</h1>
              {subtitle && <p className="text-muted-foreground dark:text-slate-400">{subtitle}</p>}
            </div>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
};
