
import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const StudyPlanner = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  
  const handleGeneratePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowPlan(true);
      toast.success("Study plan generated successfully");
    }, 2000);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navigation />
      
      <div className="flex-1 pl-[70px] md:pl-[260px] transition-all duration-300">
        <div className="p-6 max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center text-white mr-4">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold dark:text-white">Personalized Study Planner</h1>
              <p className="text-muted-foreground dark:text-slate-400">Create a customized study schedule based on your needs</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl p-6 shadow-sm border mb-6 dark:bg-slate-900 dark:border-slate-800">
                <h2 className="text-lg font-medium mb-4 dark:text-white">Create Your Study Plan</h2>
                
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
                    onClick={handleGeneratePlan} 
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
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-xl p-6 shadow-sm border h-full dark:bg-slate-900 dark:border-slate-800">
                <h2 className="text-lg font-medium mb-4 dark:text-white">Tips for Effective Study</h2>
                <ul className="space-y-3">
                  <li className="flex gap-2 text-sm">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="dark:text-slate-300">Study in focused 25-minute blocks with 5-minute breaks</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="dark:text-slate-300">Alternate between different subjects to improve retention</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="dark:text-slate-300">Review important material right before bedtime</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="dark:text-slate-300">Test yourself regularly instead of passive re-reading</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="dark:text-slate-300">Stay hydrated and take short walks during breaks</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <span className="dark:text-slate-300">Your most productive time: <strong>Morning</strong></span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {showPlan && (
            <div className="mt-6 bg-white rounded-xl p-6 shadow-sm border dark:bg-slate-900 dark:border-slate-800">
              <h2 className="text-lg font-medium mb-4 dark:text-white">Your Personalized Study Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium mb-3 dark:text-slate-200">Monday - Wednesday - Friday</h3>
                  <div className="space-y-3">
                    <div className="bg-slate-50 p-3 rounded-lg dark:bg-slate-800">
                      <p className="text-sm font-medium dark:text-slate-200">8:00 AM - 9:25 AM</p>
                      <p className="text-xs text-muted-foreground dark:text-slate-400">Calculus: Review concepts and practice problems</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg dark:bg-slate-800">
                      <p className="text-sm font-medium dark:text-slate-200">9:30 AM - 9:45 AM</p>
                      <p className="text-xs text-muted-foreground dark:text-slate-400">Break: Short walk and hydration</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg dark:bg-slate-800">
                      <p className="text-sm font-medium dark:text-slate-200">9:45 AM - 11:10 AM</p>
                      <p className="text-xs text-muted-foreground dark:text-slate-400">Physics: Read chapters and summarize key points</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-md font-medium mb-3 dark:text-slate-200">Tuesday - Thursday - Saturday</h3>
                  <div className="space-y-3">
                    <div className="bg-slate-50 p-3 rounded-lg dark:bg-slate-800">
                      <p className="text-sm font-medium dark:text-slate-200">8:00 AM - 9:25 AM</p>
                      <p className="text-xs text-muted-foreground dark:text-slate-400">Physics: Practice problems and example solutions</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg dark:bg-slate-800">
                      <p className="text-sm font-medium dark:text-slate-200">9:30 AM - 9:45 AM</p>
                      <p className="text-xs text-muted-foreground dark:text-slate-400">Break: Stretching and mindfulness</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg dark:bg-slate-800">
                      <p className="text-sm font-medium dark:text-slate-200">9:45 AM - 11:10 AM</p>
                      <p className="text-xs text-muted-foreground dark:text-slate-400">Calculus: Problem sets and application exercises</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPlanner;
