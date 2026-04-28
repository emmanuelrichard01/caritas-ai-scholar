import { Card } from "@/components/ui/card";
import { BookOpen, BarChart2, CalendarIcon, MessageSquare, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecentActivity {
  id: string;
  title: string;
  created_at: string;
  category: string;
}

interface RecentActivityProps {
  recentActivities: RecentActivity[];
  loading: boolean;
  onRefresh?: () => void;
}

const formatCategory = (category: string): string => {
  switch (category) {
    case "course-tutor": return "Course Tutor";
    case "research": return "Research";
    case "study-planner": return "Study Planner";
    case "google-ai": return "AI Chat";
    default: return "Chat";
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "course-tutor": return BookOpen;
    case "research": return BarChart2;
    case "study-planner": return CalendarIcon;
    default: return MessageSquare;
  }
};

const formatRelative = (dateString: string) => {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
};

export const RecentActivityList = ({ recentActivities, loading, onRefresh }: RecentActivityProps) => {
  return (
    <Card className="p-6 sm:p-7 bg-card shadow-3d border-border/40 rounded-3xl animate-fade-in-up">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold tracking-tight text-foreground">Recent Activity</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Your latest interactions</p>
        </div>
        {onRefresh && (
          <Button variant="ghost" size="iconSm" onClick={onRefresh} disabled={loading} title="Refresh">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
      ) : recentActivities.length > 0 ? (
        <ul className="divide-y divide-border/60">
          {recentActivities.map((activity, idx) => {
            const Icon = getCategoryIcon(activity.category);
            return (
              <li
                key={activity.id}
                style={{ animationDelay: `${idx * 30}ms` }}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 group animate-fade-in opacity-0"
              >
                <div className="h-9 w-9 rounded-lg bg-foreground/[0.04] flex items-center justify-center text-foreground/70 flex-shrink-0 transition-smooth group-hover:bg-foreground group-hover:text-background">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                    <span>{formatCategory(activity.category)}</span>
                    <span className="text-muted-foreground/50">·</span>
                    <span>{formatRelative(activity.created_at)}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-center py-12">
          <div className="h-12 w-12 mx-auto rounded-full bg-muted/60 flex items-center justify-center mb-3">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No recent activity</p>
          <p className="text-xs text-muted-foreground mt-1">Interactions will appear here</p>
        </div>
      )}
    </Card>
  );
};
