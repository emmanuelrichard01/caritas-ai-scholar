// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://yvlrspteukuooobkvzdz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bHJzcHRldWt1b29vYmt2emR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NjQyNDAsImV4cCI6MjA2MTE0MDI0MH0.EdFXxTk2mOOJwxWugX_nj4wsxffy1lK_l1jljUk2-T0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);