
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, Calculator, GraduationCap, Search, Brain, Zap, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Start AI Chat",
      description: "Get instant help",
      href: "/chat",
      color: "bg-blue-500 hover:bg-blue-600",
      gradient: "from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30"
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "Study Planner",
      description: "Plan your studies",
      href: "/study-planner",
      color: "bg-purple-500 hover:bg-purple-600",
      gradient: "from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30"
    },
    {
      icon: <Calculator className="h-5 w-5" />,
      label: "GPA Calculator",
      description: "Track your grades",
      href: "/gpa-calculator",
      color: "bg-green-500 hover:bg-green-600",
      gradient: "from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30"
    },
    {
      icon: <GraduationCap className="h-5 w-5" />,
      label: "Course Assistant",
      description: "Upload materials",
      href: "/course-assistant",
      color: "bg-orange-500 hover:bg-orange-600",
      gradient: "from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30"
    },
    {
      icon: <Search className="h-5 w-5" />,
      label: "Research Helper",
      description: "Find resources",
      href: "/research-assistant",
      color: "bg-pink-500 hover:bg-pink-600",
      gradient: "from-pink-50 to-pink-100 dark:from-pink-950/30 dark:to-pink-900/30"
    },
    {
      icon: <Brain className="h-5 w-5" />,
      label: "Study Tips",
      description: "Improve efficiency",
      href: "/chat",
      color: "bg-indigo-500 hover:bg-indigo-600",
      gradient: "from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/30"
    }
  ];

  return (
    <div className="md:col-span-2">
      <Card className="p-6 dark:bg-slate-900 h-full">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold dark:text-white">Quick Actions</h3>
          <div className="ml-auto">
            <Target className="h-4 w-4 text-slate-400" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`h-auto p-4 flex flex-col items-center gap-3 bg-gradient-to-br ${action.gradient} border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 hover:shadow-lg group`}
              onClick={() => navigate(action.href)}
            >
              <div className={`p-3 rounded-xl text-white ${action.color} transition-transform duration-300 group-hover:scale-110 shadow-lg`}>
                {action.icon}
              </div>
              <div className="text-center">
                <div className="font-semibold text-sm dark:text-white mb-1">{action.label}</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💡</span>
            <span className="font-semibold text-yellow-800 dark:text-yellow-300">Pro Tip</span>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            Start with the AI Chat to get personalized study recommendations, then use the Study Planner to organize your schedule!
          </p>
        </div>
      </Card>
    </div>
  );
};
