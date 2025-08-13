import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Sparkles, BookOpen, Calendar, Clock, Target } from "lucide-react";
import { StudySubject, StudyPreferences } from "@/hooks/useStudyPlan";
import { Badge } from "@/components/ui/badge";

interface SimpleStudyPlanSetupProps {
  subjects: StudySubject[];
  preferences: StudyPreferences;
  onAddSubject: (name: string, hours: number, deadline?: Date) => void;
  onUpdateSubject: (id: string, updates: Partial<StudySubject>) => void;
  onRemoveSubject: (id: string) => void;
  onUpdatePreferences: (updates: Partial<StudyPreferences>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const SimpleStudyPlanSetup = ({ 
  subjects,
  preferences,
  onAddSubject,
  onUpdateSubject,
  onRemoveSubject,
  onUpdatePreferences,
  onGenerate, 
  isGenerating 
}: SimpleStudyPlanSetupProps) => {
  const [newSubject, setNewSubject] = useState({ name: "", hours: 10, deadline: "" });

  const addSubject = () => {
    if (newSubject.name.trim()) {
      const deadline = newSubject.deadline ? new Date(newSubject.deadline) : undefined;
      onAddSubject(newSubject.name.trim(), newSubject.hours, deadline);
      setNewSubject({ name: "", hours: 10, deadline: "" });
    }
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getDeadlineUrgency = (deadline?: Date) => {
    if (!deadline) return null;
    const days = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days <= 3) return "urgent";
    if (days <= 7) return "moderate";
    return "normal";
  };

  const totalHours = subjects.reduce((sum, s) => sum + s.estimatedHours, 0);
  const estimatedDays = Math.ceil(totalHours / preferences.dailyStudyHours);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      {subjects.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{subjects.length}</div>
            <div className="text-sm text-muted-foreground">Subjects</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{totalHours}h</div>
            <div className="text-sm text-muted-foreground">Total Hours</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{estimatedDays}d</div>
            <div className="text-sm text-muted-foreground">Duration</div>
          </Card>
        </div>
      )}

      {/* Add Subject - Simplified */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Add Your Subjects</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="subject-name">Subject Name</Label>
            <Input
              id="subject-name"
              value={newSubject.name}
              onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Mathematics, Chemistry, History"
              className="mt-1"
              onKeyPress={(e) => e.key === 'Enter' && addSubject()}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimated-hours">Study Hours Needed</Label>
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
              <Label htmlFor="deadline">Exam/Deadline (Optional)</Label>
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
          className="w-full mt-4"
          disabled={!newSubject.name.trim()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </Card>

      {/* Subject List - Simplified */}
      {subjects.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Your Subjects</h3>
          </div>
          
          <div className="space-y-3">
            {subjects.map((subject) => {
              const urgency = getDeadlineUrgency(subject.deadline);
              return (
                <div key={subject.id} className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: subject.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{subject.name}</span>
                      {urgency === "urgent" && (
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                      {urgency === "moderate" && (
                        <Badge variant="secondary" className="text-xs">
                          Due Soon
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {subject.estimatedHours}h
                      </span>
                      {subject.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Due {formatDate(subject.deadline)}
                        </span>
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
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Study Preferences - Simplified */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Study Preferences</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <Label className="text-sm font-medium">Daily Study Hours</Label>
            <Select
              value={preferences.dailyStudyHours.toString()}
              onValueChange={(value) => onUpdatePreferences({ dailyStudyHours: parseInt(value) })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 hours (Light)</SelectItem>
                <SelectItem value="4">4 hours (Moderate)</SelectItem>
                <SelectItem value="6">6 hours (Intensive)</SelectItem>
                <SelectItem value="8">8 hours (Maximum)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Session Length</Label>
            <Select
              value={preferences.sessionDuration.toString()}
              onValueChange={(value) => onUpdatePreferences({ sessionDuration: parseInt(value) })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25 minutes (Pomodoro)</SelectItem>
                <SelectItem value="45">45 minutes (Standard)</SelectItem>
                <SelectItem value="60">60 minutes (Extended)</SelectItem>
                <SelectItem value="90">90 minutes (Deep Focus)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Generate Button */}
      <Button 
        onClick={onGenerate} 
        className="w-full h-12 text-lg font-semibold"
        disabled={isGenerating || subjects.length === 0}
        size="lg"
      >
        {isGenerating ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            Creating Your Plan...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Create My Study Plan
          </>
        )}
      </Button>
      
      {subjects.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Add at least one subject to create your personalized study plan
        </p>
      )}
    </div>
  );
};