export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      chat_history: {
        Row: {
          category: string
          content: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          content?: string | null
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      flashcards: {
        Row: {
          answer: string
          created_at: string
          id: string
          next_review: string
          question: string
          segment_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          next_review?: string
          question: string
          segment_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          next_review?: string
          question?: string
          segment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          description: string | null
          id: string
          title: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          description?: string | null
          id?: string
          title: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          description?: string | null
          id?: string
          title?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          choices: string[] | null
          correct_answer: string
          created_at: string
          explanation: string | null
          id: string
          prompt: string
          segment_id: string
          type: string
        }
        Insert: {
          choices?: string[] | null
          correct_answer: string
          created_at?: string
          explanation?: string | null
          id?: string
          prompt: string
          segment_id: string
          type: string
        }
        Update: {
          choices?: string[] | null
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          id?: string
          prompt?: string
          segment_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
        ]
      }
      segments: {
        Row: {
          created_at: string
          id: string
          material_id: string
          text: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          text: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          text?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "segments_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plans: {
        Row: {
          analytics: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          preferences: Json
          sessions: Json
          subjects: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analytics?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          preferences?: Json
          sessions?: Json
          subjects?: Json
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analytics?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          preferences?: Json
          sessions?: Json
          subjects?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      summaries: {
        Row: {
          bullets: string[]
          created_at: string
          id: string
          segment_id: string
        }
        Insert: {
          bullets: string[]
          created_at?: string
          id?: string
          segment_id: string
        }
        Update: {
          bullets?: string[]
          created_at?: string
          id?: string
          segment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "summaries_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: true
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
        ]
      }
      uploads: {
        Row: {
          content_type: string
          created_at: string
          file_path: string
          filename: string
          id: string
          user_id: string
        }
        Insert: {
          content_type: string
          created_at?: string
          file_path: string
          filename: string
          id?: string
          user_id: string
        }
        Update: {
          content_type?: string
          created_at?: string
          file_path?: string
          filename?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
