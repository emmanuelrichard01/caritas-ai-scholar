import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Target, Sparkles, Zap, BookOpen, Calendar, Clock, AlertTriangle } from "lucide-react";
import { StudySubject, StudyPreferences } from "@/hooks/useStudyPlan";
import { Badge } from "@/components/ui/badge";

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

  const getDeadlineUrgency = (deadline?: Date) => {
    if (!deadline) return null;
    const days = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days <= 3) return { level: "critical", text: `${days}d left`, color: "text-red-600" };
    if (days <= 7) return { level: "urgent", text: `${days}d left`, color: "text-orange-600" };
    if (days <= 14) return { level: "moderate", text: `${days}d left`, color: "text-yellow-600" };
    return { level: "normal", text: `${days}d left`, color: "text-green-600" };
  };

  const calculatePlanInsights = () => {
    const totalHours = subjects.reduce((sum, s) => sum + s.estimatedHours, 0);
    const subjectsWithDeadlines = subjects.filter(s => s.deadline);
    const earliestDeadline = subjectsWithDeadlines.length > 0 ? 
      Math.min(...subjectsWithDeadlines.map(s => s.deadline!.getTime())) : null;
    
    const daysUntilEarliest = earliestDeadline ? 
      Math.ceil((earliestDeadline - Date.now()) / (1000 * 60 * 60 * 24)) : null;
    
    const estimatedDays = Math.ceil(totalHours / preferences.dailyStudyHours);
    
    return {
      totalHours,
      estimatedDays,
      daysUntilEarliest,
      workloadIntensity: daysUntilEarliest && estimatedDays > daysUntilEarliest ? "high" : "normal"
    };
  };

  const insights = calculatePlanInsights();

  return (
    <div className="space-y-6">
      {/* Plan Insights */}
      {subjects.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-blue-600" />
            <h3 className="font-semibold text-blue-800 dark:text-blue-200">Plan Insights</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{insights.totalHours}h</div>
              <div className="text-xs text-blue-600/70">Total Study Time</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{insights.estimatedDays}d</div>
              <div className="text-xs text-purple-600/70">Estimated Duration</div>
            </div>
            {insights.daysUntilEarliest && (
              <div className="text-center">
                <div className={`text-lg font-bold ${insights.daysUntilEarliest <= 7 ? 'text-red-600' : 'text-green-600'}`}>
                  {insights.daysUntilEarliest}d
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Until Deadline</div>
              </div>
            )}
            <div className="text-center">
              <Badge variant={insights.workloadIntensity === "high" ? "destructive" : "secondary"} className="text-xs">
                {insights.workloadIntensity === "high" ? "Intensive" : "Balanced"}
              </Badge>
            </div>
          </div>
          {insights.workloadIntensity === "high" && (
            <div className="mt-3 p-2 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">High Intensity Workload</span>
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Consider extending study hours or adjusting deadlines for better balance.
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Add Subject */}
      <Card className="p-4 border-dashed border-2 border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold dark:text-white">Add Subject</h3>
        </div>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="subject-name" className="text-sm font-medium">Subject Name</Label>
            <Input
              id="subject-name"
              value={newSubject.name}
              onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Advanced Mathematics, Organic Chemistry"
              className="mt-1"
              onKeyPress={(e) => e.key === 'Enter' && addSubject()}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="estimated-hours" className="text-sm font-medium">Study Hours</Label>
              <Input
                id="estimated-hours"
                type="number"
                min="1"
                max="200"
                value={newSubject.hours}
                onChange={(e) => setNewSubject(prev => ({ ...prev, hours: parseInt(e.target.value) || 10 }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="deadline" className="text-sm font-medium">Deadline (Optional)</Label>
              <Input
                id="deadline"
                type="date"
                value={newSubject.deadline}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setNewSubject(prev => ({ ...prev, deadline: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
        </div>
        
        <Button 
          onClick={addSubject} 
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
          disabled={!newSubject.name.trim()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </Card>

      {/* Subjects List */}
      {subjects.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold dark:text-white">Subjects ({subjects.length})</h3>
            </div>
            <div className="text-sm text-gray-500">
              {subjects.reduce((sum, s) => sum + s.estimatedHours, 0)} total hours
            </div>
          </div>
          
          <div className="space-y-3">
            {subjects.map((subject) => {
              const urgency = getDeadlineUrgency(subject.deadline);
              return (
                <div key={subject.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: subject.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate dark:text-white">{subject.name}</span>
                      {getPriorityIcon(subject.priority)}
                      {urgency && (
                        <Badge variant="outline" className={`text-xs ${urgency.color}`}>
                          <Clock className="h-3 w-3 mr-1" />
                          {urgency.text}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span>{subject.estimatedHours}h</span>
                      {subject.deadline && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due {formatDate(subject.deadline)}
                          </span>
                        </>
                      )}
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
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Study Preferences */}
      <Card className="p-4">
        <h3 className="font-semibold mb-4 dark:text-white flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-600" />
          Study Preferences
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Daily Hours</Label>
              <Input
                type="number"
                min="1"
                max="16"
                value={preferences.dailyStudyHours}
                onChange={(e) => onUpdatePreferences({ dailyStudyHours: parseInt(e.target.value) || 4 })}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Recommended: 4-8 hours</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Session Duration</Label>
              <Input
                type="number"
                min="15"
                max="120"
                value={preferences.sessionDuration}
                onChange={(e) => onUpdatePreferences({ sessionDuration: parseInt(e.target.value) || 45 })}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Minutes per session</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Break Duration</Label>
              <Input
                type="number"
                min="5"
                max="30"
                value={preferences.breakDuration}
                onChange={(e) => onUpdatePreferences({ breakDuration: parseInt(e.target.value) || 15 })}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Minutes between sessions</p>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Study Days</Label>
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
            <p className="text-xs text-gray-500 mt-1">
              Selected: {preferences.studyDays.length} days per week
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Focus Mode</Label>
            <div className="flex flex-wrap gap-2">
              {[
                { mode: "pomodoro", desc: "25min focus + 5min break" },
                { mode: "timeboxing", desc: "Fixed time blocks" },
                { mode: "flexible", desc: "Adaptive scheduling" }
              ].map(({ mode, desc }) => (
                <div key={mode} className="flex-1 min-w-0">
                  <Button
                    variant={preferences.focusMode === mode ? "default" : "outline"}
                    size="sm"
                    onClick={() => onUpdatePreferences({ focusMode: mode as any })}
                    className="w-full text-xs capitalize"
                  >
                    {mode}
                  </Button>
                  <p className="text-xs text-gray-500 mt-1 text-center">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Button 
        onClick={onGenerate} 
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 font-semibold rounded-lg shadow-lg"
        disabled={isGenerating || subjects.length === 0}
        size="lg"
      >
        {isGenerating ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            Generating Smart Plan...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate AI Study Plan
          </>
        )}
      </Button>
      
      {subjects.length === 0 && (
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Add at least one subject to generate your personalized study plan
        </p>
      )}
    </div>
  );
};