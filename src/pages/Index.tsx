
import { useState, useEffect } from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { ChatContainer } from '@/components/chat/ChatContainer';
import Navigation from '@/components/Navigation';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { CTASection } from '@/components/landing/CTASection';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const Index = () => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  // Initialize sidebar state based on screen size
  useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);

  const handleGetStarted = () => {
    setShowChat(true);
  };

  if (showChat) {
    return (
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navigation onCollapseChange={setIsCollapsed} />
        
        <div className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          isMobile ? "pt-16" : isCollapsed ? "pl-[70px]" : "pl-[260px]"
        )}>
          <div className="h-full">
            <ChatContainer />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header for Landing */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-caritas flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">CARITAS AI</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-muted-foreground hover:text-caritas transition-colors">
                Features
              </a>
              <a href="/dashboard" className="text-muted-foreground hover:text-caritas transition-colors">
                Dashboard
              </a>
              <a href="/auth" className="text-muted-foreground hover:text-caritas transition-colors">
                Sign In
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Landing Page Content */}
      <main className="pt-16">
        <HeroSection onGetStarted={handleGetStarted} />
        <StatsSection />
        <FeaturesSection />
        <CTASection onGetStarted={handleGetStarted} />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-caritas flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-white text-lg">CARITAS AI</span>
              </div>
              <p className="text-slate-300 max-w-md">
                Empowering students with AI-driven academic assistance for better learning outcomes and academic success.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-slate-300">
                <li><a href="/course-assistant" className="hover:text-white transition-colors">Course Assistant</a></li>
                <li><a href="/gpa-calculator" className="hover:text-white transition-colors">GPA Calculator</a></li>
                <li><a href="/study-planner" className="hover:text-white transition-colors">Study Planner</a></li>
                <li><a href="/research-assistant" className="hover:text-white transition-colors">Research Assistant</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-300">
                <li><a href="/auth" className="hover:text-white transition-colors">Account</a></li>
                <li><a href="/history" className="hover:text-white transition-colors">History</a></li>
                <li><a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 CARITAS AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
