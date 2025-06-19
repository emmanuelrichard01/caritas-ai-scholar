
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, User, Crown, Star } from "lucide-react";

interface WelcomeCardProps {
  profile: any;
  userEmail?: string;
}

export const WelcomeCard = ({ profile, userEmail }: WelcomeCardProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getUserLevel = () => {
    // Simple level calculation based on activity (can be enhanced)
    return "Beginner Scholar";
  };

  return (
    <Card className="relative overflow-hidden p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 border-2 border-blue-200 dark:border-blue-800">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-400/20 to-yellow-400/20 rounded-full blur-2xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full rounded-2xl object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-white" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold dark:text-white">
                  {getGreeting()}, {profile?.full_name || "Scholar"}!
                </h2>
                <Sparkles className="h-6 w-6 text-yellow-500 animate-pulse" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                Ready to continue your learning journey?
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                  <Crown className="h-3 w-3 mr-1" />
                  {getUserLevel()}
                </Badge>
                <Badge variant="outline" className="border-yellow-400 text-yellow-700 dark:text-yellow-400">
                  <Star className="h-3 w-3 mr-1" />
                  Level 1
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Study Streak</div>
            <div className="text-3xl font-bold text-orange-500">🔥 0</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">days</div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">0</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Hours Studied</div>
          </div>
          <div className="text-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">0</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">Tasks Completed</div>
          </div>
          <div className="text-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-sm">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">0</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">AI Interactions</div>
          </div>
        </div>
      </div>
    </Card>
  );
};
