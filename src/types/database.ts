
// Database types for Supabase tables

export interface Material {
  id: string;
  user_id: string;
  title: string;
  uploaded_at: string;
}

export interface Segment {
  id: string;
  material_id: string;
  title: string;
  text: string;
}

export interface Summary {
  id: string;
  segment_id: string;
  bullets: string[];
}

export interface Flashcard {
  id: string;
  segment_id: string;
  question: string;
  answer: string;
  next_review: string;
}

export interface Quiz {
  id: string;
  segment_id: string;
  type: 'mcq' | 'short';
  prompt: string;
  choices: string[] | null;
  correct_answer: string;
  explanation: string;
}

export interface ChatHistory {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Upload {
  id: string;
  user_id: string;
  filename: string;
  file_path: string;
  content_type: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      materials: {
        Row: Material;
      };
      segments: {
        Row: Segment;
      };
      summaries: {
        Row: Summary;
      };
      flashcards: {
        Row: Flashcard;
      };
      quizzes: {
        Row: Quiz;
      };
      chat_history: {
        Row: ChatHistory;
      };
      profiles: {
        Row: Profile;
      };
      uploads: {
        Row: Upload;
      };
    };
  };
}
