'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
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

export default function ReadingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [readingTexts, setReadingTexts] = useState<ReadingText[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (userProfile?.learning_language) {
      fetchReadingTexts();
    }
  }, [userProfile, selectedDifficulty]);

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

      if (!profile.learning_language) {
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

  async function fetchReadingTexts() {
    if (!userProfile?.learning_language) return;

    try {
      let query = supabase
        .from('reading_texts')
        .select('*')
        .eq('language_code', userProfile.learning_language)
        .eq('is_published', true)
        .order('difficulty', { ascending: true })
        .order('created_at', { ascending: false });

      if (selectedDifficulty !== 'all') {
        query = query.eq('difficulty', selectedDifficulty);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReadingTexts(data || []);
    } catch (error) {
      console.error('Error fetching reading texts:', error);
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

  function getCategoryIcon(category: string | null) {
    switch (category) {
      case 'story':
        return '📖';
      case 'article':
        return '📰';
      case 'news':
        return '📡';
      case 'conversation':
        return '💬';
      default:
        return '📄';
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
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
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent animate-gradient-flow-slow">
            Reading Practice
          </h1>
          <p className="text-xl text-gray-700">
            Read stories and articles, click on words to see translations
          </p>
        </div>

        {/* Difficulty Filter */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedDifficulty('all')}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
              selectedDifficulty === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-purple-800 text-white shadow-lg'
                : 'bg-white/80 text-gray-700 border border-gray-200 hover:shadow-md'
            }`}
          >
            All Levels
          </button>
          <button
            onClick={() => setSelectedDifficulty('beginner')}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
              selectedDifficulty === 'beginner'
                ? 'bg-gradient-to-r from-green-500 to-green-700 text-white shadow-lg'
                : 'bg-white/80 text-gray-700 border border-gray-200 hover:shadow-md'
            }`}
          >
            Beginner
          </button>
          <button
            onClick={() => setSelectedDifficulty('intermediate')}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
              selectedDifficulty === 'intermediate'
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-700 text-white shadow-lg'
                : 'bg-white/80 text-gray-700 border border-gray-200 hover:shadow-md'
            }`}
          >
            Intermediate
          </button>
          <button
            onClick={() => setSelectedDifficulty('advanced')}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
              selectedDifficulty === 'advanced'
                ? 'bg-gradient-to-r from-red-500 to-red-700 text-white shadow-lg'
                : 'bg-white/80 text-gray-700 border border-gray-200 hover:shadow-md'
            }`}
          >
            Advanced
          </button>
        </div>

        {/* Reading Texts List */}
        {readingTexts.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-gray-700 text-lg">
              No reading texts available yet for this difficulty level.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {readingTexts.map((text) => (
              <button
                key={text.id}
                onClick={() => router.push(`/reading/${text.id}`)}
                className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100 p-6 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 text-left group"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{getCategoryIcon(text.category)}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(text.difficulty)}`}>
                    {text.difficulty}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                  {text.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {text.content.substring(0, 100)}...
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  {text.word_count && (
                    <span className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <span>{text.word_count} words</span>
                    </span>
                  )}
                  {text.category && (
                    <span className="capitalize">{text.category}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
