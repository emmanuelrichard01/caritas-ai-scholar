import { Calculator } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { GPACalculatorForm } from "@/components/gpa/GPACalculatorForm";
import { GPAResults } from "@/components/gpa/GPAResults";
import { GPAInsights } from "@/components/gpa/GPAInsights";
import { useState, useEffect, useMemo } from "react";
import { Course, GradeClassification, GRADE_POINTS, classify } from "@/types/gpa";
import { toast } from "sonner";

const STORAGE_KEY = "gpa-calculator-state-v2";

interface PriorRecord {
  cgpa: number;
  credits: number;
}

const GPACalculator = () => {
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, courseCode: "", creditLoad: 0, grade: "A" },
  ]);
  const [calculatedGPA, setCalculatedGPA] = useState<number | null>(null);
  const [totalCredits, setTotalCredits] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [classification, setClassification] = useState<GradeClassification | null>(null);
  const [prior, setPrior] = useState<PriorRecord>({ cgpa: 0, credits: 0 });
  const [targetGPA, setTargetGPA] = useState<number>(4.5);

  // Hydrate
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.courses) && parsed.courses.length) setCourses(parsed.courses);
        if (parsed.prior) setPrior(parsed.prior);
        if (typeof parsed.targetGPA === "number") setTargetGPA(parsed.targetGPA);
      } else {
        // migrate legacy
        const legacy = localStorage.getItem("gpa-courses");
        if (legacy) setCourses(JSON.parse(legacy));
      }
    } catch (err) {
      console.error("Failed to load GPA state:", err);
    }
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ courses, prior, targetGPA })
    );
  }, [courses, prior, targetGPA]);

  // Live derived totals (preview before "Calculate")
  const liveTotals = useMemo(() => {
    const valid = courses.filter((c) => c.creditLoad > 0);
    const credits = valid.reduce((s, c) => s + c.creditLoad, 0);
    const points = valid.reduce(
      (s, c) => s + c.creditLoad * (GRADE_POINTS[c.grade] ?? 0),
      0
    );
    return { credits, points, gpa: credits > 0 ? points / credits : 0 };
  }, [courses]);

  const cumulative = useMemo(() => {
    if (calculatedGPA === null) return null;
    const totalC = prior.credits + totalCredits;
    if (totalC === 0) return null;
    const cgpa =
      (prior.cgpa * prior.credits + calculatedGPA * totalCredits) / totalC;
    return { cgpa: parseFloat(cgpa.toFixed(2)), credits: totalC };
  }, [calculatedGPA, totalCredits, prior]);

  const calculateGPA = () => {
    const valid = courses.filter(
      (c) => c.courseCode.trim() !== "" && c.creditLoad > 0
    );
    if (valid.length === 0) {
      toast.error("Please add at least one valid course");
      return;
    }
    const credits = valid.reduce((s, c) => s + c.creditLoad, 0);
    const points = valid.reduce(
      (s, c) => s + c.creditLoad * (GRADE_POINTS[c.grade] ?? 0),
      0
    );
    const gpa = parseFloat((points / credits).toFixed(2));
    setCalculatedGPA(gpa);
    setTotalCredits(credits);
    setTotalPoints(points);
    setClassification(classify(gpa));
    toast.success(`GPA: ${gpa.toFixed(2)} — ${classify(gpa)}`);
  };

  const resetCalculator = () => {
    setCourses([{ id: 1, courseCode: "", creditLoad: 0, grade: "A" }]);
    setCalculatedGPA(null);
    setTotalCredits(0);
    setTotalPoints(0);
    setClassification(null);
    toast.success("Calculator reset");
  };

  return (
    <PageLayout
      title="GP Calculator"
      subtitle="Compute semester GPA, project your CGPA, and plan toward a target"
      icon={<Calculator className="h-6 w-6" />}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl p-6 shadow-soft border border-border">
            <div className="flex items-center justify-between gap-2 mb-6">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-foreground/70" />
                <h2 className="text-lg font-semibold">Course Details</h2>
              </div>
              <div className="text-xs text-muted-foreground">
                Live: <span className="font-medium text-foreground">{liveTotals.credits}</span> cr ·{" "}
                <span className="font-medium text-foreground">
                  {liveTotals.gpa.toFixed(2)}
                </span>{" "}
                GPA
              </div>
            </div>
            <GPACalculatorForm
              courses={courses}
              setCourses={setCourses}
              onCalculate={calculateGPA}
              onReset={resetCalculator}
            />
          </div>

          <GPAInsights
            currentGPA={calculatedGPA}
            currentCredits={totalCredits}
            prior={prior}
            setPrior={setPrior}
            targetGPA={targetGPA}
            setTargetGPA={setTargetGPA}
            cumulative={cumulative}
          />
        </div>

        <div>
          <GPAResults
            calculatedGPA={calculatedGPA}
            totalCredits={totalCredits}
            totalPoints={totalPoints}
            classification={classification}
            cumulative={cumulative}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default GPACalculator;
