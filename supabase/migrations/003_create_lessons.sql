-- Create lessons table to store individual lessons for each course
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.language_courses(id) ON DELETE CASCADE,
  lesson_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  xp_reward INTEGER DEFAULT 10,
  content JSONB, -- Stores lesson content like vocabulary, grammar rules, exercises
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, lesson_number)
);

-- Create user_lesson_progress table to track user progress on lessons
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  score INTEGER CHECK (score >= 0 AND score <= 100),
  attempts INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Enable Row Level Security
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Policies for lessons table
-- Anyone can view published lessons
CREATE POLICY "Anyone can view published lessons"
  ON public.lessons
  FOR SELECT
  USING (is_published = true);

-- Policies for user_lesson_progress table
-- Users can view their own progress
CREATE POLICY "Users can view own lesson progress"
  ON public.user_lesson_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own lesson progress"
  ON public.user_lesson_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own lesson progress"
  ON public.user_lesson_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX idx_lessons_lesson_number ON public.lessons(lesson_number);
CREATE INDEX idx_lessons_is_published ON public.lessons(is_published);
CREATE INDEX idx_user_lesson_progress_user_id ON public.user_lesson_progress(user_id);
CREATE INDEX idx_user_lesson_progress_lesson_id ON public.user_lesson_progress(lesson_id);
CREATE INDEX idx_user_lesson_progress_status ON public.user_lesson_progress(status);

-- Create function to update updated_at timestamp for lessons
CREATE OR REPLACE FUNCTION public.update_lessons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at for lessons
CREATE TRIGGER update_lessons_timestamp
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lessons_updated_at();

-- Create function to update updated_at timestamp for user_lesson_progress
CREATE OR REPLACE FUNCTION public.update_user_lesson_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at for user_lesson_progress
CREATE TRIGGER update_user_lesson_progress_timestamp
  BEFORE UPDATE ON public.user_lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_lesson_progress_updated_at();

-- Create function to update user profile stats when lesson is completed
CREATE OR REPLACE FUNCTION public.update_user_stats_on_lesson_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if status changed to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.user_profiles
    SET 
      lessons_completed = lessons_completed + 1,
      xp_points = xp_points + (
        SELECT xp_reward 
        FROM public.lessons 
        WHERE id = NEW.lesson_id
      ),
      last_activity_date = NOW(),
      updated_at = NOW()
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update user stats on lesson completion
CREATE TRIGGER on_lesson_completed
  AFTER INSERT OR UPDATE ON public.user_lesson_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_stats_on_lesson_completion();
