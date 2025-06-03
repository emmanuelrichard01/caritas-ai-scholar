
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Calendar, Clock, Target } from "lucide-react";
import { StudyPlanData } from "@/hooks/useStudyPlan";

interface StudyPlanSetupProps {
  planData: StudyPlanData;
  onUpdatePlanData: (data: Partial<StudyPlanData>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const StudyPlanSetup = ({ 
  planData, 
  onUpdatePlanData, 
  onGenerate, 
  isGenerating 
}: StudyPlanSetupProps) => {
  const [newSubject, setNewSubject] = useState("");
  const [newGoal, setNewGoal] = useState("");

  const addSubject = () => {
    if (newSubject.trim()) {
      onUpdatePlanData({
        subjects: [...planData.subjects, newSubject.trim()]
      });
      setNewSubject("");
    }
  };

  const removeSubject = (index: number) => {
    onUpdatePlanData({
      subjects: planData.subjects.filter((_, i) => i !== index)
    });
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      onUpdatePlanData({
        goals: [...planData.goals, newGoal.trim()]
      });
      setNewGoal("");
    }
  };

  const removeGoal = (index: number) => {
    onUpdatePlanData({
      goals: planData.goals.filter((_, i) => i !== index)
    });
  };

  const toggleStudyDay = (day: string) => {
    const dayLower = day.toLowerCase();
    const newDays = planData.studyDays.includes(dayLower)
      ? planData.studyDays.filter(d => d !== dayLower)
      : [...planData.studyDays, dayLower];
    
    onUpdatePlanData({ studyDays: newDays });
  };

  const studyDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="space-y-6">
      {/* Subjects Section */}
      <Card className="p-6 dark:bg-slate-900">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold dark:text-white">Subjects to Study</h3>
        </div>
        
        <div className="flex gap-2 mb-3">
          <Input
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="Add a subject (e.g., Mathematics, Physics)"
            className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            onKeyPress={(e) => e.key === 'Enter' && addSubject()}
          />
          <Button onClick={addSubject} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {planData.subjects.map((subject, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {subject}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-red-500" 
                onClick={() => removeSubject(index)}
              />
            </Badge>
          ))}
        </div>
      </Card>

      {/* Study Schedule */}
      <Card className="p-6 dark:bg-slate-900">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold dark:text-white">Study Schedule</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="daily-hours" className="dark:text-slate-300">Daily Study Hours</Label>
            <Input
              id="daily-hours"
              type="number"
              min="1"
              max="12"
              value={planData.dailyHours}
              onChange={(e) => onUpdatePlanData({ dailyHours: parseInt(e.target.value) || 4 })}
              className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="preferred-time" className="dark:text-slate-300">Preferred Time</Label>
            <select
              id="preferred-time"
              value={planData.preferredTime}
              onChange={(e) => onUpdatePlanData({ preferredTime: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="morning">Morning (8AM-12PM)</option>
              <option value="afternoon">Afternoon (1PM-5PM)</option>
              <option value="evening">Evening (6PM-10PM)</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <Label className="dark:text-slate-300 mb-2 block">Study Days</Label>
          <div className="flex flex-wrap gap-2">
            {studyDays.map(day => (
              <Button
                key={day}
                variant={planData.studyDays.includes(day.toLowerCase()) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleStudyDay(day)}
                className="text-xs"
              >
                {day.slice(0, 3)}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="break-interval" className="dark:text-slate-300">Study Block Duration (minutes)</Label>
          <Input
            id="break-interval"
            type="number"
            min="15"
            max="90"
            value={planData.breakInterval}
            onChange={(e) => onUpdatePlanData({ breakInterval: parseInt(e.target.value) || 25 })}
            className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            placeholder="25 (Pomodoro technique)"
          />
        </div>
      </Card>

      {/* Goals Section */}
      <Card className="p-6 dark:bg-slate-900">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold dark:text-white">Study Goals</h3>
        </div>
        
        <div className="flex gap-2 mb-3">
          <Input
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            placeholder="Add a study goal (e.g., Pass final exam, Master calculus)"
            className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            onKeyPress={(e) => e.key === 'Enter' && addGoal()}
          />
          <Button onClick={addGoal} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {planData.goals.map((goal, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1">
              {goal}
              <X 
                className="h-3 w-3 cursor-pointer hover:text-red-500" 
                onClick={() => removeGoal(index)}
              />
            </Badge>
          ))}
        </div>
      </Card>

      <Button 
        onClick={onGenerate} 
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
        disabled={isGenerating || planData.subjects.length === 0}
        size="lg"
      >
        {isGenerating ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            Generating Your Personalized Plan...
          </>
        ) : (
          <>
            <Calendar className="mr-2 h-5 w-5" />
            Generate My Study Plan
          </>
        )}
      </Button>
    </div>
  );
};
