import { Card } from "@/components/ui/card";
import { Sparkles, User, Flame } from "lucide-react";

interface DashboardStats {
  totalInteractions: number;
  studyHours: number;
  completedTasks: number;
  streak: number;
}

interface WelcomeCardProps {
  profile: any;
  userEmail?: string;
  stats: DashboardStats;
  loading?: boolean;
}

export const WelcomeCard = ({ profile, stats, loading = false }: WelcomeCardProps) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getUserLevel = () => {
    if (stats.totalInteractions < 5) return "Beginner Scholar";
    if (stats.totalInteractions < 20) return "Learning Explorer";
    if (stats.totalInteractions < 50) return "Study Master";
    return "Academic Champion";
  };

  const statCards = [
    { label: "Hours Studied", value: stats.studyHours },
    { label: "Tasks Completed", value: stats.completedTasks },
    { label: "AI Interactions", value: stats.totalInteractions },
  ];

  return (
    <Card className="relative overflow-hidden p-6 sm:p-8 bg-card shadow-3d border-border/40 rounded-3xl animate-fade-in-up">
      {/* Subtle floating orb */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-brand/5 blur-3xl" />

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-medium overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-6 w-6 sm:h-7 sm:w-7" />
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-success rounded-full border-2 border-background" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl sm:text-[1.625rem] font-semibold tracking-tight text-foreground leading-tight truncate">
                  {getGreeting()}, {profile?.full_name?.split(" ")[0] || "Scholar"}
                </h2>
                <Sparkles className="h-4 w-4 text-foreground/40 flex-shrink-0" />
              </div>
              <p className="text-sm text-muted-foreground">
                {getUserLevel()} · Ready to continue learning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-foreground/[0.04] border border-border/60">
            <Flame className="h-4 w-4 text-warning" />
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-semibold tabular-nums text-foreground">{stats.streak}</span>
              <span className="text-xs text-muted-foreground">day streak</span>
            </div>
          </div>
        </div>

        {/* Refined stat row */}
        <div className="grid grid-cols-3 gap-px bg-border/60 rounded-xl overflow-hidden border border-border/60">
          {statCards.map((s) => (
            <div key={s.label} className="bg-card p-4 text-center">
              <div
                className={`text-xl sm:text-2xl font-semibold tabular-nums tracking-tight text-foreground ${
                  loading ? "animate-pulse" : ""
                }`}
              >
                {loading ? "—" : s.value}
              </div>
              <div className="text-[11px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wider">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
