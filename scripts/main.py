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
    
    lessons_data = {
        'es': [
            {
                'title': 'Basic Greetings',
                'description': 'Learn how to say hello, goodbye, and introduce yourself in Spanish',
                'difficulty': 'easy',
                'content': {
                    'vocabulary': ['Hola', 'Adiós', 'Buenos días', '¿Cómo estás?', 'Me llamo'],
                    'phrases': ['Hola, ¿cómo estás?', 'Mucho gusto', '¿Cómo te llamas?']
                },
                'xp_reward': 10,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What does "Hola" mean in English?',
                        'options': ['Hello', 'Goodbye', 'Thank you', 'Please'],
                        'correct_answer': 'Hello',
                        'explanation': 'Hola is the most common way to say hello in Spanish!'
                    },
                    {
                        'type': 'multiple_choice',
                        'order': 2,
                        'question': 'How do you say "goodbye" in Spanish?',
                        'options': ['Hola', 'Gracias', 'Adiós', 'Por favor'],
                        'correct_answer': 'Adiós',
                        'explanation': 'Adiós is used to say goodbye.'
                    },
                    {
                        'type': 'written',
                        'order': 3,
                        'question': 'Translate to Spanish: "My name is..."',
                        'correct_answer': 'Me llamo',
                        'hint': 'Starts with "Me"',
                        'explanation': '"Me llamo" is how you introduce yourself in Spanish.'
                    },
                    {
                        'type': 'matching',
                        'order': 4,
                        'question': 'Match the Spanish greetings to their English meanings:',
                        'pairs': [
                            {'spanish': 'Buenos días', 'english': 'Good morning'},
                            {'spanish': 'Buenas tardes', 'english': 'Good afternoon'},
                            {'spanish': 'Buenas noches', 'english': 'Good night'}
                        ],
                        'explanation': 'These are formal greetings used at different times of day.'
                    }
                ]
            },
            {
                'title': 'Numbers 1-20',
                'description': 'Master counting from 1 to 20 in Spanish',
                'difficulty': 'easy',
                'content': {
                    'vocabulary': ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'diez', 'veinte'],
                    'exercises': ['Count to 10', 'Practice pronunciation']
                },
                'xp_reward': 15,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What is the Spanish word for "three"?',
                        'options': ['dos', 'tres', 'cuatro', 'cinco'],
                        'correct_answer': 'tres',
                        'explanation': 'Tres means three in Spanish.'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'Write the Spanish word for the number 5',
                        'correct_answer': 'cinco',
                        'hint': 'Sounds like "sink-o"',
                        'explanation': 'Cinco is the Spanish word for five.'
                    },
                    {
                        'type': 'multiple_choice',
                        'order': 3,
                        'question': 'Which number comes after "nueve"?',
                        'options': ['ocho', 'diez', 'once', 'siete'],
                        'correct_answer': 'diez',
                        'explanation': 'Nueve is nine, so diez (ten) comes next.'
                    },
                    {
                        'type': 'written',
                        'order': 4,
                        'question': 'Write the Spanish word for "ten"',
                        'correct_answer': 'diez',
                        'hint': 'Sounds like "dee-eth"',
                        'explanation': 'Diez is the Spanish word for ten.'
                    },
                    {
                        'type': 'multiple_choice',
                        'order': 5,
                        'question': 'What is "uno" in English?',
                        'options': ['Zero', 'One', 'Two', 'Ten'],
                        'correct_answer': 'One',
                        'explanation': 'Uno means one in Spanish.'
                    }
                ]
            },
            {
                'title': 'Colors',
                'description': 'Learn the names of common colors in Spanish',
                'difficulty': 'easy',
                'content': {
                    'vocabulary': ['rojo', 'azul', 'verde', 'amarillo', 'negro', 'blanco'],
                    'phrases': ['El cielo es azul', 'La manzana es roja']
                },
                'xp_reward': 10,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What color is "rojo"?',
                        'options': ['Red', 'Blue', 'Green', 'Yellow'],
                        'correct_answer': 'Red',
                        'explanation': 'Rojo means red in Spanish.'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'Write the Spanish word for "blue"',
                        'correct_answer': 'azul',
                        'hint': 'Similar to the English word "azure"',
                        'explanation': 'Azul is the Spanish word for blue.'
                    },
                    {
                        'type': 'multiple_choice',
                        'order': 3,
                        'question': 'Complete: "El cielo es ____" (The sky is blue)',
                        'options': ['rojo', 'azul', 'verde', 'negro'],
                        'correct_answer': 'azul',
                        'explanation': 'The sky is blue - El cielo es azul.'
                    },
                    {
                        'type': 'written',
                        'order': 4,
                        'question': 'Write the Spanish word for "green"',
                        'correct_answer': 'verde',
                        'hint': 'Similar to "verdant"',
                        'explanation': 'Verde is green in Spanish.'
                    },
                    {
                        'type': 'matching',
                        'order': 5,
                        'question': 'Match the colors:',
                        'pairs': [
                            {'spanish': 'amarillo', 'english': 'yellow'},
                            {'spanish': 'negro', 'english': 'black'},
                            {'spanish': 'blanco', 'english': 'white'}
                        ],
                        'explanation': 'These are basic color words in Spanish.'
                    }
                ]
            },
            {
                'title': 'Family Members',
                'description': 'Vocabulary for talking about your family',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['madre', 'padre', 'hermano', 'hermana', 'abuela', 'abuelo'],
                    'phrases': ['Esta es mi familia', 'Tengo dos hermanos']
                },
                'xp_reward': 20,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What does "madre" mean?',
                        'options': ['Mother', 'Father', 'Sister', 'Brother'],
                        'correct_answer': 'Mother',
                        'explanation': 'Madre means mother in Spanish.'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'Write the Spanish word for "brother"',
                        'correct_answer': 'hermano',
                        'hint': 'Similar to the word "hermana" (sister)',
                        'explanation': 'Hermano means brother in Spanish.'
                    },
                    {
                        'type': 'multiple_choice',
                        'order': 3,
                        'question': 'Complete: "Tengo dos ____" (I have two brothers)',
                        'options': ['hermanos', 'hermanas', 'padres', 'abuelos'],
                        'correct_answer': 'hermanos',
                        'explanation': 'Hermanos is the plural of hermano (brother).'
                    },
                    {
                        'type': 'matching',
                        'order': 4,
                        'question': 'Match the family members:',
                        'pairs': [
                            {'spanish': 'abuela', 'english': 'grandmother'},
                            {'spanish': 'abuelo', 'english': 'grandfather'},
                            {'spanish': 'hermana', 'english': 'sister'}
                        ],
                        'explanation': 'These are common family member terms in Spanish.'
                    }
                ]
            },
            {
                'title': 'Days of the Week',
                'description': 'Learn all seven days of the week',
                'difficulty': 'easy',
                'content': {
                    'vocabulary': ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
                    'phrases': ['Hoy es lunes', '¿Qué día es hoy?']
                },
                'xp_reward': 15,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What day is "lunes"?',
                        'options': ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
                        'correct_answer': 'Monday',
                        'explanation': 'Lunes is Monday in Spanish.'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'Write the Spanish word for "Friday"',
                        'correct_answer': 'viernes',
                        'hint': 'It starts with "v"',
                        'explanation': 'Viernes is Friday in Spanish.'
                    },
                    {
                        'type': 'multiple_choice',
                        'order': 3,
                        'question': 'What does "¿Qué día es hoy?" mean?',
                        'options': ['What time is it?', 'What day is today?', 'How are you?', 'Where are you?'],
                        'correct_answer': 'What day is today?',
                        'explanation': 'This phrase is used to ask what day it is today.'
                    },
                    {
                        'type': 'written',
                        'order': 4,
                        'question': 'Write the Spanish word for "Saturday"',
                        'correct_answer': 'sábado',
                        'hint': 'Starts with "s"',
                        'explanation': 'Sábado is Saturday in Spanish.'
                    },
                    {
                        'type': 'matching',
                        'order': 5,
                        'question': 'Match the days:',
                        'pairs': [
                            {'spanish': 'martes', 'english': 'Tuesday'},
                            {'spanish': 'jueves', 'english': 'Thursday'},
                            {'spanish': 'domingo', 'english': 'Sunday'}
                        ],
                        'explanation': 'These are important days of the week.'
                    }
                ]
            },
            {
                'title': 'Food and Drinks',
                'description': 'Essential vocabulary for ordering food',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['agua', 'pan', 'leche', 'carne', 'frutas', 'verduras'],
                    'phrases': ['Quiero agua, por favor', 'La comida está deliciosa']
                },
                'xp_reward': 20,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What is "agua"?',
                        'options': ['Water', 'Bread', 'Milk', 'Meat'],
                        'correct_answer': 'Water',
                        'explanation': 'Agua means water in Spanish.'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'How do you say "bread" in Spanish?',
                        'correct_answer': 'pan',
                        'hint': 'Similar to the English word "pan"',
                        'explanation': 'Pan is bread in Spanish.'
                    },
                    {
                        'type': 'matching',
                        'order': 3,
                        'question': 'Match the foods:',
                        'pairs': [
                            {'spanish': 'carne', 'english': 'meat'},
                            {'spanish': 'frutas', 'english': 'fruits'},
                            {'spanish': 'verduras', 'english': 'vegetables'}
                        ],
                        'explanation': 'These are essential food vocabulary words.'
                    },
                    {
                        'type': 'multiple_choice',
                        'order': 4,
                        'question': 'How do you say "I want water, please"?',
                        'options': ['Quiero agua, por favor', 'Tengo agua', 'Necesito pan', 'Como frutas'],
                        'correct_answer': 'Quiero agua, por favor',
                        'explanation': '"Quiero" means "I want" and "por favor" means "please".'
                    }
                ]
            },
            {
                'title': 'Present Tense Verbs',
                'description': 'Introduction to regular -ar, -er, -ir verbs',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['hablar', 'comer', 'vivir', 'trabajar', 'estudiar'],
                    'grammar': ['yo hablo', 'tú hablas', 'él/ella habla'],
                    'phrases': ['Yo hablo español', 'Ella come frutas']
                },
                'xp_reward': 25,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What does "hablar" mean?',
                        'options': ['to speak', 'to eat', 'to live', 'to work'],
                        'correct_answer': 'to speak',
                        'explanation': 'Hablar is a regular -ar verb meaning "to speak".'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'Conjugate "hablar" for "yo" (I)',
                        'correct_answer': 'hablo',
                        'hint': 'Remove -ar and add -o',
                        'explanation': 'For -ar verbs, the yo form ends in -o: hablo.'
                    },
                    {
                        'type': 'multiple_choice',
                        'order': 3,
                        'question': 'Which is correct: "I speak Spanish"?',
                        'options': ['Yo hablo español', 'Yo hablas español', 'Yo hablar español', 'Yo hablan español'],
                        'correct_answer': 'Yo hablo español',
                        'explanation': 'Yo (I) uses the -o ending: hablo.'
                    },
                    {
                        'type': 'matching',
                        'order': 4,
                        'question': 'Match the verbs to their meanings:',
                        'pairs': [
                            {'spanish': 'comer', 'english': 'to eat'},
                            {'spanish': 'vivir', 'english': 'to live'},
                            {'spanish': 'trabajar', 'english': 'to work'}
                        ],
                        'explanation': 'These are common regular verbs in Spanish.'
                    }
                ]
            },
            {
                'title': 'Asking Questions',
                'description': 'Learn how to ask common questions',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['¿Qué?', '¿Dónde?', '¿Cuándo?', '¿Cómo?', '¿Por qué?', '¿Quién?'],
                    'phrases': ['¿Dónde está el baño?', '¿Cuánto cuesta?']
                },
                'xp_reward': 20,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What does "¿Dónde?" mean?',
                        'options': ['Where?', 'When?', 'How?', 'Why?'],
                        'correct_answer': 'Where?',
                        'explanation': '¿Dónde? is used to ask "where?".'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'How do you ask "What?" in Spanish?',
                        'correct_answer': '¿Qué?',
                        'hint': 'Starts with Q',
                        'explanation': '¿Qué? means "What?" in Spanish.'
                    },
                    {
                        'type': 'multiple_choice',
                        'order': 3,
                        'question': 'What does "¿Dónde está el baño?" mean?',
                        'options': ['Where is the bathroom?', 'How much is it?', 'What is this?', 'Who are you?'],
                        'correct_answer': 'Where is the bathroom?',
                        'explanation': 'This is a very useful phrase for travelers!'
                    },
                    {
                        'type': 'matching',
                        'order': 4,
                        'question': 'Match the question words:',
                        'pairs': [
                            {'spanish': '¿Cuándo?', 'english': 'When?'},
                            {'spanish': '¿Cómo?', 'english': 'How?'},
                            {'spanish': '¿Quién?', 'english': 'Who?'}
                        ],
                        'explanation': 'These are essential question words in Spanish.'
                    }
                ]
            },
            {
                'title': 'Common Adjectives',
                'description': 'Descriptive words for people and things',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['grande', 'pequeño', 'bueno', 'malo', 'bonito', 'feo'],
                    'phrases': ['La casa es grande', 'El perro es pequeño']
                },
                'xp_reward': 20,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What does "grande" mean?',
                        'options': ['Big/Large', 'Small', 'Good', 'Bad'],
                        'correct_answer': 'Big/Large',
                        'explanation': 'Grande means big or large in Spanish.'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'What is the opposite of "grande"?',
                        'correct_answer': 'pequeño',
                        'hint': 'Means "small"',
                        'explanation': 'Pequeño means small, the opposite of grande.'
                    },
                    {
                        'type': 'matching',
                        'order': 3,
                        'question': 'Match the adjectives:',
                        'pairs': [
                            {'spanish': 'bueno', 'english': 'good'},
                            {'spanish': 'malo', 'english': 'bad'},
                            {'spanish': 'bonito', 'english': 'pretty/beautiful'}
                        ],
                        'explanation': 'These are common adjectives to describe quality.'
                    },
                    {
                        'type': 'multiple_choice',
                        'order': 4,
                        'question': 'Complete: "La casa es ____" (The house is big)',
                        'options': ['grande', 'pequeño', 'bueno', 'malo'],
                        'correct_answer': 'grande',
                        'explanation': 'Grande is the correct adjective for "big".'
                    }
                ]
            },
            {
                'title': 'Shopping Basics',
                'description': 'Vocabulary and phrases for shopping',
                'difficulty': 'hard',
                'content': {
                    'vocabulary': ['tienda', 'precio', 'dinero', 'comprar', 'vender'],
                    'phrases': ['¿Cuánto cuesta esto?', 'Es muy caro', 'Quiero comprar'],
                    'dialogues': ['Shopping conversation at a market']
                },
                'xp_reward': 30,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What does "¿Cuánto cuesta esto?" mean?',
                        'options': ['How much does this cost?', 'Where is the store?', 'I want to buy this', 'This is expensive'],
                        'correct_answer': 'How much does this cost?',
                        'explanation': 'This is the most common way to ask the price of something.'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'Write the Spanish word for "store"',
                        'correct_answer': 'tienda',
                        'hint': 'Starts with "t"',
                        'explanation': 'Tienda means store or shop in Spanish.'
                    },
                    {
                        'type': 'matching',
                        'order': 3,
                        'question': 'Match the shopping vocabulary:',
                        'pairs': [
                            {'spanish': 'comprar', 'english': 'to buy'},
                            {'spanish': 'vender', 'english': 'to sell'},
                            {'spanish': 'dinero', 'english': 'money'}
                        ],
                        'explanation': 'Essential vocabulary for shopping transactions.'
                    },
                    {
                        'type': 'multiple_choice',
                        'order': 4,
                        'question': 'How do you say "It\'s very expensive"?',
                        'options': ['Es muy caro', 'Es muy barato', 'Quiero comprar', 'No tengo dinero'],
                        'correct_answer': 'Es muy caro',
                        'explanation': 'Caro means expensive, barato means cheap.'
                    },
                    {
                        'type': 'written',
                        'order': 5,
                        'question': 'Translate: "I want to buy"',
                        'correct_answer': 'Quiero comprar',
                        'hint': 'Quiero = I want',
                        'explanation': 'Quiero comprar is used when you want to purchase something.'
                    }
                ]
            }
        ],
        'de': [
            {
                'title': 'Basic Greetings',
                'description': 'Learn how to say hello, goodbye, and introduce yourself in German',
                'difficulty': 'easy',
                'content': {
                    'vocabulary': ['Hallo', 'Auf Wiedersehen', 'Guten Tag', 'Wie geht\'s?', 'Ich heiße'],
                    'phrases': ['Hallo, wie geht\'s?', 'Sehr gut', 'Wie heißt du?']
                },
                'xp_reward': 10,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What does "Hallo" mean in English?',
                        'options': ['Hello', 'Goodbye', 'Thank you', 'Please'],
                        'correct_answer': 'Hello',
                        'explanation': 'Hallo is the common way to say hello in German!'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'How do you say "goodbye" in German?',
                        'correct_answer': 'Auf Wiedersehen',
                        'hint': 'It\'s a longer phrase',
                        'explanation': 'Auf Wiedersehen is the formal way to say goodbye.'
                    },
                    {
                        'type': 'matching',
                        'order': 3,
                        'question': 'Match the German greetings:',
                        'pairs': [
                            {'spanish': 'Guten Morgen', 'english': 'Good morning'},
                            {'spanish': 'Guten Tag', 'english': 'Good day'},
                            {'spanish': 'Gute Nacht', 'english': 'Good night'}
                        ],
                        'explanation': 'These are formal greetings used at different times of day.'
                    },
                    {
                        'type': 'multiple_choice',
                        'order': 4,
                        'question': 'What does "Wie geht\'s?" mean?',
                        'options': ['How are you?', 'What\'s your name?', 'Where are you?', 'How old are you?'],
                        'correct_answer': 'How are you?',
                        'explanation': 'Wie geht\'s? is a casual way to ask "How are you?"'
                    },
                    {
                        'type': 'written',
                        'order': 5,
                        'question': 'How do you say "My name is" in German?',
                        'correct_answer': 'Ich heiße',
                        'hint': 'Starts with "Ich"',
                        'explanation': 'Ich heiße means "My name is" in German.'
                    }
                ]
            },
            {
                'title': 'Numbers 1-20',
                'description': 'Master counting from 1 to 20 in German',
                'difficulty': 'easy',
                'content': {
                    'vocabulary': ['eins', 'zwei', 'drei', 'vier', 'fünf', 'zehn', 'zwanzig'],
                    'exercises': ['Count to 10', 'Practice pronunciation']
                },
                'xp_reward': 15,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What is "drei" in English?',
                        'options': ['Two', 'Three', 'Four', 'Five'],
                        'correct_answer': 'Three',
                        'explanation': 'Drei means three in German.'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'Write the German word for "five"',
                        'correct_answer': 'fünf',
                        'hint': 'Starts with "f"',
                        'explanation': 'Fünf is the German word for five.'
                    },
                    {
                        'type': 'multiple_choice',
                        'order': 3,
                        'question': 'What is "zehn" in English?',
                        'options': ['Eight', 'Nine', 'Ten', 'Eleven'],
                        'correct_answer': 'Ten',
                        'explanation': 'Zehn means ten in German.'
                    },
                    {
                        'type': 'written',
                        'order': 4,
                        'question': 'Write the German word for "one"',
                        'correct_answer': 'eins',
                        'hint': 'Similar to "ein"',
                        'explanation': 'Eins is the German word for one.'
                    },
                    {
                        'type': 'matching',
                        'order': 5,
                        'question': 'Match the numbers:',
                        'pairs': [
                            {'spanish': 'zwei', 'english': 'two'},
                            {'spanish': 'vier', 'english': 'four'},
                            {'spanish': 'zwanzig', 'english': 'twenty'}
                        ],
                        'explanation': 'These are basic numbers in German.'
                    }
                ]
            },
            {
                'title': 'Colors',
                'description': 'Learn the names of common colors in German',
                'difficulty': 'easy',
                'content': {
                    'vocabulary': ['rot', 'blau', 'grün', 'gelb', 'schwarz', 'weiß'],
                    'phrases': ['Der Himmel ist blau', 'Der Apfel ist rot']
                },
                'xp_reward': 10,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What color is "rot"?',
                        'options': ['Red', 'Blue', 'Green', 'Yellow'],
                        'correct_answer': 'Red',
                        'explanation': 'Rot means red in German.'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'Write the German word for "blue"',
                        'correct_answer': 'blau',
                        'hint': 'Similar to English',
                        'explanation': 'Blau is the German word for blue.'
                    },
                    {
                        'type': 'multiple_choice',
                        'order': 3,
                        'question': 'What is "grün" in English?',
                        'options': ['Gray', 'Green', 'Brown', 'Orange'],
                        'correct_answer': 'Green',
                        'explanation': 'Grün means green in German.'
                    },
                    {
                        'type': 'written',
                        'order': 4,
                        'question': 'Write the German word for "yellow"',
                        'correct_answer': 'gelb',
                        'hint': 'Starts with "g"',
                        'explanation': 'Gelb is yellow in German.'
                    },
                    {
                        'type': 'matching',
                        'order': 5,
                        'question': 'Match the colors:',
                        'pairs': [
                            {'spanish': 'schwarz', 'english': 'black'},
                            {'spanish': 'weiß', 'english': 'white'},
                            {'spanish': 'Der Himmel ist blau', 'english': 'The sky is blue'}
                        ],
                        'explanation': 'These are basic colors and phrases in German.'
                    }
                ]
            },
            {
                'title': 'Family Members',
                'description': 'Vocabulary for talking about your family',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['Mutter', 'Vater', 'Bruder', 'Schwester', 'Großmutter', 'Großvater'],
                    'phrases': ['Das ist meine Familie', 'Ich habe zwei Brüder']
                },
                'xp_reward': 20,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What does "Mutter" mean?',
                        'options': ['Mother', 'Father', 'Sister', 'Brother'],
                        'correct_answer': 'Mother',
                        'explanation': 'Mutter means mother in German.'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'Write the German word for "brother"',
                        'correct_answer': 'Bruder',
                        'hint': 'Starts with \"B\"',
                        'explanation': 'Bruder means brother in German.'
                    }
                ]
            },
            {
                'title': 'Days of the Week',
                'description': 'Learn all seven days of the week',
                'difficulty': 'easy',
                'content': {
                    'vocabulary': ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
                    'phrases': ['Heute ist Montag', 'Welcher Tag ist heute?']
                },
                'xp_reward': 15,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What day is "Montag"?',
                        'options': ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
                        'correct_answer': 'Monday',
                        'explanation': 'Montag is Monday in German.'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'Write the German word for "Friday"',
                        'correct_answer': 'Freitag',
                        'hint': 'Starts with \"F\"',
                        'explanation': 'Freitag is Friday in German.'
                    }
                ]
            },
            {
                'title': 'Food and Drinks',
                'description': 'Essential vocabulary for ordering food',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['Wasser', 'Brot', 'Milch', 'Fleisch', 'Obst', 'Gemüse'],
                    'phrases': ['Ich möchte Wasser, bitte', 'Das Essen ist lecker']
                },
                'xp_reward': 20,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What is "Wasser"?',
                        'options': ['Water', 'Bread', 'Milk', 'Meat'],
                        'correct_answer': 'Water',
                        'explanation': 'Wasser means water in German.'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'How do you say "bread" in German?',
                        'correct_answer': 'Brot',
                        'hint': 'Starts with \"B\"',
                        'explanation': 'Brot is bread in German.'
                    }
                ]
            },
            {
                'title': 'Present Tense Verbs',
                'description': 'Introduction to regular German verbs',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['sprechen', 'essen', 'wohnen', 'arbeiten', 'lernen'],
                    'grammar': ['ich spreche', 'du sprichst', 'er/sie spricht'],
                    'phrases': ['Ich spreche Deutsch', 'Sie isst Obst']
                },
                'xp_reward': 25,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What does "sprechen" mean?',
                        'options': ['to speak', 'to eat', 'to live', 'to work'],
                        'correct_answer': 'to speak',
                        'explanation': 'Sprechen means \"to speak\" in German.'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'Conjugate "sprechen" for "ich" (I)',
                        'correct_answer': 'spreche',
                        'hint': 'Add -e ending',
                        'explanation': 'Ich spreche means \"I speak\".'
                    }
                ]
            },
            {
                'title': 'Asking Questions',
                'description': 'Learn how to ask common questions',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['Was?', 'Wo?', 'Wann?', 'Wie?', 'Warum?', 'Wer?'],
                    'phrases': ['Wo ist die Toilette?', 'Wie viel kostet das?']
                },
                'xp_reward': 20,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What does "Wo?" mean?',
                        'options': ['Where?', 'When?', 'How?', 'Why?'],
                        'correct_answer': 'Where?',
                        'explanation': 'Wo? is used to ask \"where?\".'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'How do you ask "What?" in German?',
                        'correct_answer': 'Was?',
                        'hint': 'Starts with W',
                        'explanation': 'Was? means \"What?\" in German.'
                    }
                ]
            },
            {
                'title': 'Common Adjectives',
                'description': 'Descriptive words for people and things',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['groß', 'klein', 'gut', 'schlecht', 'schön', 'hässlich'],
                    'phrases': ['Das Haus ist groß', 'Der Hund ist klein']
                },
                'xp_reward': 20,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What does "groß" mean?',
                        'options': ['Big/Large', 'Small', 'Good', 'Bad'],
                        'correct_answer': 'Big/Large',
                        'explanation': 'Groß means big or large in German.'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'What is the opposite of "groß"?',
                        'correct_answer': 'klein',
                        'hint': 'Means \"small\"',
                        'explanation': 'Klein means small, the opposite of groß.'
                    }
                ]
            },
            {
                'title': 'Shopping Basics',
                'description': 'Vocabulary and phrases for shopping',
                'difficulty': 'hard',
                'content': {
                    'vocabulary': ['Geschäft', 'Preis', 'Geld', 'kaufen', 'verkaufen'],
                    'phrases': ['Wie viel kostet das?', 'Das ist sehr teuer', 'Ich möchte kaufen'],
                    'dialogues': ['Shopping conversation at a market']
                },
                'xp_reward': 30,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What does "Wie viel kostet das?" mean?',
                        'options': ['How much does this cost?', 'Where is the store?', 'I want to buy this', 'This is expensive'],
                        'correct_answer': 'How much does this cost?',
                        'explanation': 'This is used to ask the price of something.'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'Write the German word for "money"',
                        'correct_answer': 'Geld',
                        'hint': 'Starts with \"G\"',
                        'explanation': 'Geld means money in German.'
                    }
                ]
            }
        ],
        'zh': [
            {
                'title': 'Basic Greetings',
                'description': 'Learn how to say hello, goodbye, and introduce yourself in Chinese',
                'difficulty': 'easy',
                'content': {
                    'vocabulary': ['你好 (nǐ hǎo)', '再见 (zài jiàn)', '早上好 (zǎo shàng hǎo)', '你好吗? (nǐ hǎo ma?)', '我叫 (wǒ jiào)'],
                    'phrases': ['你好，你好吗?', '很高兴见到你', '你叫什么名字?']
                },
                'xp_reward': 10,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What does "你好 (nǐ hǎo)" mean?',
                        'options': ['Hello', 'Goodbye', 'Thank you', 'Please'],
                        'correct_answer': 'Hello',
                        'explanation': '你好 is the most common greeting in Chinese!'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'How do you say "goodbye" in Chinese?',
                        'correct_answer': '再见',
                        'hint': 'Pronounced \"zài jiàn\"',
                        'explanation': '再见 (zài jiàn) means goodbye in Chinese.'
                    }
                ]
            },
            {
                'title': 'Numbers 1-20',
                'description': 'Master counting from 1 to 20 in Chinese',
                'difficulty': 'easy',
                'content': {
                    'vocabulary': ['一 (yī)', '二 (èr)', '三 (sān)', '四 (sì)', '五 (wǔ)', '十 (shí)', '二十 (èr shí)'],
                    'exercises': ['Count to 10', 'Practice pronunciation and tones']
                },
                'xp_reward': 15,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What is "三 (sān)" in English?',
                        'options': ['Two', 'Three', 'Four', 'Five'],
                        'correct_answer': 'Three',
                        'explanation': '三 (sān) means three in Chinese.'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'Write the Chinese character for "five"',
                        'correct_answer': '五',
                        'hint': 'Pronounced \"wǔ\"',
                        'explanation': '五 (wǔ) is the Chinese word for five.'
                    }
                ]
            },
            {
                'title': 'Colors',
                'description': 'Learn the names of common colors in Chinese',
                'difficulty': 'easy',
                'content': {
                    'vocabulary': ['红色 (hóng sè)', '蓝色 (lán sè)', '绿色 (lǜ sè)', '黄色 (huáng sè)', '黑色 (hēi sè)', '白色 (bái sè)'],
                    'phrases': ['天空是蓝色的', '苹果是红色的']
                },
                'xp_reward': 10,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What color is "红色 (hóng sè)"?',
                        'options': ['Red', 'Blue', 'Green', 'Yellow'],
                        'correct_answer': 'Red',
                        'explanation': '红色 means red in Chinese.'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'Write the Chinese word for "blue"',
                        'correct_answer': '蓝色',
                        'hint': 'Pronounced \"lán sè\"',
                        'explanation': '蓝色 (lán sè) is blue in Chinese.'
                    }
                ]
            },
            {
                'title': 'Family Members',
                'description': 'Vocabulary for talking about your family',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['妈妈 (mā ma)', '爸爸 (bà ba)', '哥哥/弟弟 (gē ge/dì di)', '姐姐/妹妹 (jiě jie/mèi mei)', '奶奶 (nǎi nai)', '爷爷 (yé ye)'],
                    'phrases': ['这是我的家人', '我有两个哥哥']
                },
                'xp_reward': 20,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What does "妈妈 (mā ma)" mean?',
                        'options': ['Mother', 'Father', 'Sister', 'Brother'],
                        'correct_answer': 'Mother',
                        'explanation': '妈妈 means mother in Chinese.'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'Write the Chinese word for "father"',
                        'correct_answer': '爸爸',
                        'hint': 'Pronounced \"bà ba\"',
                        'explanation': '爸爸 (bà ba) means father in Chinese.'
                    }
                ]
            },
            {
                'title': 'Days of the Week',
                'description': 'Learn all seven days of the week',
                'difficulty': 'easy',
                'content': {
                    'vocabulary': ['星期一 (xīng qī yī)', '星期二 (xīng qī èr)', '星期三 (xīng qī sān)', '星期四 (xīng qī sì)', '星期五 (xīng qī wǔ)', '星期六 (xīng qī liù)', '星期日 (xīng qī rì)'],
                    'phrases': ['今天是星期一', '今天星期几?']
                },
                'xp_reward': 15,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What day is "星期一"?',
                        'options': ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
                        'correct_answer': 'Monday',
                        'explanation': '星期一 (xīng qī yī) is Monday in Chinese.'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'Write the Chinese word for "Friday"',
                        'correct_answer': '星期五',
                        'hint': 'Uses \"五\" (five)',
                        'explanation': '星期五 (xīng qī wǔ) is Friday in Chinese.'
                    }
                ]
            },
            {
                'title': 'Food and Drinks',
                'description': 'Essential vocabulary for ordering food',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['水 (shuǐ)', '面包 (miàn bāo)', '牛奶 (niú nǎi)', '肉 (ròu)', '水果 (shuǐ guǒ)', '蔬菜 (shū cài)'],
                    'phrases': ['我要水，谢谢', '食物很好吃']
                },
                'xp_reward': 20,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What is "水 (shuǐ)"?',
                        'options': ['Water', 'Bread', 'Milk', 'Meat'],
                        'correct_answer': 'Water',
                        'explanation': '水 means water in Chinese.'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'How do you say "bread" in Chinese?',
                        'correct_answer': '面包',
                        'hint': 'Pronounced \"miàn bāo\"',
                        'explanation': '面包 is bread in Chinese.'
                    }
                ]
            },
            {
                'title': 'Basic Verbs',
                'description': 'Introduction to common Chinese verbs',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['说 (shuō)', '吃 (chī)', '住 (zhù)', '工作 (gōng zuò)', '学习 (xué xí)'],
                    'grammar': ['我说', '你说', '他/她说'],
                    'phrases': ['我说中文', '她吃水果']
                },
                'xp_reward': 25,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What does "说 (shuō)" mean?',
                        'options': ['to speak', 'to eat', 'to live', 'to work'],
                        'correct_answer': 'to speak',
                        'explanation': '说 means \"to speak\" in Chinese.'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'Write the Chinese word for "to eat"',
                        'correct_answer': '吃',
                        'hint': 'Pronounced \"chī\"',
                        'explanation': '吃 (chī) means \"to eat\".'
                    }
                ]
            },
            {
                'title': 'Asking Questions',
                'description': 'Learn how to ask common questions',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['什么? (shén me?)', '哪里? (nǎ lǐ?)', '什么时候? (shén me shí hou?)', '怎么? (zěn me?)', '为什么? (wèi shén me?)', '谁? (shéi?)'],
                    'phrases': ['厕所在哪里?', '多少钱?']
                },
                'xp_reward': 20,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What does "哪里?" mean?',
                        'options': ['Where?', 'When?', 'How?', 'Why?'],
                        'correct_answer': 'Where?',
                        'explanation': '哪里? (nǎ lǐ?) is used to ask \"where?\".'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'How do you ask "What?" in Chinese?',
                        'correct_answer': '什么?',
                        'hint': 'Pronounced \"shén me?\"',
                        'explanation': '什么? means \"What?\" in Chinese.'
                    }
                ]
            },
            {
                'title': 'Common Adjectives',
                'description': 'Descriptive words for people and things',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['大 (dà)', '小 (xiǎo)', '好 (hǎo)', '坏 (huài)', '漂亮 (piào liang)', '丑 (chǒu)'],
                    'phrases': ['房子很大', '狗很小']
                },
                'xp_reward': 20,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What does "大 (dà)" mean?',
                        'options': ['Big/Large', 'Small', 'Good', 'Bad'],
                        'correct_answer': 'Big/Large',
                        'explanation': '大 means big or large in Chinese.'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'What is the opposite of "大"?',
                        'correct_answer': '小',
                        'hint': 'Means \"small\", pronounced \"xiǎo\"',
                        'explanation': '小 (xiǎo) means small, the opposite of 大.'
                    }
                ]
            },
            {
                'title': 'Shopping Basics',
                'description': 'Vocabulary and phrases for shopping',
                'difficulty': 'hard',
                'content': {
                    'vocabulary': ['商店 (shāng diàn)', '价格 (jià gé)', '钱 (qián)', '买 (mǎi)', '卖 (mài)'],
                    'phrases': ['这个多少钱?', '太贵了', '我想买'],
                    'dialogues': ['Shopping conversation at a market']
                },
                'xp_reward': 30,
                'activities': [
                    {
                        'type': 'multiple_choice',
                        'order': 1,
                        'question': 'What does "这个多少钱?" mean?',
                        'options': ['How much does this cost?', 'Where is the store?', 'I want to buy this', 'This is expensive'],
                        'correct_answer': 'How much does this cost?',
                        'explanation': 'This is used to ask the price of something.'
                    },
                    {
                        'type': 'written',
                        'order': 2,
                        'question': 'Write the Chinese word for "money"',
                        'correct_answer': '钱',
                        'hint': 'Pronounced \"qián\"',
                        'explanation': '钱 means money in Chinese.'
                    }
                ]
            }
        ]
    }
    
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
        ('de', 'German'),
        ('zh', 'Chinese')
    ]
    
    for lang_code, lang_name in languages:
        print(f"\nCreating lessons for {lang_name}...")
        create_lessons_for_language(lang_code, lang_name)
    
    print("\n✓ All lessons created successfully!")

if __name__ == "__main__":
    main()
