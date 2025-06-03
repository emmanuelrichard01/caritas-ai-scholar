
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Clock, BookOpen, Coffee, Target } from "lucide-react";
import { StudySession } from "@/hooks/useStudyPlan";

interface StudyPlanDisplayProps {
  sessions: StudySession[];
  onToggleTask: (sessionId: string, taskId: string) => void;
}

export const StudyPlanDisplay = ({ sessions, onToggleTask }: StudyPlanDisplayProps) => {
  if (sessions.length === 0) return null;

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "break": return <Coffee className="h-4 w-4" />;
      case "practice": return <Target className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
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

  const calculateProgress = (session: StudySession) => {
    const completed = session.tasks.filter(task => task.completed).length;
    return (completed / session.tasks.length) * 100;
  };

  const getTotalStudyTime = (session: StudySession) => {
    return session.tasks
      .filter(task => task.type !== "break")
      .reduce((total, task) => total + task.duration, 0);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold dark:text-white mb-2">Your Personalized Study Plan</h2>
        <p className="text-slate-600 dark:text-slate-400">Follow this schedule to achieve your study goals efficiently</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sessions.map((session) => (
          <Card key={session.id} className="p-6 dark:bg-slate-900">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold dark:text-white">{session.date}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {session.timeSlot} • {getTotalStudyTime(session)} min study time
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(calculateProgress(session))}%
                </div>
                <div className="text-xs text-slate-500">Complete</div>
              </div>
            </div>

            <Progress 
              value={calculateProgress(session)} 
              className="mb-4" 
            />

            <div className="space-y-3">
              {session.tasks.map((task) => (
                <div 
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    task.completed 
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                      : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                  }`}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto"
                    onClick={() => onToggleTask(session.id, task.id)}
                  >
                    {task.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-400" />
                    )}
                  </Button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getTaskIcon(task.type)}
                      <span className={`font-medium ${task.completed ? 'line-through text-slate-500' : 'dark:text-white'}`}>
                        {task.subject}
                      </span>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{task.topic}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span className="text-xs text-slate-500">{task.duration} minutes</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 dark:bg-slate-900">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Study Tips for Success</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm dark:text-slate-300">Take regular breaks to maintain focus</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm dark:text-slate-300">Review previous material before starting new topics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm dark:text-slate-300">Stay hydrated and maintain good posture</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm dark:text-slate-300">Use active recall techniques for better retention</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm dark:text-slate-300">Eliminate distractions during study sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm dark:text-slate-300">Track your progress and celebrate achievements</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
