
import { MessageSquare, Sparkles, ArrowRight, ChevronRight, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_CONFIG } from '@/config/app';
import { useAuth } from '@/hooks/useAuth';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  const { user } = useAuth();

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Dotted Background */}
      <div className="absolute inset-0 bg-dotted opacity-50 dark:opacity-20" />
      
      {/* Floating 3D Elements (Hidden on small screens) */}
      <div className="hidden lg:block absolute top-1/4 left-[10%] animate-float delay-100">
        <div className="bg-card shadow-3d p-4 rounded-2xl border border-border/50 rotate-[-10deg]">
          <MessageSquare className="h-8 w-8 text-brand" />
        </div>
      </div>
      <div className="hidden lg:block absolute bottom-1/3 left-[15%] animate-float delay-300">
        <div className="bg-card shadow-3d p-3 rounded-xl border border-border/50 rotate-[15deg]">
          <div className="flex gap-2 items-center">
            <div className="h-3 w-3 rounded-full bg-success" />
            <div className="h-2 w-12 bg-muted rounded-full" />
          </div>
        </div>
      </div>
      <div className="hidden lg:block absolute top-1/3 right-[15%] animate-float delay-500">
        <div className="bg-card shadow-3d p-4 rounded-2xl border border-border/50 rotate-[12deg]">
          <Sparkles className="h-8 w-8 text-amber-500" />
        </div>
      </div>
      <div className="hidden lg:block absolute bottom-1/4 right-[10%] animate-float delay-700">
        <div className="bg-card shadow-3d p-4 rounded-2xl border border-border/50 rotate-[-8deg] w-48">
          <div className="space-y-3">
            <div className="h-2 w-full bg-muted rounded-full" />
            <div className="h-2 w-4/5 bg-brand/40 rounded-full" />
            <div className="h-2 w-2/3 bg-muted rounded-full" />
          </div>
        </div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 w-full z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[1.05] text-foreground mb-6 animate-fade-in-up">
            Think, learn, and excel <br className="hidden sm:block" />
            <span className="text-muted-foreground font-medium">all in one place</span>
          </h1>
          
          {/* Subheading */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
            Efficiently manage your studies, chat with AI course assistants, and boost your academic productivity.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up delay-300">
            <Button 
              onClick={onGetStarted}
              variant="brand"
              size="xl"
              className="group shadow-elevated rounded-xl"
            >
              {user ? (
                <>
                  Go to Dashboard
                  <LayoutDashboard className="h-5 w-5 transition-transform group-hover:scale-110 ml-2" />
                </>
              ) : (
                <>
                  Get free demo
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
    </section>
  );
};
