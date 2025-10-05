# Language Switcher Feature

## Overview
Users can now switch their learning language from the dashboard. When a user switches languages, their profile in the `user_profiles` table is updated with the new `learning_language` value.

## Implementation Details

### Database Schema
The feature uses the existing `user_profiles` table structure:
- **Table**: `user_profiles`
- **Column**: `learning_language` (TEXT)
- **Update Method**: `upsert` - updates the existing row for the user

### Frontend Changes

#### 1. Dashboard (`src/app/dashboard/page.tsx`)
- Added `showLanguageSwitcher` state to control the language switcher modal
- Added `handleOpenLanguageSwitcher()` function to open the switcher
- Updated `handleLanguageSelection()` to close both modals after language selection
- Converted the language display badge into a clickable button
- Added hover effects and a dropdown icon to indicate it's clickable

#### 2. Language Selection Modal (`src/components/LanguageSelectionModal.tsx`)
- Added `onClose` prop for closing the modal
- Added `canClose` prop to control whether the modal can be dismissed
- Added close button (X) in the top-right corner when `canClose` is true
- Added backdrop click handler to close modal when clicking outside
- The modal is non-dismissible on first signup (`canClose=false`)
- The modal is dismissible when switching languages (`canClose=true`)

## User Experience

### First Time Setup
1. User signs up/logs in
2. Modal appears asking them to select a language
3. Modal cannot be dismissed (no X button, backdrop clicks don't close it)
4. User must select a language to proceed

### Switching Languages
1. User clicks on the language badge in the navigation bar
2. Language selection modal appears
3. User can dismiss the modal by:
   - Clicking the X button
   - Clicking outside the modal (on the backdrop)
   - Selecting a new language
4. Upon selecting a new language:
   - The `user_profiles` table is updated via `upsert`
   - User profile is refreshed
   - Vocabulary count is refetched for the new language
   - Both modals are closed

## Technical Notes

### Database Updates
- Uses Supabase's `upsert` method to update the user's profile
- The same row is updated - no new rows are created
- Only the `learning_language` field is modified during language switching

### Data Consistency
- When language is switched, the vocabulary count is automatically refetched for the new language
- Recent activities remain unchanged (they're language-agnostic)
- User's progress in the previous language is preserved in the database

### Supported Languages
- Spanish (es) 🇪🇸
- French (fr) 🇫🇷
- German (de) 🇩🇪
- Japanese (ja) 🇯🇵
- Chinese (zh) 🇨🇳
- Korean (ko) 🇰🇷
- Italian (it) 🇮🇹
- Portuguese (pt) 🇵🇹
- Russian (ru) 🇷🇺
- Arabic (ar) 🇸🇦
- Hindi (hi) 🇮🇳
- Dutch (nl) 🇳🇱

## Future Enhancements
- Add a confirmation dialog when switching languages
- Show warning about progress being preserved but not visible
- Add ability to learn multiple languages simultaneously (would require schema changes)
- Add language-specific settings or preferences
