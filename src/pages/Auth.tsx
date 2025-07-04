
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { GraduationCap } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Auth = () => {
  const { user, profile, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'} p-6 md:p-8 space-y-6 md:space-y-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg transition-all duration-300`}>
        {user ? (
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? user.email} />
              <AvatarFallback>
                {profile?.full_name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h2 className="text-xl font-semibold dark:text-white">
                {profile?.full_name ?? user.email}
              </h2>
              <p className="text-sm text-muted-foreground dark:text-slate-400">
                {user.email}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-caritas flex items-center justify-center text-white shadow-md">
                <GraduationCap className="h-8 w-8" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-center dark:text-white">
                Welcome to CARITAS AI
              </h1>
              <p className="text-sm text-muted-foreground text-center dark:text-slate-300">
                Sign in to access your personalized learning experience
              </p>
            </div>

            <Button
              className="w-full bg-caritas hover:bg-caritas-light transition-colors shadow-md"
              onClick={signInWithGoogle}
              size={isMobile ? "sm" : "default"}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
