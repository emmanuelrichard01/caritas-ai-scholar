
import { CheckCircle, Clock } from "lucide-react";

export const StudyTips = () => {
  return (
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
  );
};
