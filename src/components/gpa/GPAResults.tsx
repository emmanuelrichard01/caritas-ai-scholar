
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GradeClassification } from "@/types/gpa";
import { TrendingUp, Award, BookOpen, Target } from "lucide-react";

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
  const getClassificationColor = (classification: GradeClassification) => {
    switch (classification) {
      case "First Class": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Second Class Upper": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Second Class Lower": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Third Class": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "Pass": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getGPAAdvice = (gpa: number) => {
    if (gpa >= 4.5) return "Excellent! Keep up the outstanding work!";
    if (gpa >= 3.5) return "Great performance! You're doing very well.";
    if (gpa >= 2.5) return "Good work! Consider focusing more on challenging subjects.";
    if (gpa >= 1.5) return "You can improve! Focus on study strategies and seek help when needed.";
    return "There's room for significant improvement. Consider academic support resources.";
  };

  const getGPAIcon = (gpa: number) => {
    if (gpa >= 4.5) return <Award className="h-5 w-5 text-yellow-500" />;
    if (gpa >= 3.5) return <TrendingUp className="h-5 w-5 text-green-500" />;
    if (gpa >= 2.5) return <BookOpen className="h-5 w-5 text-blue-500" />;
    return <Target className="h-5 w-5 text-orange-500" />;
  };

  return (
    <Card className="h-fit sticky top-4">
      <CardHeader className="pb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          GPA Results
        </h3>
      </CardHeader>
      <CardContent>
        {calculatedGPA ? (
          <div className="space-y-6">
            {/* Main GPA Display */}
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border border-purple-100 dark:border-purple-800">
              <div className="flex items-center justify-center mb-2">
                {getGPAIcon(calculatedGPA)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your GPA</p>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {calculatedGPA.toFixed(2)}
              </p>
              {classification && (
                <Badge className={`text-xs font-medium ${getClassificationColor(classification)}`}>
                  {classification}
                </Badge>
              )}
            </div>
            
            {/* Detailed Statistics */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">{totalCredits}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Credits</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-center">
                  <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">{totalPoints.toFixed(1)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Points</p>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2 dark:text-white">Performance Analysis</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Average per credit:</span>
                    <span className="font-medium dark:text-white">{(totalPoints / totalCredits).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Grade scale:</span>
                    <span className="font-medium dark:text-white">5.0 Point System</span>
                  </div>
                </div>
              </div>

              {/* Advice Section */}
              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-medium mb-2 text-blue-800 dark:text-blue-200">Academic Advice</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">{getGPAAdvice(calculatedGPA)}</p>
              </div>

              {/* Progress Indicators */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Progress to First Class (4.50)</span>
                  <span>{calculatedGPA >= 4.5 ? "Achieved!" : `${((calculatedGPA / 4.5) * 100).toFixed(0)}%`}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min((calculatedGPA / 4.5) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h4 className="font-medium text-slate-600 dark:text-slate-400 mb-2">Ready to Calculate?</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter your courses and grades, then click "Calculate GPA" to see your results and performance insights.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
