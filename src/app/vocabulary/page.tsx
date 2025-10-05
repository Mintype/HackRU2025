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
  const [flashcardMode, setFlashcardMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [translation, setTranslation] = useState<string>('');
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
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

  async function fetchTranslation(word: string, sourceLang: string) {
    setLoadingTranslation(true);
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word,
          sourceLang,
          targetLang: 'en',
        }),
      });

      const data = await response.json();
      setTranslation(data.translation || 'Translation unavailable');
    } catch (error) {
      console.error('Error fetching translation:', error);
      setTranslation('Translation unavailable');
    } finally {
      setLoadingTranslation(false);
    }
  }

  function startFlashcards() {
    if (vocabulary.length === 0) return;
    setFlashcardMode(true);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowCelebration(false);
    fetchTranslation(vocabulary[0].word, vocabulary[0].language_code);
  }

  function exitFlashcards() {
    setFlashcardMode(false);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setTranslation('');
    setShowCelebration(false);
  }

  function nextCard() {
    if (currentCardIndex < vocabulary.length - 1) {
      const nextIndex = currentCardIndex + 1;
      setCurrentCardIndex(nextIndex);
      setIsFlipped(false);
      fetchTranslation(vocabulary[nextIndex].word, vocabulary[nextIndex].language_code);
    }
  }

  function previousCard() {
    if (currentCardIndex > 0) {
      const prevIndex = currentCardIndex - 1;
      setCurrentCardIndex(prevIndex);
      setIsFlipped(false);
      fetchTranslation(vocabulary[prevIndex].word, vocabulary[prevIndex].language_code);
    }
  }

  function flipCard() {
    setIsFlipped(!isFlipped);
  }

  async function markAsReviewed() {
    const currentWord = vocabulary[currentCardIndex];
    try {
      await supabase
        .from('user_vocabulary')
        .update({ times_reviewed: currentWord.times_reviewed + 1 })
        .eq('id', currentWord.id);

      // Update local state
      const updatedVocab = [...vocabulary];
      updatedVocab[currentCardIndex].times_reviewed += 1;
      setVocabulary(updatedVocab);

      // Check if this was the last card
      if (currentCardIndex === vocabulary.length - 1) {
        setShowCelebration(true);
      }
    } catch (error) {
      console.error('Error marking as reviewed:', error);
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

  // Flashcard Mode View
  if (flashcardMode && vocabulary.length > 0) {
    const currentWord = vocabulary[currentCardIndex];
    
    // Celebration Screen
    if (showCelebration) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full text-center">
            {/* Celebration Animation */}
            <div className="mb-8 animate-bounce">
              <div className="text-9xl mb-4">🎉</div>
              <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-4 animate-gradient-flow">
                Hurray!!
              </h1>
              <p className="text-3xl font-semibold text-gray-700 mb-2">
                You did it! 🌟
              </p>
              <p className="text-xl text-gray-600">
                You&apos;ve reviewed all {vocabulary.length} words!
              </p>
            </div>

            {/* Confetti Effect */}
            <div className="flex justify-center gap-4 text-6xl mb-8 animate-pulse">
              <span>🎊</span>
              <span>⭐</span>
              <span>🎈</span>
              <span>✨</span>
              <span>🏆</span>
            </div>

            {/* Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border-4 border-purple-200 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Session Complete!</h2>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                  <div className="text-4xl font-bold text-indigo-600">{vocabulary.length}</div>
                  <div className="text-sm text-gray-600 mt-2">Words Reviewed</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
                  <div className="text-4xl font-bold text-purple-600">100%</div>
                  <div className="text-sm text-gray-600 mt-2">Completion</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setShowCelebration(false);
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                  fetchTranslation(vocabulary[0].word, vocabulary[0].language_code);
                }}
                className="bg-gradient-to-r from-indigo-600 to-purple-800 text-white px-8 py-4 rounded-2xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
              >
                🔄 Review Again
              </button>
              <button
                onClick={exitFlashcards}
                className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-4 rounded-2xl hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
              >
                📚 Back to Vocabulary
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Flashcard Mode 🎴
            </h1>
            <p className="text-gray-600">
              Card {currentCardIndex + 1} of {vocabulary.length}
            </p>
            <button
              onClick={exitFlashcards}
              className="mt-2 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Exit Flashcards
            </button>
          </div>

          {/* Flashcard */}
          <div className="perspective-1000">
            <div
              onClick={flipCard}
              className={`relative bg-white rounded-3xl shadow-2xl border-4 border-indigo-200 p-12 min-h-[400px] flex flex-col items-center justify-center cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {!isFlipped ? (
                // Front of card - Word
                <div className="text-center">
                  <div className="text-6xl font-bold text-gray-800 mb-4">
                    {currentWord.word}
                  </div>
                  <p className="text-xl text-gray-500 mb-6">
                    {currentWord.language_code.toUpperCase()}
                  </p>
                  <p className="text-sm text-indigo-600 animate-pulse">
                    Click to reveal translation
                  </p>
                </div>
              ) : (
                // Back of card - Translation
                <div
                  className="text-center"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <div className="text-2xl text-gray-600 mb-2">Translation:</div>
                  {loadingTranslation ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  ) : (
                    <div className="text-5xl font-bold text-indigo-600 mb-4">
                      {translation}
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-6">
                    Reviewed {currentWord.times_reviewed} time{currentWord.times_reviewed !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-indigo-600 mt-2 animate-pulse">
                    Click to flip back
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8 gap-4">
            <button
              onClick={previousCard}
              disabled={currentCardIndex === 0}
              className="flex-1 bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              ← Previous
            </button>
            
            <button
              onClick={() => {
                markAsReviewed();
                if (currentCardIndex < vocabulary.length - 1) {
                  nextCard();
                }
              }}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105"
            >
              ✓ Got it!
            </button>
            
            <button
              onClick={nextCard}
              disabled={currentCardIndex === vocabulary.length - 1}
              className="flex-1 bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              Next →
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-300"
                style={{
                  width: `${((currentCardIndex + 1) / vocabulary.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                📚 My Vocabulary
              </h1>
              <p className="text-gray-600">
                You&apos;ve learned {vocabulary.length} word{vocabulary.length !== 1 ? 's' : ''}!
              </p>
            </div>
            {vocabulary.length > 0 && (
              <button
                onClick={startFlashcards}
                className="bg-gradient-to-r from-indigo-600 to-purple-800 text-white px-8 py-4 rounded-2xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 font-semibold text-lg flex items-center gap-2"
              >
                🎴 Start Flashcards
              </button>
            )}
          </div>
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
