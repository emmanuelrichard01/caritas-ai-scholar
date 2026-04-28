
export interface Course {
  id: number;
  courseCode: string;
  creditLoad: number;
  grade: string;
}

export type GradeClassification =
  | "First Class"
  | "Second Class Upper"
  | "Second Class Lower"
  | "Third Class"
  | "Pass"
  | "Fail";

export const GRADE_POINTS: Record<string, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};

export const CLASSIFICATION_THRESHOLDS: { label: GradeClassification; min: number }[] = [
  { label: "First Class", min: 4.5 },
  { label: "Second Class Upper", min: 3.5 },
  { label: "Second Class Lower", min: 2.5 },
  { label: "Third Class", min: 1.5 },
  { label: "Pass", min: 1.0 },
  { label: "Fail", min: 0 },
];

export const classify = (gpa: number): GradeClassification =>
  CLASSIFICATION_THRESHOLDS.find((t) => gpa >= t.min)?.label ?? "Fail";

export const nextThreshold = (gpa: number) =>
  [...CLASSIFICATION_THRESHOLDS].reverse().find((t) => t.min > gpa) ?? null;
