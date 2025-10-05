-- Add last_activity_date column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS last_activity_date DATE;

-- Create a comment for the column
COMMENT ON COLUMN public.user_profiles.last_activity_date IS 'The last date the user was active (for streak tracking)';
