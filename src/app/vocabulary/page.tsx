'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

interface VocabularyWord {
  id: string;
  word: string;
  language_code: string;
  learned_at: string;
  times_reviewed: number;
}

interface UserProfile {
  id: string;
  learning_language: string | null;
}

export default function VocabularyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadVocabulary();
  }, []);

  async function loadVocabulary() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile?.learning_language) {
        router.push('/dashboard');
        return;
      }

      setUserProfile(profile);

      // Fetch vocabulary
      const { data: vocabData, error: vocabError } = await supabase
        .from('user_vocabulary')
        .select('*')
        .eq('user_id', user.id)
        .eq('language_code', profile.learning_language)
        .order('learned_at', { ascending: false });

      if (vocabError) {
        console.error('Error fetching vocabulary:', vocabError);
      } else {
        setVocabulary(vocabData || []);
      }
    } catch (error) {
      console.error('Error loading vocabulary:', error);
    } finally {
      setLoading(false);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vocabulary...</p>
        </div>
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

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-6 mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-indigo-600 hover:text-indigo-700 mb-4 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📚 My Vocabulary
          </h1>
          <p className="text-gray-600">
            You've learned {vocabulary.length} word{vocabulary.length !== 1 ? 's' : ''}!
          </p>
        </div>

        {/* Vocabulary Grid */}
        {vocabulary.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="text-6xl mb-4">📖</div>
            <p className="text-xl text-gray-600 mb-2">
              No vocabulary yet!
            </p>
            <p className="text-gray-500 mb-6">
              Complete lessons to start building your vocabulary.
            </p>
            <button
              onClick={() => router.push('/lessons')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Start Learning
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {vocabulary.map((word) => (
              <div
                key={word.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-800 mb-2">
                    {word.word}
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>
                      Learned: {new Date(word.learned_at).toLocaleDateString()}
                    </p>
                    {word.times_reviewed > 1 && (
                      <p className="text-indigo-600">
                        Reviewed {word.times_reviewed} times
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
