
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CTASectionProps {
  onGetStarted: () => void;
}

export const CTASection = ({ onGetStarted }: CTASectionProps) => {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-caritas via-caritas to-caritas-dark" />
      
      {/* Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      {/* Glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/20">
          <Sparkles className="h-4 w-4 text-white" />
          <span className="text-white/90 text-sm font-medium">Start Your Journey Today</span>
        </div>
        
        {/* Heading */}
        <h2 className="heading-1 text-white mb-6">
          Ready to Transform Your
          <br />
          Academic Experience?
        </h2>
        
        {/* Description */}
        <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
          Join thousands of students who are already using CARITAS AI to achieve their academic goals and unlock their full potential.
        </p>
        
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={onGetStarted}
            size="xl"
            className="bg-white text-caritas hover:bg-white/90 shadow-elevated hover:shadow-elevated group"
          >
            Get Started Now
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button 
            variant="outline"
            size="xl"
            className="border-white/30 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm"
            onClick={() => window.location.href = '/dashboard'}
          >
            View Dashboard
          </Button>
        </div>
        
        {/* Trust text */}
        <p className="mt-8 text-white/60 text-sm">
          No credit card required • Start immediately • Free to use
        </p>
      </div>
    </section>
  );
};
