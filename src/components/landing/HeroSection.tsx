
import { MessageSquare, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-caritas/5 dark:from-slate-950 dark:via-slate-900 dark:to-caritas/10">
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-2 bg-caritas/10 rounded-full mb-6">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 rounded-full px-4 py-2 shadow-sm">
              <MessageSquare className="h-5 w-5 text-caritas" />
              <span className="text-sm font-medium text-caritas">Powered by Advanced AI</span>
              <Sparkles className="h-4 w-4 text-caritas animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-caritas via-caritas-light to-caritas bg-clip-text text-transparent">
              CARITAS AI
            </span>
            <br />
            <span className="text-foreground/90 text-3xl md:text-5xl lg:text-6xl">
              Your Academic Companion
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Unlock your academic potential with personalized AI assistance for 
            <span className="text-caritas font-medium"> studying</span>, 
            <span className="text-caritas font-medium"> research</span>, and 
            <span className="text-caritas font-medium"> learning optimization</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              onClick={onGetStarted}
              size="lg" 
              className="bg-caritas hover:bg-caritas-light text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Start Learning Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-4 text-lg font-semibold rounded-xl border-2 hover:bg-caritas/5"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Explore Features
            </Button>
          </div>
          
          <div className="flex justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span>24/7 Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-caritas rounded-full animate-pulse" />
              <span>Personalized Learning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
              <span>Academic Focused</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
