
import { ArrowRight, Sparkles, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { APP_CONFIG } from '@/config/app';
import { useAuth } from '@/hooks/useAuth';

interface CTASectionProps {
  onGetStarted: () => void;
}

export const CTASection = ({ onGetStarted }: CTASectionProps) => {
  const { user } = useAuth();

  return (
    <section className="py-24 sm:py-32 relative bg-background overflow-hidden">
      <div className="absolute inset-0 bg-dotted opacity-50 dark:opacity-20" />
      
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-card border border-border/40 shadow-3d rounded-[2.5rem] p-10 sm:p-20 relative overflow-hidden">
          {/* Decorative floating elements inside the CTA card */}
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-brand/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-info/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2 mb-8 border border-border/50">
              <Sparkles className="h-4 w-4 text-brand" />
              <span className="text-foreground/80 text-sm font-medium">Start Your Journey Today</span>
            </div>
            
            {/* Heading */}
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-6">
              Ready to Transform Your
              <br />
              Academic Experience?
            </h2>
            
            {/* Description */}
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
              Join thousands of students who are already using {APP_CONFIG.brand.name} to achieve their academic goals and unlock their full potential.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={onGetStarted}
                size="xl"
                className="bg-brand text-white hover:bg-brand/90 shadow-elevated rounded-xl"
              >
                {user ? (
                  <>
                    Go to Dashboard
                    <LayoutDashboard className="h-5 w-5 ml-2" />
                  </>
                ) : (
                  <>
                    Get free demo
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
            
            {/* Trust text */}
            <p className="mt-8 text-muted-foreground/60 text-sm">
              No credit card required • Start immediately • Free to use
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
