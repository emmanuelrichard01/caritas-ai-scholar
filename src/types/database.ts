
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
        Row: {
          category: string;
          content: string | null;
          created_at: string;
          id: string;
          title: string;
          updated_at: string;
          user_id: string;
        };
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
        };
      };
      uploads: {
        Row: {
          content_type: string;
          created_at: string;
          file_path: string;
          filename: string;
          id: string;
          user_id: string;
        };
      };
    };
  };
}
