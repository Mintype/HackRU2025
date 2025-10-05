-- Create reading_texts table to store articles/stories for reading practice
CREATE TABLE IF NOT EXISTS public.reading_texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_code TEXT NOT NULL, -- Language of the text (es, fr, de, ja, zh, ko, it, pt, ru, ar, hi, nl)
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- The actual text content to read
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')) NOT NULL,
  word_count INTEGER, -- Approximate word count of the text
  category TEXT, -- e.g., 'news', 'story', 'article', 'conversation'
  source TEXT, -- Optional: source or author of the text
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_reading_progress table to track which texts users have read
CREATE TABLE IF NOT EXISTS public.user_reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  text_id UUID NOT NULL REFERENCES public.reading_texts(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  words_looked_up INTEGER DEFAULT 0, -- Count of words user looked up translations for
  completed BOOLEAN DEFAULT false,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, text_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_reading_texts_language ON public.reading_texts(language_code);
CREATE INDEX idx_reading_texts_difficulty ON public.reading_texts(difficulty);
CREATE INDEX idx_reading_texts_published ON public.reading_texts(is_published);
CREATE INDEX idx_user_reading_progress_user ON public.user_reading_progress(user_id);
CREATE INDEX idx_user_reading_progress_text ON public.user_reading_progress(text_id);

-- Enable Row Level Security
ALTER TABLE public.reading_texts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reading_progress ENABLE ROW LEVEL SECURITY;

-- Policies for reading_texts table
-- Anyone can view published reading texts
CREATE POLICY "Anyone can view published reading texts"
  ON public.reading_texts
  FOR SELECT
  USING (is_published = true);

-- Policies for user_reading_progress table
-- Users can view their own reading progress
CREATE POLICY "Users can view own reading progress"
  ON public.user_reading_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own reading progress
CREATE POLICY "Users can insert own reading progress"
  ON public.user_reading_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reading progress
CREATE POLICY "Users can update own reading progress"
  ON public.user_reading_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Insert some sample reading texts for different languages
INSERT INTO public.reading_texts (language_code, title, content, difficulty, word_count, category) VALUES
('es', 'El Gato y el Ratón', 'Había una vez un gato que vivía en una casa grande. Un día, el gato vio un ratón pequeño. El ratón corrió muy rápido. El gato corrió detrás del ratón, pero el ratón era muy inteligente y se escondió en un agujero pequeño. El gato esperó todo el día, pero el ratón nunca salió.', 'beginner', 60, 'story'),
('es', 'Mi Familia', 'Mi familia es muy importante para mí. Tengo dos hermanos y una hermana. Mi madre es profesora y mi padre es médico. Vivimos en una casa con un jardín grande. Los fines de semana, nos gusta cocinar juntos y ver películas. Mi hermano mayor toca la guitarra y mi hermana pequeña le gusta pintar.', 'beginner', 62, 'article'),
('fr', 'Le Petit Déjeuner', 'Chaque matin, je prends mon petit déjeuner à sept heures. J''aime manger des croissants avec du beurre et de la confiture. Je bois aussi du café avec du lait. Mon frère préfère les céréales avec du lait froid. Ma mère prépare toujours un délicieux petit déjeuner pour toute la famille.', 'beginner', 55, 'article'),
('de', 'Der Park', 'Im Park gibt es viele Bäume und Blumen. Die Kinder spielen auf dem Spielplatz. Ein alter Mann sitzt auf einer Bank und liest die Zeitung. Eine Frau geht mit ihrem Hund spazieren. Der Hund ist sehr freundlich und spielt mit anderen Hunden. Im Sommer ist der Park immer voll mit Menschen.', 'beginner', 58, 'story'),
('ja', '朝の習慣', '毎朝六時に起きます。最初にシャワーを浴びて、それから朝ごはんを食べます。朝ごはんはご飯と味噌汁と魚です。朝ごはんの後、新聞を読みます。七時半に家を出て、会社に行きます。電車で三十分かかります。', 'beginner', 45, 'article');

-- Add comments to tables
COMMENT ON TABLE public.reading_texts IS 'Stores texts/articles/stories for reading practice in different languages';
COMMENT ON TABLE public.user_reading_progress IS 'Tracks user progress and engagement with reading texts';
