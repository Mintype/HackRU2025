-- Create user_vocabulary table to track words learned by users
CREATE TABLE IF NOT EXISTS user_vocabulary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  language_code TEXT NOT NULL,
  learned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  times_reviewed INTEGER DEFAULT 1,
  UNIQUE(user_id, word, language_code)
);

-- Create index for faster lookups
CREATE INDEX idx_user_vocabulary_user_id ON user_vocabulary(user_id);
CREATE INDEX idx_user_vocabulary_language ON user_vocabulary(language_code);

-- Enable RLS
ALTER TABLE user_vocabulary ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own vocabulary"
  ON user_vocabulary FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vocabulary"
  ON user_vocabulary FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vocabulary"
  ON user_vocabulary FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vocabulary"
  ON user_vocabulary FOR DELETE
  USING (auth.uid() = user_id);
