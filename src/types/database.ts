
export interface Material {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  uploaded_at: string;
}

export interface Segment {
  id: string;
  material_id: string;
  title: string;
  text: string;
  created_at?: string;
}

export interface Summary {
  id?: string;
  segment_id: string;
  bullets: string[];
  created_at?: string;
}

export interface Flashcard {
  id?: string;
  segment_id: string;
  question: string;
  answer: string;
  next_review?: string;
  created_at?: string;
}

export interface Quiz {
  id?: string;
  segment_id: string;
  type: 'mcq' | 'short';
  prompt: string;
  choices?: string[];
  correct_answer: string;
  explanation?: string;
  created_at?: string;
}
