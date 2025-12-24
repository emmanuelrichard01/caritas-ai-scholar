
import { MessageSquare, Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 gradient-radial" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      {/* Floating orbs for depth */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-caritas/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-info/5 rounded-full blur-3xl animate-float delay-1000" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 w-full">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-caritas/5 border border-caritas/10 mb-8 animate-fade-in-down">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-caritas animate-pulse-soft" />
              <span className="text-sm font-medium text-foreground/80">
                AI-Powered Academic Excellence
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          {/* Main heading */}
          <h1 className="heading-display mb-6 animate-fade-in-up">
            <span className="text-gradient-brand">CARITAS AI</span>
            <br />
            <span className="text-foreground">
              Your Academic Companion
            </span>
          </h1>
          
          {/* Subheading */}
          <p className="body-large max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
            Unlock your academic potential with personalized AI assistance for 
            studying, research, and learning optimization.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up delay-300">
            <Button 
              onClick={onGetStarted}
              variant="brand"
              size="xl"
              className="group"
            >
              Start Learning Today
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="outline" 
              size="xl"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Features
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-sm text-muted-foreground animate-fade-in-up delay-500">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-success rounded-full animate-pulse-soft" />
              <span>24/7 Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-caritas rounded-full animate-pulse-soft delay-200" />
              <span>Personalized Learning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-info rounded-full animate-pulse-soft delay-400" />
              <span>Academic Focused</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
