
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { GradeClassification } from "@/types/gpa";

interface GPAResultsProps {
  calculatedGPA: number | null;
  totalCredits: number;
  totalPoints: number;
  classification: GradeClassification | null;
}

export const GPAResults = ({ 
  calculatedGPA,
  totalCredits,
  totalPoints,
  classification 
}: GPAResultsProps) => {
  return (
    <Card className="h-fit">
      <CardHeader className="pb-2">
        <h3 className="text-lg font-medium">GPA Results</h3>
      </CardHeader>
      <CardContent>
        {calculatedGPA ? (
          <div className="space-y-6">
            <div className="text-center p-6 rounded-lg bg-gradient-to-r from-purple-600/10 to-blue-600/10">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your GPA</p>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                {calculatedGPA}
              </p>
              {classification && (
                <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  {classification}
                </span>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Credits:</span>
                <span className="font-medium">{totalCredits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Points:</span>
                <span className="font-medium">{totalPoints}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Enter your courses and click "Calculate GPA" to see results.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
