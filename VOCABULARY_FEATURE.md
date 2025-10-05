# Vocabulary Tracking Feature

This feature automatically tracks vocabulary words that users learn from lessons and stores them without duplicates.

## Setup Instructions

### 1. Run the Database Migration

First, you need to create the `user_vocabulary` table in your Supabase database:

```bash
# Navigate to your Supabase project dashboard
# Go to SQL Editor and run the migration file:
supabase/migrations/007_create_user_vocabulary.sql
```

Or if you're using Supabase CLI locally:

```bash
supabase db push
```

### 2. How It Works

#### Lesson Structure
Lessons should include a `vocabulary` array in their content:

```json
{
  "content": {
    "vocabulary": [
      "你好",
      "再见",
      "早上好"
    ],
    "activities": [...]
  }
}
```

#### Automatic Tracking
When a user completes a lesson:
1. The system extracts all words from the `vocabulary` array
2. Words are added to the `user_vocabulary` table
3. Duplicates are automatically handled (won't add the same word twice)
4. The `times_reviewed` counter increments if a word is encountered again

#### Database Schema
```sql
user_vocabulary (
  id: UUID (primary key)
  user_id: UUID (references auth.users)
  word: TEXT
  language_code: TEXT
  learned_at: TIMESTAMP
  times_reviewed: INTEGER
  UNIQUE(user_id, word, language_code)
)
```

### 3. Features

- **No Duplicates**: Each word is stored once per user per language
- **Review Tracking**: Counts how many times a user has encountered the word
- **Language-Specific**: Words are tracked per language being learned
- **Automatic**: Words are added when lessons are completed
- **Vocabulary Page**: Users can view all their learned words at `/vocabulary`

### 4. Accessing Vocabulary

Users can access their vocabulary in two ways:

1. **Dashboard**: Click on "My Vocabulary" in the Quick Actions section
2. **Direct URL**: Navigate to `/vocabulary`

The vocabulary page shows:
- All words learned
- Date when each word was first learned
- Number of times reviewed (if more than once)
- Beautiful card-based layout

### 5. Updating Existing Lessons

To add vocabulary tracking to existing lessons, update their content in the database:

```sql
UPDATE lessons
SET content = jsonb_set(
  content,
  '{vocabulary}',
  '["word1", "word2", "word3"]'::jsonb
)
WHERE id = 'your-lesson-id';
```

### 6. Statistics

The "Words Learned" stat on the dashboard will show the total count of unique words the user has learned across all lessons.

To update this stat, you can create a database function or update it manually:

```sql
-- Update words_learned count for a user
UPDATE user_profiles
SET words_learned = (
  SELECT COUNT(*)
  FROM user_vocabulary
  WHERE user_id = 'user-id'
)
WHERE id = 'user-id';
```

## API Endpoints

No additional API endpoints are needed. The feature uses direct Supabase queries:

- `supabase.from('user_vocabulary').select()` - Get user's vocabulary
- `supabase.from('user_vocabulary').upsert()` - Add new words (handles duplicates)

## Security

Row Level Security (RLS) is enabled on the `user_vocabulary` table:
- Users can only view their own vocabulary
- Users can only insert/update/delete their own vocabulary
- All operations are tied to `auth.uid()`
