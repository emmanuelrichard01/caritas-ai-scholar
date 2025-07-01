
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Clock, BookOpen, Coffee, Target, Zap, Brain, Trophy, Calendar } from "lucide-react";
import { StudySession } from "@/hooks/useStudyPlan";

interface StudyPlanDisplayProps {
  sessions: StudySession[];
  onToggleTask: (sessionId: string, taskId: string) => void;
  analytics: {
    totalHours: number;
    completedTasks: number;
    streak: number;
    efficiency: number;
  };
}

export const StudyPlanDisplay = ({ sessions, onToggleTask, analytics }: StudyPlanDisplayProps) => {
  if (sessions.length === 0) return null;

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "break": return <Coffee className="h-4 w-4 text-orange-500" />;
      case "practice": return <Target className="h-4 w-4 text-blue-500" />;
      case "review": return <Brain className="h-4 w-4 text-purple-500" />;
      case "exam": return <Trophy className="h-4 w-4 text-yellow-500" />;
      default: return <BookOpen className="h-4 w-4 text-green-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "hard": return "border-l-red-500";
      case "medium": return "border-l-yellow-500";
      case "easy": return "border-l-green-500";
      default: return "border-l-gray-500";
    }
  };

  const calculateProgress = (session: StudySession) => {
    const completed = session.tasks.filter(task => task.completed).length;
    return session.tasks.length > 0 ? (completed / session.tasks.length) * 100 : 0;
  };

  const getTotalStudyTime = (session: StudySession) => {
    return session.tasks
      .filter(task => task.type !== "break")
      .reduce((total, task) => total + task.duration, 0);
  };

  return (
    <div className="space-y-8">
      {/* Analytics Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-full">
          <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">Your Study Plan is Ready!</span>
        </div>
        <h2 className="text-3xl font-bold dark:text-white">Personalized Study Schedule</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Follow this AI-optimized schedule to maximize your learning efficiency and achieve your academic goals.
        </p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center dark:bg-slate-900 border-2 border-blue-200 dark:border-blue-800">
          <Clock className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{Math.round(analytics.totalHours)}h</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Total Study Time</div>
        </Card>
        
        <Card className="p-4 text-center dark:bg-slate-900 border-2 border-green-200 dark:border-green-800">
          <Target className="h-6 w-6 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{analytics.completedTasks}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Tasks Completed</div>
        </Card>
        
        <Card className="p-4 text-center dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-800">
          <Zap className="h-6 w-6 text-purple-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{Math.round(analytics.efficiency)}%</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Efficiency Rate</div>
        </Card>
        
        <Card className="p-4 text-center dark:bg-slate-900 border-2 border-orange-200 dark:border-orange-800">
          <Trophy className="h-6 w-6 text-orange-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{analytics.streak}</div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Day Streak</div>
        </Card>
      </div>

      {/* Study Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sessions.map((session, index) => (
          <Card key={session.id} className="overflow-hidden dark:bg-slate-900 hover:shadow-lg transition-shadow duration-300">
            {/* Session Header */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <h3 className="text-lg font-semibold dark:text-white">
                      Day {index + 1} - {new Date(session.date).toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {session.startTime} - {session.endTime} • {getTotalStudyTime(session)} min study time
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    {Math.round(calculateProgress(session))}%
                  </div>
                  <div className="text-xs text-slate-500">Complete</div>
                </div>
              </div>

              <Progress 
                value={calculateProgress(session)} 
                className="h-2" 
              />
            </div>

            {/* Tasks List */}
            <div className="p-6 space-y-3">
              {session.tasks.map((task) => (
                <div 
                  key={task.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-l-4 transition-all duration-300 ${
                    task.completed 
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 shadow-sm' 
                      : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:shadow-md'
                  } ${getDifficultyColor(task.difficulty)}`}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto hover:bg-transparent"
                    onClick={() => onToggleTask(session.id, task.id)}
                  >
                    {task.completed ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <Circle className="h-6 w-6 text-slate-400 hover:text-slate-600" />
                    )}
                  </Button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {getTaskIcon(task.type)}
                      <span className={`font-semibold text-sm ${task.completed ? 'line-through text-slate-500' : 'dark:text-white'}`}>
                        {task.title}
                      </span>
                      {task.difficulty !== "medium" && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            task.difficulty === "hard" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" :
                            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          }`}
                        >
                          {task.difficulty}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{task.description}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{task.duration} minutes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        <span className="capitalize">{task.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Study Tips */}
      <Card className="p-6 dark:bg-slate-900 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-6 w-6 text-blue-600" />
          <h3 className="text-xl font-semibold dark:text-white">Study Success Tips</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm dark:text-slate-200">Active Learning</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Use techniques like summarizing, questioning, and teaching concepts to others</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm dark:text-slate-200">Environment Optimization</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Study in a quiet, well-lit space free from distractions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm dark:text-slate-200">Regular Breaks</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Take short breaks to maintain focus and prevent mental fatigue</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm dark:text-slate-200">Spaced Repetition</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Review material at increasing intervals for better retention</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm dark:text-slate-200">Progress Tracking</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Monitor your progress and celebrate small achievements</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm dark:text-slate-200">Healthy Habits</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Stay hydrated, get enough sleep, and maintain good posture</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
