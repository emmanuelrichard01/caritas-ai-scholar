
import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface ChatHistoryItem {
  id: string;
  title: string;
  category: string;
  content: string;
  created_at: string;
  updated_at: string;
}
