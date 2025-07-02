
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Target, Sparkles, Zap, BookOpen } from "lucide-react";
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

  const studyDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const fullDayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <Zap className="h-3 w-3 text-red-500" />;
      case "medium": return <Target className="h-3 w-3 text-orange-500" />;
      case "low": return <BookOpen className="h-3 w-3 text-green-500" />;
      default: return null;
    }
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Add Subject - Mobile Optimized */}
      <Card className="p-4 border-dashed">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-4 w-4 text-red-600" />
          <h3 className="font-semibold dark:text-white">Add Subject</h3>
        </div>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="subject-name" className="text-sm">Subject Name</Label>
            <Input
              id="subject-name"
              value={newSubject.name}
              onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Mathematics, Physics"
              className="mt-1"
              onKeyPress={(e) => e.key === 'Enter' && addSubject()}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="estimated-hours" className="text-sm">Hours</Label>
              <Input
                id="estimated-hours"
                type="number"
                min="1"
                max="100"
                value={newSubject.hours}
                onChange={(e) => setNewSubject(prev => ({ ...prev, hours: parseInt(e.target.value) || 10 }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="deadline" className="text-sm">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={newSubject.deadline}
                onChange={(e) => setNewSubject(prev => ({ ...prev, deadline: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
        </div>
        
        <Button onClick={addSubject} className="w-full mt-4 bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </Card>

      {/* Subjects List - Mobile Optimized */}
      {subjects.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-red-600" />
            <h3 className="font-semibold dark:text-white">Subjects ({subjects.length})</h3>
          </div>
          
          <div className="space-y-3">
            {subjects.map((subject) => (
              <div key={subject.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: subject.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm truncate dark:text-white">{subject.name}</span>
                    {getPriorityIcon(subject.priority)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {subject.estimatedHours}h
                    {subject.deadline && ` • Due ${formatDate(subject.deadline)}`}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select
                    value={subject.priority}
                    onValueChange={(value) => onUpdateSubject(subject.id, { priority: value as any })}
                  >
                    <SelectTrigger className="w-20 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Med</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveSubject(subject.id)}
                    className="h-8 w-8 p-0 text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Study Preferences - Mobile Optimized */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 dark:text-white">Preferences</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm">Daily Hours</Label>
              <Input
                type="number"
                min="1"
                max="12"
                value={preferences.dailyStudyHours}
                onChange={(e) => onUpdatePreferences({ dailyStudyHours: parseInt(e.target.value) || 4 })}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm">Session (min)</Label>
              <Input
                type="number"
                min="15"
                max="120"
                value={preferences.sessionDuration}
                onChange={(e) => onUpdatePreferences({ sessionDuration: parseInt(e.target.value) || 45 })}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label className="text-sm">Break (min)</Label>
              <Input
                type="number"
                min="5"
                max="30"
                value={preferences.breakDuration}
                onChange={(e) => onUpdatePreferences({ breakDuration: parseInt(e.target.value) || 15 })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Study Days</Label>
            <div className="flex flex-wrap gap-2">
              {studyDays.map((day, index) => (
                <Button
                  key={day}
                  variant={preferences.studyDays.includes(fullDayNames[index].toLowerCase()) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleStudyDay(fullDayNames[index])}
                  className="text-xs px-3"
                >
                  {day}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm mb-2 block">Focus Mode</Label>
            <div className="flex flex-wrap gap-2">
              {["pomodoro", "timeboxing", "flexible"].map(mode => (
                <Button
                  key={mode}
                  variant={preferences.focusMode === mode ? "default" : "outline"}
                  size="sm"
                  onClick={() => onUpdatePreferences({ focusMode: mode as any })}
                  className="capitalize text-xs"
                >
                  {mode}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Button 
        onClick={onGenerate} 
        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 font-semibold rounded-lg"
        disabled={isGenerating || subjects.length === 0}
        size="lg"
      >
        {isGenerating ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            Generating Plan...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Smart Plan
          </>
        )}
      </Button>
    </div>
  );
};
