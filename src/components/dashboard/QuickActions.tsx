import { Card } from "@/components/ui/card";
import {
  MessageSquare,
  Calendar,
  Calculator,
  GraduationCap,
  Search,
  Brain,
  ArrowUpRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  loading?: boolean;
}

export const QuickActions = ({ loading = false }: QuickActionsProps) => {
  const navigate = useNavigate();

  const actions = [
    { icon: MessageSquare, label: "AI Chat", description: "Instant help", href: "/chat" },
    { icon: Calendar, label: "Study Planner", description: "Plan ahead", href: "/study-planner" },
    { icon: Calculator, label: "GPA Calculator", description: "Track grades", href: "/gpa-calculator" },
    { icon: GraduationCap, label: "Course Assistant", description: "Upload materials", href: "/course-assistant" },
    { icon: Search, label: "Research", description: "Find sources", href: "/research-assistant" },
    { icon: Brain, label: "Study Tips", description: "Learn smarter", href: "/chat" },
  ];

  return (
    <Card variant="default" className="p-6 sm:p-7 h-full animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-foreground">Quick Actions</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Jump into your tools</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((action, index) => (
          <button
            key={action.label}
            onClick={() => navigate(action.href)}
            disabled={loading}
            style={{ animationDelay: `${index * 40}ms` }}
            className={cn(
              "group relative text-left p-4 rounded-xl border border-border/60 bg-card",
              "transition-smooth hover:border-foreground/20 hover:shadow-soft hover:-translate-y-0.5",
              "active:scale-[0.98] focus-ring disabled:opacity-50 disabled:pointer-events-none",
              "animate-fade-in-up opacity-0"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="h-9 w-9 rounded-lg bg-foreground/[0.04] flex items-center justify-center text-foreground/80 transition-smooth group-hover:bg-foreground group-hover:text-background">
                <action.icon className="h-[18px] w-[18px]" />
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 transition-smooth group-hover:text-foreground group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </div>
            <div className="text-sm font-medium text-foreground leading-tight">{action.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{action.description}</div>
          </button>
        ))}
      </div>
    </Card>
  );
};
