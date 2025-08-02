import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Lightbulb, Target, Clock, Coffee, Star, TrendingUp, CheckCircle } from "lucide-react";
import { memo } from "react";

interface StudyTip {
  id: string;
  category: "productivity" | "wellness" | "technique" | "motivation";
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "advanced";
  estimatedTime?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const studyTips: StudyTip[] = [
  {
    id: "pomodoro",
    category: "technique",
    title: "Pomodoro Technique",
    description: "Work in 25-minute focused sessions followed by 5-minute breaks to maintain concentration.",
    difficulty: "easy",
    estimatedTime: "25 min",
    icon: Clock
  },
  {
    id: "active-recall",
    category: "technique", 
    title: "Active Recall",
    description: "Test yourself on material without looking at notes to strengthen memory retention.",
    difficulty: "medium",
    icon: Brain
  },
  {
    id: "spaced-repetition",
    category: "technique",
    title: "Spaced Repetition",
    description: "Review material at increasing intervals to move information to long-term memory.",
    difficulty: "medium",
    icon: TrendingUp
  },
  {
    id: "environment",
    category: "productivity",
    title: "Optimize Environment",
    description: "Create a dedicated, clutter-free study space with good lighting and minimal distractions.",
    difficulty: "easy",
    icon: Star
  },
  {
    id: "breaks",
    category: "wellness",
    title: "Strategic Breaks",
    description: "Take regular breaks to prevent mental fatigue and maintain peak performance.",
    difficulty: "easy",
    estimatedTime: "5-15 min",
    icon: Coffee
  },
  {
    id: "goal-setting",
    category: "motivation",
    title: "SMART Goals",
    description: "Set Specific, Measurable, Achievable, Relevant, and Time-bound study objectives.",
    difficulty: "medium",
    icon: Target
  }
];

interface StudyTipsProps {
  analytics?: {
    efficiency: number;
    streak: number;
    completedTasks: number;
  };
}

export const StudyTips = memo(({ analytics }: StudyTipsProps) => {
  const getCategoryIcon = (category: StudyTip["category"]) => {
    switch (category) {
      case "productivity": return <Target className="h-4 w-4" />;
      case "wellness": return <Coffee className="h-4 w-4" />;
      case "technique": return <Brain className="h-4 w-4" />;
      case "motivation": return <Star className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: StudyTip["category"]) => {
    switch (category) {
      case "productivity": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "wellness": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "technique": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
      case "motivation": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
    }
  };

  const getDifficultyColor = (difficulty: StudyTip["difficulty"]) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "medium": return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
      case "advanced": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    }
  };

  // Personalized tips based on performance
  const getPersonalizedTips = () => {
    if (!analytics) return studyTips.slice(0, 4);
    
    const tips = [...studyTips];
    
    // If efficiency is low, prioritize technique tips
    if (analytics.efficiency < 70) {
      return tips.filter(tip => tip.category === "technique").slice(0, 2)
        .concat(tips.filter(tip => tip.category !== "technique").slice(0, 2));
    }
    
    // If streak is low, prioritize motivation tips
    if (analytics.streak < 3) {
      return tips.filter(tip => tip.category === "motivation").slice(0, 2)
        .concat(tips.filter(tip => tip.category !== "motivation").slice(0, 2));
    }
    
    return tips.slice(0, 4);
  };

  const displayTips = getPersonalizedTips();

  return (
    <Card className="p-4 sm:p-6 dark:bg-slate-900 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-2 border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
        <h3 className="text-lg sm:text-xl font-semibold dark:text-white">
          {analytics ? "Personalized Study Tips" : "Study Success Tips"}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {displayTips.map((tip) => {
          const IconComponent = tip.icon;
          return (
            <div key={tip.id} className="flex items-start gap-3 sm:gap-4">
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm sm:text-base dark:text-slate-200 leading-tight">
                    {tip.title}
                  </h4>
                  <div className="flex gap-1 ml-2 flex-shrink-0">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs px-2 py-0.5 ${getCategoryColor(tip.category)}`}
                    >
                      <span className="flex items-center gap-1">
                        {getCategoryIcon(tip.category)}
                        <span className="hidden sm:inline">{tip.category}</span>
                      </span>
                    </Badge>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">
                  {tip.description}
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <Badge 
                    variant="outline" 
                    className={`px-2 py-0.5 ${getDifficultyColor(tip.difficulty)}`}
                  >
                    {tip.difficulty}
                  </Badge>
                  {tip.estimatedTime && (
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {tip.estimatedTime}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {analytics && (
        <div className="mt-4 sm:mt-6 pt-4 border-t border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
            <CheckCircle className="h-4 w-4" />
            <span>
              Tips personalized based on your {analytics.efficiency.toFixed(0)}% efficiency rate
              {analytics.streak > 0 && ` and ${analytics.streak}-day streak`}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
});

StudyTips.displayName = "StudyTips";