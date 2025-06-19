
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Calendar, Clock, Target, Sparkles, Zap, BookOpen } from "lucide-react";
import { StudySubject, StudyPreferences } from "@/hooks/useStudyPlan";

interface StudyPlanSetupProps {
  subjects: StudySubject[];
  preferences: StudyPreferences;
  onAddSubject: (name: string, hours: number, deadline?: Date) => void;
  onUpdateSubject: (id: string, updates: Partial<StudySubject>) => void;
  onRemoveSubject: (id: string) => void;
  onUpdatePreferences: (updates: Partial<StudyPreferences>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const StudyPlanSetup = ({ 
  subjects,
  preferences,
  onAddSubject,
  onUpdateSubject,
  onRemoveSubject,
  onUpdatePreferences,
  onGenerate, 
  isGenerating 
}: StudyPlanSetupProps) => {
  const [newSubject, setNewSubject] = useState({ name: "", hours: 10, deadline: "" });

  const addSubject = () => {
    if (newSubject.name.trim()) {
      const deadline = newSubject.deadline ? new Date(newSubject.deadline) : undefined;
      onAddSubject(newSubject.name.trim(), newSubject.hours, deadline);
      setNewSubject({ name: "", hours: 10, deadline: "" });
    }
  };

  const toggleStudyDay = (day: string) => {
    const dayLower = day.toLowerCase();
    const newDays = preferences.studyDays.includes(dayLower)
      ? preferences.studyDays.filter(d => d !== dayLower)
      : [...preferences.studyDays, dayLower];
    
    onUpdatePreferences({ studyDays: newDays });
  };

  const studyDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <Zap className="h-3 w-3 text-red-500" />;
      case "medium": return <Target className="h-3 w-3 text-yellow-500" />;
      case "low": return <BookOpen className="h-3 w-3 text-green-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full">
          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">AI-Powered Study Planning</span>
        </div>
        <h2 className="text-2xl font-bold dark:text-white">Create Your Personalized Study Plan</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Our intelligent algorithm will analyze your subjects, preferences, and deadlines to create an optimal study schedule.
        </p>
      </div>

      {/* Add Subject */}
      <Card className="p-6 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 transition-colors">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold dark:text-white">Add Study Subject</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="subject-name" className="dark:text-slate-300">Subject Name</Label>
            <Input
              id="subject-name"
              value={newSubject.name}
              onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Calculus, Physics, Literature"
              className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && addSubject()}
            />
          </div>
          <div>
            <Label htmlFor="estimated-hours" className="dark:text-slate-300">Estimated Hours</Label>
            <Input
              id="estimated-hours"
              type="number"
              min="1"
              max="100"
              value={newSubject.hours}
              onChange={(e) => setNewSubject(prev => ({ ...prev, hours: parseInt(e.target.value) || 10 }))}
              className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <Label htmlFor="deadline" className="dark:text-slate-300">Deadline (Optional)</Label>
            <Input
              id="deadline"
              type="date"
              value={newSubject.deadline}
              onChange={(e) => setNewSubject(prev => ({ ...prev, deadline: e.target.value }))}
              className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>
        
        <Button onClick={addSubject} className="mt-4 bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </Card>

      {/* Subjects List */}
      {subjects.length > 0 && (
        <Card className="p-6 dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold dark:text-white">Your Study Subjects</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((subject) => (
              <div key={subject.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 flex-1">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: subject.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium dark:text-white truncate">{subject.name}</span>
                      {getPriorityIcon(subject.priority)}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>{subject.estimatedHours}h total</span>
                      {subject.deadline && (
                        <span>Due: {subject.deadline.toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select
                    value={subject.priority}
                    onValueChange={(value) => onUpdateSubject(subject.id, { priority: value as any })}
                  >
                    <SelectTrigger className="w-24 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveSubject(subject.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Study Preferences */}
      <Card className="p-6 dark:bg-slate-900">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold dark:text-white">Study Preferences</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="daily-hours" className="dark:text-slate-300">Daily Study Hours</Label>
            <Input
              id="daily-hours"
              type="number"
              min="1"
              max="12"
              value={preferences.dailyStudyHours}
              onChange={(e) => onUpdatePreferences({ dailyStudyHours: parseInt(e.target.value) || 4 })}
              className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="session-duration" className="dark:text-slate-300">Session Duration (min)</Label>
            <Input
              id="session-duration"
              type="number"
              min="15"
              max="120"
              value={preferences.sessionDuration}
              onChange={(e) => onUpdatePreferences({ sessionDuration: parseInt(e.target.value) || 45 })}
              className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="break-duration" className="dark:text-slate-300">Break Duration (min)</Label>
            <Input
              id="break-duration"
              type="number"
              min="5"
              max="30"
              value={preferences.breakDuration}
              onChange={(e) => onUpdatePreferences({ breakDuration: parseInt(e.target.value) || 15 })}
              className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-6">
          <Label className="dark:text-slate-300 mb-3 block">Study Days</Label>
          <div className="flex flex-wrap gap-2">
            {studyDays.map(day => (
              <Button
                key={day}
                variant={preferences.studyDays.includes(day.toLowerCase()) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleStudyDay(day)}
                className="text-xs"
              >
                {day.slice(0, 3)}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <Label className="dark:text-slate-300 mb-3 block">Focus Mode</Label>
          <div className="flex gap-2">
            {["pomodoro", "timeboxing", "flexible"].map(mode => (
              <Button
                key={mode}
                variant={preferences.focusMode === mode ? "default" : "outline"}
                size="sm"
                onClick={() => onUpdatePreferences({ focusMode: mode as any })}
                className="capitalize"
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <Button 
        onClick={onGenerate} 
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        disabled={isGenerating || subjects.length === 0}
        size="lg"
      >
        {isGenerating ? (
          <>
            <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            Generating Your Optimal Study Plan...
          </>
        ) : (
          <>
            <Sparkles className="mr-3 h-5 w-5" />
            Generate AI-Powered Study Plan
          </>
        )}
      </Button>
    </div>
  );
};
