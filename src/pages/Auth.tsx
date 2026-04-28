import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { GraduationCap, Loader2, Mail, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { APP_CONFIG } from '@/config/app';

const Auth = () => {
  const { user, profile, signInWithGoogle, signInWithEmail, signUpWithEmail, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const location = useLocation();
  const from = location.state?.from || '/';

  useEffect(() => {
    if (user && !authLoading) {
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !fullName)) return;
    
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, fullName);
        setIsSignUp(false);
        setPassword('');
      } else {
        await signInWithEmail(email, password);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-background">
      
      {/* Left Side - Brand Panel (Hidden on smaller screens) */}
      <div className="hidden lg:flex w-1/2 relative bg-background flex-col justify-between p-12 overflow-hidden border-r border-border/40">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-dotted opacity-50 dark:opacity-20" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,hsl(var(--brand)/0.15),transparent)]" />
        
        {/* Floating 3D Elements */}
        <div className="absolute top-1/3 right-1/4 animate-float delay-100">
          <div className="bg-card shadow-3d p-4 rounded-2xl border border-border/40 rotate-[12deg]">
            <Sparkles className="h-8 w-8 text-brand" />
          </div>
        </div>
        
        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center shadow-sm border border-brand/20">
            <GraduationCap className="h-5 w-5 text-brand" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            {APP_CONFIG.brand.name}
          </span>
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-lg mt-auto mb-auto animate-fade-in-up delay-200">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/5 border border-brand/10 mb-6 text-sm text-foreground/80">
            <Sparkles className="h-4 w-4 text-brand" />
            <span className="font-medium">AI-Powered Learning</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
            Elevate your academic journey.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Join thousands of students using intelligent tools to analyze course materials, organize study plans, and achieve better grades.
          </p>
        </div>

        {/* Bottom Quote */}
        <div className="relative z-10 animate-fade-in-up delay-300">
          <div className="bg-card/50 backdrop-blur-sm border border-border/40 p-6 rounded-2xl shadow-sm">
            <blockquote className="space-y-3">
              <p className="text-sm font-medium leading-relaxed text-foreground">
                "The course material analyzer completely changed how I prepare for exams. It's like having a 24/7 personal tutor."
              </p>
              <footer className="text-sm font-semibold text-muted-foreground">
                — Final Year Engineering Student
              </footer>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative bg-background">
        {/* Mobile Background Elements */}
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_100%_-20%,hsl(var(--brand)/0.05),transparent)] lg:hidden" />
        
        <div className="w-full max-w-[420px] mx-auto relative z-10">
          <div className="bg-card shadow-3d border border-border/40 rounded-[2.5rem] p-8 sm:p-10">
          {user ? (
            <div className="flex flex-col items-center space-y-6 bg-card p-8 rounded-2xl border border-border shadow-soft text-center animate-scale-in">
              <Avatar className="h-24 w-24 ring-4 ring-primary/10">
                <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? user.email} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xl">
                  {profile?.full_name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-foreground">
                  Welcome back, {profile?.full_name?.split(' ')[0] ?? 'Student'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
              <Button className="w-full group" size="lg" onClick={() => navigate(from, { replace: true })}>
                Enter Dashboard
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          ) : (
            <div className="animate-fade-in-up">
              <div className="flex flex-col space-y-2 text-center mb-8">
                <div className="lg:hidden flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <GraduationCap className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  {isSignUp ? 'Create an account' : 'Welcome back'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? 'Enter your details below to create your account' : 'Enter your credentials to access your account'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName" 
                      placeholder="e.g. John Doe" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required 
                      className="bg-muted/50 border-transparent focus:bg-background"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="student@university.edu" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    className="bg-muted/50 border-transparent focus:bg-background"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {!isSignUp && (
                       <a href="#" className="text-sm font-medium text-primary hover:underline">
                         Forgot password?
                       </a>
                    )}
                  </div>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      placeholder="••••••••"
                      className="bg-muted/50 border-transparent focus:bg-background pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-2" 
                  size="lg"
                  disabled={isSubmitting || authLoading}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <><Mail className="h-4 w-4 mr-2" /> {isSignUp ? 'Sign Up' : 'Sign In'}</>
                  )}
                </Button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-4 text-muted-foreground font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full bg-background hover:bg-muted/50"
                onClick={signInWithGoogle}
                disabled={isSubmitting || authLoading}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-8">
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                <button 
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="font-semibold text-brand hover:underline"
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

