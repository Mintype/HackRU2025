-- Create language_courses table to store available language courses
CREATE TABLE IF NOT EXISTS public.language_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_code TEXT NOT NULL UNIQUE,
  language_name TEXT NOT NULL,
  description TEXT,
  flag_emoji TEXT,
  total_lessons INTEGER DEFAULT 0,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.language_courses ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Anyone can view active language courses
CREATE POLICY "Anyone can view active language courses"
  ON public.language_courses
  FOR SELECT
  USING (is_active = true);

-- Create index for faster lookups
CREATE INDEX idx_language_courses_language_code ON public.language_courses(language_code);
CREATE INDEX idx_language_courses_is_active ON public.language_courses(is_active);

-- Insert some sample language courses
INSERT INTO public.language_courses (language_code, language_name, description, flag_emoji, difficulty_level) VALUES
  ('es', 'Spanish', 'Learn Spanish from scratch or improve your existing skills', '🇪🇸', 'beginner'),
  ('fr', 'French', 'Master the language of love and culture', '🇫🇷', 'beginner'),
  ('de', 'German', 'Discover the German language and culture', '🇩🇪', 'beginner'),
  ('it', 'Italian', 'Learn the beautiful Italian language', '🇮🇹', 'beginner'),
  ('pt', 'Portuguese', 'Speak Portuguese like a native', '🇵🇹', 'beginner'),
  ('ja', 'Japanese', 'Explore the fascinating Japanese language', '🇯🇵', 'beginner'),
  ('ko', 'Korean', 'Learn Korean and K-culture', '🇰🇷', 'beginner'),
  ('zh', 'Chinese', 'Master Mandarin Chinese', '🇨🇳', 'beginner')
ON CONFLICT (language_code) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_language_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_language_courses_timestamp
  BEFORE UPDATE ON public.language_courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_language_courses_updated_at();
