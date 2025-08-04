
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CTASectionProps {
  onGetStarted: () => void;
}

export const CTASection = ({ onGetStarted }: CTASectionProps) => {
  return (
    <section className="py-24 bg-gradient-to-br from-caritas to-caritas-light relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.1))]" />
      
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
          <Sparkles className="h-4 w-4 text-white" />
          <span className="text-white text-sm font-medium">Start Your Journey Today</span>
        </div>
        
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Ready to Transform Your 
          <br />
          Academic Experience?
        </h2>
        
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
          Join thousands of students who are already using CARITAS AI to achieve their academic goals and unlock their full potential.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="bg-white text-caritas hover:bg-white/90 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            variant="outline"
            size="lg"
            className="border-white/30 text-caritas hover:bg-white/10 hover:text-white px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm"
            onClick={() => window.location.href = '/dashboard'}
          >
            View Dashboard
          </Button>
        </div>
        
        <div className="mt-8 text-white/80 text-sm">
          No credit card required • Start immediately • Free to use
        </div>
      </div>
    </section>
  );
};
