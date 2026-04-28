import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Target, Layers } from "lucide-react";
import { useMemo } from "react";

interface PriorRecord {
  cgpa: number;
  credits: number;
}

interface Props {
  currentGPA: number | null;
  currentCredits: number;
  prior: PriorRecord;
  setPrior: (p: PriorRecord) => void;
  targetGPA: number;
  setTargetGPA: (n: number) => void;
  cumulative: { cgpa: number; credits: number } | null;
}

export const GPAInsights = ({
  currentGPA,
  currentCredits,
  prior,
  setPrior,
  targetGPA,
  setTargetGPA,
  cumulative,
}: Props) => {
  // What-if: what semester GPA do you need next term (assuming same credit load)
  // to reach targetGPA cumulative?
  const projection = useMemo(() => {
    const totalEarned = (cumulative?.cgpa ?? prior.cgpa) * (cumulative?.credits ?? prior.credits);
    const earnedCredits = cumulative?.credits ?? prior.credits;
    if (earnedCredits === 0) return null;
    // Assume next-semester credit load = currentCredits or 18 default
    const nextCredits = currentCredits > 0 ? currentCredits : 18;
    const required =
      (targetGPA * (earnedCredits + nextCredits) - totalEarned) / nextCredits;
    return {
      required,
      nextCredits,
      feasible: required <= 5 && required >= 0,
      maxedOut: required < 0,
    };
  }, [cumulative, prior, targetGPA, currentCredits]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Cumulative builder */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-foreground/70" />
            <h3 className="text-base font-semibold">Cumulative GPA</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Combine this semester with your prior record.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prior-cgpa" className="text-xs">
                Prior CGPA
              </Label>
              <Input
                id="prior-cgpa"
                type="number"
                min={0}
                max={5}
                step={0.01}
                value={prior.cgpa || ""}
                onChange={(e) =>
                  setPrior({ ...prior, cgpa: parseFloat(e.target.value) || 0 })
                }
                placeholder="e.g. 3.85"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prior-credits" className="text-xs">
                Prior credits
              </Label>
              <Input
                id="prior-credits"
                type="number"
                min={0}
                step={1}
                value={prior.credits || ""}
                onChange={(e) =>
                  setPrior({ ...prior, credits: parseFloat(e.target.value) || 0 })
                }
                placeholder="e.g. 72"
                className="h-9"
              />
            </div>
          </div>
          {currentGPA === null && (
            <p className="text-xs text-muted-foreground">
              Calculate your semester GPA above to see your projected CGPA.
            </p>
          )}
          {currentGPA !== null && cumulative && (
            <div className="rounded-md bg-muted/40 border border-border p-3 text-sm">
              New CGPA:{" "}
              <span className="font-semibold tabular-nums">
                {cumulative.cgpa.toFixed(2)}
              </span>{" "}
              <span className="text-muted-foreground">
                · {cumulative.credits} cr
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Target solver */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-foreground/70" />
            <h3 className="text-base font-semibold">Target GPA Solver</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Find the GPA you need next semester to hit your goal.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Target CGPA</Label>
              <span className="text-sm font-semibold tabular-nums">
                {targetGPA.toFixed(2)}
              </span>
            </div>
            <Slider
              value={[targetGPA]}
              min={1}
              max={5}
              step={0.05}
              onValueChange={(v) => setTargetGPA(v[0])}
            />
          </div>

          {projection ? (
            <div className="rounded-md border border-border p-3 bg-muted/40 space-y-1">
              {projection.maxedOut ? (
                <p className="text-sm text-success font-medium">
                  You've already exceeded this target.
                </p>
              ) : projection.feasible ? (
                <p className="text-sm">
                  Need a{" "}
                  <span className="font-semibold tabular-nums">
                    {projection.required.toFixed(2)}
                  </span>{" "}
                  GPA over the next{" "}
                  <span className="font-medium">{projection.nextCredits}</span>{" "}
                  credit units.
                </p>
              ) : (
                <p className="text-sm text-destructive">
                  Unreachable in one semester at {projection.nextCredits} credits — set a lower target or add more credits.
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Based on{" "}
                {cumulative
                  ? `projected CGPA ${cumulative.cgpa.toFixed(2)} (${cumulative.credits} cr)`
                  : `prior CGPA ${prior.cgpa.toFixed(2)} (${prior.credits} cr)`}
                .
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Enter your prior CGPA and credits to compute the required next-semester GPA.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
