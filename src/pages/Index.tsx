
import { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ModernChatContainer } from '@/components/chat/ModernChatContainer';
import Navigation from '@/components/Navigation';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { StatsSection } from '@/components/landing/StatsSection';
import { CTASection } from '@/components/landing/CTASection';
import { NavbarProfile } from '@/components/ui/NavbarProfile';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const Index = () => {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    setIsCollapsed(isMobile);
  }, [isMobile]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => setShowChat(true);

  if (showChat) {
    return (
      <div className="flex min-h-screen bg-background">
        <Navigation onCollapseChange={setIsCollapsed} />
        <div className={cn(
          "flex-1 transition-all duration-300",
          isMobile ? "pt-16" : isCollapsed ? "pl-[70px]" : "pl-[260px]"
        )}>
          <div className="h-full p-2 sm:p-4">
            <div className="h-[calc(100vh-1rem)] sm:h-[calc(100vh-2rem)] rounded-2xl overflow-hidden shadow-elevated">
              <ModernChatContainer />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass shadow-soft" : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-caritas to-caritas-light flex items-center justify-center shadow-soft">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="font-semibold text-lg text-gradient-brand">CARITAS AI</span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              {user ? (
                <NavbarProfile isCollapsed={false} />
              ) : (
                <Button variant="brand" size="sm" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              )}
            </div>

            <div className="md:hidden">
              {user ? (
                <NavbarProfile isCollapsed={false} />
              ) : (
                <Button variant="brand" size="sm" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>
        <HeroSection onGetStarted={handleGetStarted} />
        <StatsSection />
        <FeaturesSection />
        <CTASection onGetStarted={handleGetStarted} />
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-caritas to-caritas-light flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-lg">CARITAS AI</span>
              </div>
              <p className="text-background/70 max-w-md leading-relaxed mb-6">
                Empowering students with AI-driven academic assistance for better learning outcomes.
              </p>
              <p className="text-sm text-background/50">© 2025 CARITAS AI. All rights reserved.</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-3 text-background/70 text-sm">
                <li><Link to="/course-assistant" className="hover:text-background transition-colors">Course Assistant</Link></li>
                <li><Link to="/gpa-calculator" className="hover:text-background transition-colors">GPA Calculator</Link></li>
                <li><Link to="/study-planner" className="hover:text-background transition-colors">Study Planner</Link></li>
                <li><Link to="/research-assistant" className="hover:text-background transition-colors">Research Assistant</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-3 text-background/70 text-sm">
                <li><Link to="/auth" className="hover:text-background transition-colors">Get Started</Link></li>
                <li><Link to="/dashboard" className="hover:text-background transition-colors">Dashboard</Link></li>
                <li><Link to="/chat" className="hover:text-background transition-colors">AI Chat</Link></li>
                <li><Link to="/history" className="hover:text-background transition-colors">History</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
