# Supabase SQL Migrations

This folder contains SQL migration files to be run in Supabase.

## How to Apply Migrations

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of each migration file in order
4. Run each migration

## Migration Files

### 001_create_user_profiles.sql
Creates the `user_profiles` table to store:
- User's learning language
- Native language (defaults to English)
- XP points, lessons completed, words learned
- Current streak tracking
- Activity timestamps

Also includes:
- Row Level Security (RLS) policies
- Automatic profile creation trigger on user signup
- Database indexes for performance

## Available Languages

The system supports tracking any language code. Common examples:
- `es` - Spanish
- `fr` - French
- `de` - German
- `ja` - Japanese
- `zh` - Chinese
- `ko` - Korean
- `it` - Italian
- `pt` - Portuguese
- `ru` - Russian
- `ar` - Arabic
