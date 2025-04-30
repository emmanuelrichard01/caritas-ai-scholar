
interface StudyPlanDisplayProps {
  visible: boolean;
}

export const StudyPlanDisplay = ({ visible }: StudyPlanDisplayProps) => {
  if (!visible) return null;
  
  return (
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
  );
};
