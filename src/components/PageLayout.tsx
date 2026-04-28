import { ReactNode, useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
}

export const PageLayout = ({ title, subtitle, icon, children, actions }: PageLayoutProps) => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);

  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-dotted opacity-50 dark:opacity-20 pointer-events-none" />
      <Navigation onCollapseChange={setIsCollapsed} />

      <div
        className={cn(
          "flex-1 transition-smooth",
          isMobile ? "pt-16" : isCollapsed ? "pl-[70px]" : "pl-[260px]"
        )}
      >
        <div className="px-4 sm:px-6 md:px-10 py-6 md:py-10 max-w-[100vw] mx-auto w-full overflow-x-hidden">
          {/* Page header — Apple-like, generous spacing, refined hierarchy */}
          <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10 animate-fade-in-up">
            <div className="flex items-center gap-4 min-w-0">
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl bg-foreground/[0.04] border border-border/60 flex items-center justify-center text-foreground/70 flex-shrink-0 shadow-subtle">
                {icon}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-[2rem] font-semibold tracking-tight text-foreground leading-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm sm:text-[15px] text-muted-foreground mt-1 leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
          </header>

          <div className="space-y-6 sm:space-y-8">{children}</div>
        </div>
      </div>
    </div>
  );
};
