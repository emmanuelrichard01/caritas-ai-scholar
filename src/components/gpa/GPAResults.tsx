import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  GradeClassification,
  classify,
  nextThreshold,
} from "@/types/gpa";
import { TrendingUp, Award, BookOpen, Sparkles } from "lucide-react";

interface Props {
  calculatedGPA: number | null;
  totalCredits: number;
  totalPoints: number;
  classification: GradeClassification | null;
  cumulative?: { cgpa: number; credits: number } | null;
}

const classBadgeClass = (c: GradeClassification) => {
  switch (c) {
    case "First Class":
      return "bg-success/10 text-success border-success/20";
    case "Second Class Upper":
      return "bg-info/10 text-info border-info/20";
    case "Second Class Lower":
      return "bg-warning/10 text-warning border-warning/20";
    case "Third Class":
      return "bg-warning/10 text-warning border-warning/20";
    case "Pass":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-destructive/10 text-destructive border-destructive/20";
  }
};

export const GPAResults = ({
  calculatedGPA,
  totalCredits,
  totalPoints,
  classification,
  cumulative,
}: Props) => {
  const next = calculatedGPA !== null ? nextThreshold(calculatedGPA) : null;
  const progressPct =
    calculatedGPA !== null ? Math.min((calculatedGPA / 5) * 100, 100) : 0;

  return (
    <Card className="h-fit lg:sticky lg:top-4 border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-foreground/70" />
          <h3 className="text-lg font-semibold">Result</h3>
        </div>
      </CardHeader>

      <CardContent>
        {calculatedGPA !== null ? (
          <div className="space-y-6">
            {/* GPA Display */}
            <div className="text-center p-6 rounded-xl bg-muted/40 border border-border">
              <p className="caption uppercase mb-1">Semester GPA</p>
              <p className="text-5xl font-semibold tracking-tight tabular-nums">
                {calculatedGPA.toFixed(2)}
                <span className="text-lg text-muted-foreground font-normal"> / 5.00</span>
              </p>
              {classification && (
                <Badge
                  variant="outline"
                  className={`mt-3 font-medium ${classBadgeClass(classification)}`}
                >
                  {classification}
                </Badge>
              )}
              <Progress value={progressPct} className="mt-4 h-1.5" />
              {next && (
                <p className="text-xs text-muted-foreground mt-2">
                  {(next.min - calculatedGPA).toFixed(2)} away from{" "}
                  <span className="font-medium text-foreground">{next.label}</span>
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/40 p-3 rounded-lg border border-border text-center">
                <p className="text-2xl font-semibold tabular-nums">{totalCredits}</p>
                <p className="caption">Credits</p>
              </div>
              <div className="bg-muted/40 p-3 rounded-lg border border-border text-center">
                <p className="text-2xl font-semibold tabular-nums">
                  {totalPoints.toFixed(1)}
                </p>
                <p className="caption">Quality Points</p>
              </div>
            </div>

            {/* Cumulative */}
            {cumulative && (
              <div className="rounded-lg border border-border p-4 bg-background">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-foreground/70" />
                    <span className="text-sm font-medium">Cumulative GPA</span>
                  </div>
                  <Badge variant="outline" className={classBadgeClass(classify(cumulative.cgpa))}>
                    {classify(cumulative.cgpa)}
                  </Badge>
                </div>
                <p className="text-3xl font-semibold tabular-nums">
                  {cumulative.cgpa.toFixed(2)}
                </p>
                <p className="caption mt-1">
                  Across {cumulative.credits} credit units
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h4 className="font-medium mb-1">No result yet</h4>
            <p className="text-sm text-muted-foreground">
              Add courses with credits and grades, then click <span className="font-medium text-foreground">Calculate GPA</span>.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
