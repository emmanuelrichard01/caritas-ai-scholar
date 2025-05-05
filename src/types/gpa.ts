
export interface Course {
  id: number;
  courseCode: string;
  creditLoad: number;
  grade: string;
}

export type GradeClassification = "First Class" | "Second Class Upper" | "Second Class Lower" | "Third Class" | "Pass";
