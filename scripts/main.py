import os
from supabase import create_client, Client
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Initialize Supabase client
url: str = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
key: str = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

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
                'xp_reward': 10
            },
            {
                'title': 'Numbers 1-20',
                'description': 'Master counting from 1 to 20 in Spanish',
                'difficulty': 'easy',
                'content': {
                    'vocabulary': ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'diez', 'veinte'],
                    'exercises': ['Count to 10', 'Practice pronunciation']
                },
                'xp_reward': 15
            },
            {
                'title': 'Colors',
                'description': 'Learn the names of common colors in Spanish',
                'difficulty': 'easy',
                'content': {
                    'vocabulary': ['rojo', 'azul', 'verde', 'amarillo', 'negro', 'blanco'],
                    'phrases': ['El cielo es azul', 'La manzana es roja']
                },
                'xp_reward': 10
            },
            {
                'title': 'Family Members',
                'description': 'Vocabulary for talking about your family',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['madre', 'padre', 'hermano', 'hermana', 'abuela', 'abuelo'],
                    'phrases': ['Esta es mi familia', 'Tengo dos hermanos']
                },
                'xp_reward': 20
            },
            {
                'title': 'Days of the Week',
                'description': 'Learn all seven days of the week',
                'difficulty': 'easy',
                'content': {
                    'vocabulary': ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'],
                    'phrases': ['Hoy es lunes', '¿Qué día es hoy?']
                },
                'xp_reward': 15
            },
            {
                'title': 'Food and Drinks',
                'description': 'Essential vocabulary for ordering food',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['agua', 'pan', 'leche', 'carne', 'frutas', 'verduras'],
                    'phrases': ['Quiero agua, por favor', 'La comida está deliciosa']
                },
                'xp_reward': 20
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
                'xp_reward': 25
            },
            {
                'title': 'Asking Questions',
                'description': 'Learn how to ask common questions',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['¿Qué?', '¿Dónde?', '¿Cuándo?', '¿Cómo?', '¿Por qué?', '¿Quién?'],
                    'phrases': ['¿Dónde está el baño?', '¿Cuánto cuesta?']
                },
                'xp_reward': 20
            },
            {
                'title': 'Common Adjectives',
                'description': 'Descriptive words for people and things',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['grande', 'pequeño', 'bueno', 'malo', 'bonito', 'feo'],
                    'phrases': ['La casa es grande', 'El perro es pequeño']
                },
                'xp_reward': 20
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
                'xp_reward': 30
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
                'xp_reward': 10
            },
            {
                'title': 'Numbers 1-20',
                'description': 'Master counting from 1 to 20 in German',
                'difficulty': 'easy',
                'content': {
                    'vocabulary': ['eins', 'zwei', 'drei', 'vier', 'fünf', 'zehn', 'zwanzig'],
                    'exercises': ['Count to 10', 'Practice pronunciation']
                },
                'xp_reward': 15
            },
            {
                'title': 'Colors',
                'description': 'Learn the names of common colors in German',
                'difficulty': 'easy',
                'content': {
                    'vocabulary': ['rot', 'blau', 'grün', 'gelb', 'schwarz', 'weiß'],
                    'phrases': ['Der Himmel ist blau', 'Der Apfel ist rot']
                },
                'xp_reward': 10
            },
            {
                'title': 'Family Members',
                'description': 'Vocabulary for talking about your family',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['Mutter', 'Vater', 'Bruder', 'Schwester', 'Großmutter', 'Großvater'],
                    'phrases': ['Das ist meine Familie', 'Ich habe zwei Brüder']
                },
                'xp_reward': 20
            },
            {
                'title': 'Days of the Week',
                'description': 'Learn all seven days of the week',
                'difficulty': 'easy',
                'content': {
                    'vocabulary': ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
                    'phrases': ['Heute ist Montag', 'Welcher Tag ist heute?']
                },
                'xp_reward': 15
            },
            {
                'title': 'Food and Drinks',
                'description': 'Essential vocabulary for ordering food',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['Wasser', 'Brot', 'Milch', 'Fleisch', 'Obst', 'Gemüse'],
                    'phrases': ['Ich möchte Wasser, bitte', 'Das Essen ist lecker']
                },
                'xp_reward': 20
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
                'xp_reward': 25
            },
            {
                'title': 'Asking Questions',
                'description': 'Learn how to ask common questions',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['Was?', 'Wo?', 'Wann?', 'Wie?', 'Warum?', 'Wer?'],
                    'phrases': ['Wo ist die Toilette?', 'Wie viel kostet das?']
                },
                'xp_reward': 20
            },
            {
                'title': 'Common Adjectives',
                'description': 'Descriptive words for people and things',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['groß', 'klein', 'gut', 'schlecht', 'schön', 'hässlich'],
                    'phrases': ['Das Haus ist groß', 'Der Hund ist klein']
                },
                'xp_reward': 20
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
                'xp_reward': 30
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
                'xp_reward': 10
            },
            {
                'title': 'Numbers 1-20',
                'description': 'Master counting from 1 to 20 in Chinese',
                'difficulty': 'easy',
                'content': {
                    'vocabulary': ['一 (yī)', '二 (èr)', '三 (sān)', '四 (sì)', '五 (wǔ)', '十 (shí)', '二十 (èr shí)'],
                    'exercises': ['Count to 10', 'Practice pronunciation and tones']
                },
                'xp_reward': 15
            },
            {
                'title': 'Colors',
                'description': 'Learn the names of common colors in Chinese',
                'difficulty': 'easy',
                'content': {
                    'vocabulary': ['红色 (hóng sè)', '蓝色 (lán sè)', '绿色 (lǜ sè)', '黄色 (huáng sè)', '黑色 (hēi sè)', '白色 (bái sè)'],
                    'phrases': ['天空是蓝色的', '苹果是红色的']
                },
                'xp_reward': 10
            },
            {
                'title': 'Family Members',
                'description': 'Vocabulary for talking about your family',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['妈妈 (mā ma)', '爸爸 (bà ba)', '哥哥/弟弟 (gē ge/dì di)', '姐姐/妹妹 (jiě jie/mèi mei)', '奶奶 (nǎi nai)', '爷爷 (yé ye)'],
                    'phrases': ['这是我的家人', '我有两个哥哥']
                },
                'xp_reward': 20
            },
            {
                'title': 'Days of the Week',
                'description': 'Learn all seven days of the week',
                'difficulty': 'easy',
                'content': {
                    'vocabulary': ['星期一 (xīng qī yī)', '星期二 (xīng qī èr)', '星期三 (xīng qī sān)', '星期四 (xīng qī sì)', '星期五 (xīng qī wǔ)', '星期六 (xīng qī liù)', '星期日 (xīng qī rì)'],
                    'phrases': ['今天是星期一', '今天星期几?']
                },
                'xp_reward': 15
            },
            {
                'title': 'Food and Drinks',
                'description': 'Essential vocabulary for ordering food',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['水 (shuǐ)', '面包 (miàn bāo)', '牛奶 (niú nǎi)', '肉 (ròu)', '水果 (shuǐ guǒ)', '蔬菜 (shū cài)'],
                    'phrases': ['我要水，谢谢', '食物很好吃']
                },
                'xp_reward': 20
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
                'xp_reward': 25
            },
            {
                'title': 'Asking Questions',
                'description': 'Learn how to ask common questions',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['什么? (shén me?)', '哪里? (nǎ lǐ?)', '什么时候? (shén me shí hou?)', '怎么? (zěn me?)', '为什么? (wèi shén me?)', '谁? (shéi?)'],
                    'phrases': ['厕所在哪里?', '多少钱?']
                },
                'xp_reward': 20
            },
            {
                'title': 'Common Adjectives',
                'description': 'Descriptive words for people and things',
                'difficulty': 'medium',
                'content': {
                    'vocabulary': ['大 (dà)', '小 (xiǎo)', '好 (hǎo)', '坏 (huài)', '漂亮 (piào liang)', '丑 (chǒu)'],
                    'phrases': ['房子很大', '狗很小']
                },
                'xp_reward': 20
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
                'xp_reward': 30
            }
        ]
    }
    
    lessons = lessons_data[language_code]
    
    for i, lesson_data in enumerate(lessons, start=1):
        lesson = {
            'course_id': course_id,
            'lesson_number': i,
            'title': lesson_data['title'],
            'description': lesson_data['description'],
            'difficulty': lesson_data['difficulty'],
            'xp_reward': lesson_data['xp_reward'],
            'content': json.dumps(lesson_data['content']),
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
