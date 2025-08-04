
import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { ModernChatContainer } from '@/components/chat/ModernChatContainer';
import Navigation from '@/components/Navigation';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { CTASection } from '@/components/landing/CTASection';
import { NavbarProfile } from '@/components/ui/NavbarProfile';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const Index = () => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const { user } = useAuth();
  
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
          <div className="h-full p-2 sm:p-4">
            <div className="h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] rounded-xl overflow-hidden shadow-xl">
              <ModernChatContainer />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  CARITAS AI
                </span>
                <div className="text-xs text-slate-500 dark:text-slate-400 -mt-1">Academic Assistant</div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 transition-colors font-medium">
                Features
              </a>
              <a href="/dashboard" className="text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 transition-colors font-medium">
                Dashboard
              </a>
              
              {user ? (
                <NavbarProfile isCollapsed={false} />
              ) : (
                <a href="/auth" className="bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-2 rounded-xl font-medium hover:from-red-600 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Get Started
                </a>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              {user ? (
                <NavbarProfile isCollapsed={false} />
              ) : (
                <a href="/auth" className="bg-gradient-to-r from-red-500 to-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Sign In
                </a>
              )}
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

      {/* Enhanced Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-xl text-white">CARITAS AI</span>
                  <div className="text-xs text-slate-400 -mt-1">Academic Assistant</div>
                </div>
              </div>
              <p className="text-slate-300 max-w-md leading-relaxed mb-6">
                Empowering students with AI-driven academic assistance for better learning outcomes and academic success.
              </p>
              <div className="text-sm text-slate-400">
                © 2025 CARITAS AI. All rights reserved.
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Features</h3>
              <ul className="space-y-3 text-slate-300">
                <li><a href="/course-assistant" className="hover:text-white transition-colors hover:underline">Course Assistant</a></li>
                <li><a href="/gpa-calculator" className="hover:text-white transition-colors hover:underline">GPA Calculator</a></li>
                <li><a href="/study-planner" className="hover:text-white transition-colors hover:underline">Study Planner</a></li>
                <li><a href="/research-assistant" className="hover:text-white transition-colors hover:underline">Research Assistant</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-3 text-slate-300">
                <li><a href="/auth" className="hover:text-white transition-colors hover:underline">Get Started</a></li>
                <li><a href="/dashboard" className="hover:text-white transition-colors hover:underline">Dashboard</a></li>
                <li><a href="/chat" className="hover:text-white transition-colors hover:underline">AI Chat</a></li>
                <li><a href="/history" className="hover:text-white transition-colors hover:underline">History</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
