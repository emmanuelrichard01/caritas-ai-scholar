
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ResearchErrorProps {
  error: string | null;
}

export const ResearchError = ({ error }: ResearchErrorProps) => {
  if (!error) return null;
  
  return (
    <Card className="p-4 md:p-6 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
        <div>
          <h3 className="font-medium text-red-800 dark:text-red-300 mb-1">
            Error Loading Research Results
          </h3>
          <p className="text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        </div>
      </div>
    </Card>
  );
};
