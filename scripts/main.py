import os
from supabase import create_client, Client
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Initialize Supabase client with service role key to bypass RLS
url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
# Use service role key instead of anon key to bypass RLS
service_key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
if not service_key:
    print("Warning: SUPABASE_SERVICE_ROLE_KEY not found, trying anon key...")
    service_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(url, service_key)

def load_lessons_data():
    """Load lessons data from JSON file"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, 'spanish_data2.json')
    
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_course_id(language_code: str):
    """Get course ID by language code"""
    response = supabase.table('language_courses').select('id').eq('language_code', language_code).execute()
    if response.data and len(response.data) > 0:
        return response.data[0]['id']
    return None

def create_lessons_for_language(language_code: str, language_name: str):
    """Create 10 lessons for a specific language"""
    course_id = get_course_id(language_code)
    if not course_id:
        print(f"Error: Course not found for {language_name}")
        return
    
    # Load lessons data from JSON file
    lessons_data = load_lessons_data()
    lessons = lessons_data[language_code]
    
    for i, lesson_data in enumerate(lessons, start=1):
        # Merge content with activities
        content_with_activities = lesson_data['content'].copy()
        if 'activities' in lesson_data:
            content_with_activities['activities'] = lesson_data['activities']
        
        lesson = {
            'course_id': course_id,
            'lesson_number': i,
            'title': lesson_data['title'],
            'description': lesson_data['description'],
            'difficulty': lesson_data['difficulty'],
            'xp_reward': lesson_data['xp_reward'],
            'content': json.dumps(content_with_activities),
            'is_published': True
        }
        
        try:
            response = supabase.table('lessons').insert(lesson).execute()
            print(f"✓ Created {language_name} Lesson {i}: {lesson_data['title']}")
        except Exception as e:
            print(f"✗ Error creating {language_name} Lesson {i}: {str(e)}")

def main():
    """Main function to create lessons for all three languages"""
    print("Starting lesson creation...\n")
    
    languages = [
        ('es', 'Spanish'),
        # ('de', 'German'),
        # ('zh', 'Chinese')
    ]
    
    for lang_code, lang_name in languages:
        print(f"\nCreating lessons for {lang_name}...")
        create_lessons_for_language(lang_code, lang_name)
    
    print("\n✓ All lessons created successfully!")

if __name__ == "__main__":
    main()
