
import { CheckCircle, AlertCircle, Calendar } from "lucide-react";

export const AssignmentTips = () => {
  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border h-full dark:bg-slate-900 dark:border-slate-800">
      <h2 className="text-lg font-medium mb-4 dark:text-white">Assignment Tips</h2>
      <ul className="space-y-3">
        <li className="flex gap-2 text-sm">
          <CheckCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <span className="dark:text-slate-300">Break down large assignments into smaller tasks</span>
        </li>
        <li className="flex gap-2 text-sm">
          <CheckCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <span className="dark:text-slate-300">Start research early to find quality sources</span>
        </li>
        <li className="flex gap-2 text-sm">
          <CheckCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <span className="dark:text-slate-300">Create an outline before writing your first draft</span>
        </li>
        <li className="flex gap-2 text-sm">
          <CheckCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <span className="dark:text-slate-300">Allocate time for editing and proofreading</span>
        </li>
        <li className="flex gap-2 text-sm">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <span className="dark:text-slate-300">Avoid plagiarism by citing all sources properly</span>
        </li>
        <li className="flex gap-2 text-sm">
          <Calendar className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <span className="dark:text-slate-300">Schedule backwards from the due date</span>
        </li>
      </ul>
    </div>
  );
};
