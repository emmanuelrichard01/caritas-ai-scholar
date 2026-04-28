-- Migration: Multi-Tenancy Foundation
-- Description: Adds universities table and associates user-scoped tables with a university ID.

-- 1. Create the Universities table
CREATE TABLE IF NOT EXISTS public.universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- e.g., "caritas", "unn", "covenant"
  logo_url TEXT,
  primary_color TEXT DEFAULT '#dc2626', -- hex color for branding
  domain TEXT, -- e.g., "caritasuni.edu.ng" for email validation
  country TEXT DEFAULT 'NG',
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb, -- grading scale, semester structure, etc.
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on universities table
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;

-- Everyone can read active universities (needed for branding on auth/landing pages)
CREATE POLICY "Universities are viewable by everyone" ON public.universities
  FOR SELECT USING (is_active = true);

-- Only admins can modify universities (assuming role based admin later, for now just postgres)

-- 2. Seed the initial university (Caritas)
INSERT INTO public.universities (name, slug, domain, country, primary_color)
VALUES ('Caritas University', 'caritas', 'caritasuni.edu.ng', 'NG', '#dc2626')
ON CONFLICT (slug) DO NOTHING;

-- 3. Update existing tables to support multi-tenancy
-- Add university_id to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES public.universities(id);

-- Add university_id to chat_history
ALTER TABLE public.chat_history 
  ADD COLUMN IF NOT EXISTS university_id UUID REFERENCES public.universities(id);

-- 4. Update RLS policies to account for university scoped data
-- Profiles policy update (allow reading profiles from same university - useful for future features)
CREATE POLICY "Users can read profiles in their university" ON public.profiles
  FOR SELECT USING (
    university_id = (SELECT university_id FROM public.profiles WHERE id = auth.uid())
  );

-- 5. Function to automatically assign new users to a university based on their email domain
CREATE OR REPLACE FUNCTION public.assign_university_on_signup()
RETURNS trigger AS $$
DECLARE
  v_email_domain TEXT;
  v_university_id UUID;
BEGIN
  -- Extract domain from email (e.g. student@caritasuni.edu.ng -> caritasuni.edu.ng)
  v_email_domain := split_part(NEW.email, '@', 2);
  
  -- Try to find matching university domain
  SELECT id INTO v_university_id 
  FROM public.universities 
  WHERE domain = v_email_domain AND is_active = true
  LIMIT 1;
  
  -- If not found by domain, assign to default (Caritas) for now
  IF v_university_id IS NULL THEN
    SELECT id INTO v_university_id 
    FROM public.universities 
    WHERE slug = 'caritas'
    LIMIT 1;
  END IF;
  
  -- Update the profile with the university_id
  UPDATE public.profiles
  SET university_id = v_university_id
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run after profile creation
DROP TRIGGER IF EXISTS on_profile_created_assign_university ON public.profiles;
CREATE TRIGGER on_profile_created_assign_university
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_university_on_signup();
