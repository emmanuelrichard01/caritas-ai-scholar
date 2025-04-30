
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface StudyPlanFormProps {
  onGenerate: () => void;
  isGenerating: boolean;
}

export const StudyPlanForm = ({ onGenerate, isGenerating }: StudyPlanFormProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="course1" className="dark:text-slate-300">Course/Subject 1</Label>
          <Input id="course1" placeholder="e.g., Calculus" className="dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
        </div>
        <div>
          <Label htmlFor="deadline1" className="dark:text-slate-300">Deadline</Label>
          <Input id="deadline1" type="date" className="dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="course2" className="dark:text-slate-300">Course/Subject 2</Label>
          <Input id="course2" placeholder="e.g., Physics" className="dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
        </div>
        <div>
          <Label htmlFor="deadline2" className="dark:text-slate-300">Deadline</Label>
          <Input id="deadline2" type="date" className="dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="productive-hours" className="dark:text-slate-300">Most Productive Hours</Label>
          <select 
            id="productive-hours" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="morning">Morning (6AM-12PM)</option>
            <option value="afternoon">Afternoon (12PM-5PM)</option>
            <option value="evening">Evening (5PM-10PM)</option>
            <option value="night">Night (10PM-6AM)</option>
          </select>
        </div>
        <div>
          <Label htmlFor="study-hours" className="dark:text-slate-300">Daily Study Hours</Label>
          <Input 
            id="study-hours" 
            type="number" 
            min="1" 
            max="12" 
            defaultValue="4"
            className="dark:border-slate-700 dark:bg-slate-800 dark:text-white" 
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch id="breaks" />
        <Label htmlFor="breaks" className="dark:text-slate-300">Include regular breaks (Pomodoro technique)</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch id="reminders" />
        <Label htmlFor="reminders" className="dark:text-slate-300">Send reminders to keep me on track</Label>
      </div>
      
      <Button 
        onClick={onGenerate} 
        className="w-full bg-green-600 hover:bg-green-700"
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            Generating...
          </>
        ) : (
          <>
            <Calendar className="mr-2 h-4 w-4" />
            Generate Study Plan
          </>
        )}
      </Button>
    </div>
  );
};
