# Interactive Lesson Activities Update

## Overview
The lesson system has been updated to include **interactive activities** that users complete in order, making the learning experience more engaging and effective.

## Activity Types

### 1. **Multiple Choice** (`multiple_choice`)
- Users select one answer from multiple options
- Shows correct/incorrect feedback immediately
- Example: "What does 'Hola' mean in English?"

### 2. **Written Response** (`written`)
- Users type their answer in a text field
- Case-insensitive answer checking
- Optional hints available
- Example: "Translate to Spanish: 'My name is...'"

### 3. **Matching** (`matching`)
- Shows pairs of related terms (e.g., Spanish word → English translation)
- Users review the matches
- Example: Matching "Buenos días" to "Good morning"

## Lesson Structure

Each lesson now contains an `activities` array with the following structure:

```json
{
  "activities": [
    {
      "type": "multiple_choice",
      "order": 1,
      "question": "What does 'Hola' mean?",
      "options": ["Hello", "Goodbye", "Thank you", "Please"],
      "correct_answer": "Hello",
      "explanation": "Hola is the most common way to say hello in Spanish!"
    },
    {
      "type": "written",
      "order": 2,
      "question": "Translate to Spanish: 'My name is...'",
      "correct_answer": "Me llamo",
      "hint": "Starts with 'Me'",
      "explanation": "Me llamo is how you introduce yourself."
    }
  ]
}
```

## User Experience Flow

1. **Start Lesson** - User clicks "Start Lesson" on a lesson card
2. **Progress Through Activities** - Activities are shown one at a time in order
3. **Answer Questions** - User answers each activity
4. **Get Feedback** - Immediate feedback with explanation
5. **Continue** - Move to next activity after answering
6. **Complete Lesson** - See final score and option to retry or finish

## Features

✅ **Progress Bar** - Shows how far through the lesson the user is
✅ **Immediate Feedback** - Users know right away if they got it right
✅ **Explanations** - Every answer includes an explanation
✅ **Hints** - Written questions can have optional hints
✅ **Score Tracking** - Final score calculated and saved
✅ **Retry Option** - Users can retry lessons to improve their score

## Updated Files

### Frontend (`src/app/lessons/page.tsx`)
- Added activity state management
- Created interactive UI for each activity type
- Added progress tracking and scoring
- Implemented answer checking logic

### Backend (`scripts/main.py`)
- Updated lesson data structure to include activities
- Added example activities for Spanish lessons
- Each activity includes question, answer options, correct answer, and explanation

## Running the Update

To populate the database with the new interactive lessons:

```bash
python scripts/main.py
```

This will create/update lessons with the new activity structure.

## Next Steps

To add more lessons or activities:

1. Edit `scripts/main.py`
2. Add activities to the `activities` array for each lesson
3. Run the script to update the database
4. Activities will automatically appear in the lesson interface

## Example Activity Templates

### Multiple Choice
```python
{
    'type': 'multiple_choice',
    'order': 1,
    'question': 'Your question here?',
    'options': ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
    'correct_answer': 'Option 1',
    'explanation': 'Why this is the correct answer.'
}
```

### Written Response
```python
{
    'type': 'written',
    'order': 2,
    'question': 'Your question here?',
    'correct_answer': 'expected answer',
    'hint': 'Optional hint',
    'explanation': 'Why this is correct.'
}
```

### Matching
```python
{
    'type': 'matching',
    'order': 3,
    'question': 'Match the pairs:',
    'pairs': [
        {'spanish': 'Word1', 'english': 'Translation1'},
        {'spanish': 'Word2', 'english': 'Translation2'}
    ],
    'explanation': 'Context about these pairs.'
}
```
