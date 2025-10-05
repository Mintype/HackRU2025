'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { User } from '@supabase/supabase-js';

interface ReadingText {
  id: string;
  language_code: string;
  title: string;
  content: string;
  difficulty: string;
  word_count: number | null;
  category: string | null;
  source: string | null;
}

interface UserProfile {
  id: string;
  learning_language: string | null;
}

interface WordTranslation {
  word: string;
  translation: string;
}

export default function ReadingTextPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [readingText, setReadingText] = useState<ReadingText | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [translation, setTranslation] = useState<string | null>(null);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [wordPosition, setWordPosition] = useState<{ x: number; y: number } | null>(null);
  const [showInstruction, setShowInstruction] = useState(true);
  const router = useRouter();
  const params = useParams();
  const textId = params.id as string;

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (userProfile && textId) {
      fetchReadingText();
    }
  }, [userProfile, textId]);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUser(user);
      
      // Fetch user profile
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('id, learning_language')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        router.push('/dashboard');
        return;
      }

      setUserProfile(profile);
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  async function fetchReadingText() {
    try {
      const { data, error } = await supabase
        .from('reading_texts')
        .select('*')
        .eq('id', textId)
        .single();

      if (error) throw error;
      if (!data) {
        router.push('/reading');
        return;
      }

      setReadingText(data);

      // Update user progress
      await updateReadingProgress();
    } catch (error) {
      console.error('Error fetching reading text:', error);
      router.push('/reading');
    }
  }

  async function updateReadingProgress() {
    if (!user || !textId) return;

    try {
      await supabase
        .from('user_reading_progress')
        .upsert({
          user_id: user.id,
          text_id: textId,
          last_read_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,text_id'
        });
    } catch (error) {
      console.error('Error updating reading progress:', error);
    }
  }

  async function handleWordClick(word: string, index: number, event: React.MouseEvent) {
    // Clean the word (remove punctuation)
    const cleanWord = word.replace(/[。，、！？；：""''（）【】《》…—]/g, '').trim();
    
    if (!cleanWord) return;

    // Check if clicking on an already selected word
    if (selectedIndices.includes(index)) {
      // Deselect all
      setSelectedWord(null);
      setSelectedIndices([]);
      setTranslation(null);
      setWordPosition(null);
      return;
    }

    let newIndices: number[] = [];
    let newWord: string = '';

    // Check if the clicked word is adjacent to any selected word
    const isAdjacent = selectedIndices.length > 0 && 
      (selectedIndices.includes(index - 1) || selectedIndices.includes(index + 1));

    if (isAdjacent) {
      // Add to selection
      newIndices = [...selectedIndices, index].sort((a, b) => a - b);
      
      // Build the combined word from all selected characters
      const chars = readingText?.content.split('') || [];
      newWord = newIndices.map(i => chars[i]).join('').replace(/[。，、！？；：""''（）【】《》…—]/g, '').trim();
    } else {
      // Start new selection
      newIndices = [index];
      newWord = cleanWord;
    }

    setSelectedIndices(newIndices);
    setSelectedWord(newWord);

    // Calculate position (use the last clicked word's position)
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const container = document.querySelector('.reading-content-container');
    const containerRect = container?.getBoundingClientRect();
    
    if (containerRect) {
      setWordPosition({ 
        x: rect.left - containerRect.left + rect.width / 2, 
        y: rect.top - containerRect.top - 10
      });
    }

    setTranslationLoading(true);

    try {
      // Call translation API
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: newWord,
          sourceLang: readingText?.language_code,
          targetLang: 'en'
        })
      });

      if (!response.ok) throw new Error('Translation failed');

      const data = await response.json();
      setTranslation(data.translation);

      // Increment words looked up counter
      await incrementWordsLookedUp();
    } catch (error) {
      console.error('Error translating word:', error);
      setTranslation('Translation unavailable');
    } finally {
      setTranslationLoading(false);
    }
  }

  async function incrementWordsLookedUp() {
    if (!user || !textId) return;

    try {
      // First, try to get the current progress
      const { data: currentProgress } = await supabase
        .from('user_reading_progress')
        .select('words_looked_up')
        .eq('user_id', user.id)
        .eq('text_id', textId)
        .single();

      const currentCount = currentProgress?.words_looked_up || 0;

      await supabase
        .from('user_reading_progress')
        .upsert({
          user_id: user.id,
          text_id: textId,
          words_looked_up: currentCount + 1,
          last_read_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,text_id'
        });
    } catch (error) {
      console.error('Error incrementing words looked up:', error);
    }
  }

  function getDifficultyColor(difficulty: string) {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!readingText) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 backdrop-blur-sm bg-white/80 sticky top-0 z-50 rounded-b-2xl shadow-sm">
        <div>
          <div className="flex items-center justify-between">
            <button onClick={() => router.push('/')} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-800 bg-clip-text text-transparent animate-gradient-flow-fast">
                LLM
              </span>
            </button>
            <div className="flex items-center space-x-4">
              {userProfile?.learning_language && (
                <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full border border-purple-200">
                  <span className="text-lg">
                    {userProfile.learning_language === 'es' && '🇪🇸'}
                    {userProfile.learning_language === 'fr' && '🇫🇷'}
                    {userProfile.learning_language === 'de' && '🇩🇪'}
                    {userProfile.learning_language === 'ja' && '🇯🇵'}
                    {userProfile.learning_language === 'zh' && '🇨🇳'}
                    {userProfile.learning_language === 'ko' && '🇰🇷'}
                    {userProfile.learning_language === 'it' && '🇮🇹'}
                    {userProfile.learning_language === 'pt' && '🇵🇹'}
                    {userProfile.learning_language === 'ru' && '🇷🇺'}
                    {userProfile.learning_language === 'ar' && '🇸🇦'}
                    {userProfile.learning_language === 'hi' && '🇮🇳'}
                    {userProfile.learning_language === 'nl' && '🇳🇱'}
                  </span>
                  <span className="text-sm font-semibold text-gray-700 capitalize">
                    {userProfile.learning_language === 'es' && 'Spanish'}
                    {userProfile.learning_language === 'fr' && 'French'}
                    {userProfile.learning_language === 'de' && 'German'}
                    {userProfile.learning_language === 'ja' && 'Japanese'}
                    {userProfile.learning_language === 'zh' && 'Chinese'}
                    {userProfile.learning_language === 'ko' && 'Korean'}
                    {userProfile.learning_language === 'it' && 'Italian'}
                    {userProfile.learning_language === 'pt' && 'Portuguese'}
                    {userProfile.learning_language === 'ru' && 'Russian'}
                    {userProfile.learning_language === 'ar' && 'Arabic'}
                    {userProfile.learning_language === 'hi' && 'Hindi'}
                    {userProfile.learning_language === 'nl' && 'Dutch'}
                  </span>
                </div>
              )}
              <span className="text-gray-900 hidden md:block">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-blue-600 to-purple-800 text-white px-6 py-2 rounded-full hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 animate-gradient-flow"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => router.push('/reading')}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Reading List</span>
        </button>

        {/* Reading Text Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex-1">
                {readingText.title}
              </h1>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getDifficultyColor(readingText.difficulty)} ml-4`}>
                {readingText.difficulty}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {readingText.word_count && (
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <span>{readingText.word_count} words</span>
                </span>
              )}
              {readingText.category && (
                <span className="capitalize">• {readingText.category}</span>
              )}
            </div>
          </div>

          {/* Instruction */}
          {showInstruction && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl relative">
              <button
                onClick={() => setShowInstruction(false)}
                className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-blue-600 transition-colors shadow-md"
              >
                ×
              </button>
              <p className="text-sm text-blue-800 flex items-start">
                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Click on any word to see its translation. Click adjacent words to build phrases.</span>
              </p>
            </div>
          )}

          {/* Reading Content */}
          <div className="relative reading-content-container">
            <div className="text-lg md:text-xl leading-relaxed text-gray-800 space-y-4">
              {readingText.content.split('').map((char, index) => {
                // Check if it's a word character (not punctuation or space)
                const isWordChar = /[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ffa-zA-Z]/.test(char);
                
                if (isWordChar) {
                  const isSelected = selectedIndices.includes(index);
                  return (
                    <span
                      key={index}
                      onClick={(e) => handleWordClick(char, index, e)}
                      className={`cursor-pointer transition-all duration-150 rounded px-0.5 ${
                        isSelected 
                          ? 'bg-yellow-300 text-purple-900 ring-2 ring-yellow-400 font-semibold' 
                          : 'hover:bg-yellow-100 hover:text-purple-700'
                      }`}
                    >
                      {char}
                    </span>
                  );
                }
                return <span key={index}>{char}</span>;
              })}
            </div>

            {/* Translation Popup */}
            {selectedWord && wordPosition && (
              <div
                className="absolute z-50 transform -translate-x-1/2 -translate-y-full mb-2"
                style={{
                  left: `${wordPosition.x}px`,
                  top: `${wordPosition.y}px`,
                }}
              >
                <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-2xl max-w-xs">
                  <button
                    onClick={() => {
                      setSelectedWord(null);
                      setSelectedIndices([]);
                      setTranslation(null);
                      setWordPosition(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                  <div className="text-xs text-gray-400 mb-1">Translation</div>
                  <div className="font-bold text-lg mb-1">{selectedWord}</div>
                  {translationLoading ? (
                    <div className="text-sm text-gray-300">Loading...</div>
                  ) : (
                    <div className="text-sm text-gray-200">{translation}</div>
                  )}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                    <div className="border-8 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Source */}
          {readingText.source && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Source:</span> {readingText.source}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
