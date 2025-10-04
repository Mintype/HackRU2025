'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import LanguageSelectionModal from '@/components/LanguageSelectionModal';

interface UserProfile {
  id: string;
  email: string;
  learning_language: string | null;
  native_language: string;
  xp_points: number;
  lessons_completed: number;
  words_learned: number;
  current_streak: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [savingLanguage, setSavingLanguage] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

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
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // Profile might not exist yet, show language modal
        setShowLanguageModal(true);
      } else {
        setUserProfile(profile);
        // Check if user has selected a language
        if (!profile.learning_language) {
          setShowLanguageModal(true);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  async function handleLanguageSelection(languageCode: string) {
    if (!user) return;
    
    setSavingLanguage(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          learning_language: languageCode,
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh profile
      await checkUser();
      setShowLanguageModal(false);
    } catch (error) {
      console.error('Error setting language:', error);
      alert('Failed to set language. Please try again.');
    } finally {
      setSavingLanguage(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
      {/* Language Selection Modal */}
      {showLanguageModal && (
        <LanguageSelectionModal 
          onSelect={handleLanguageSelection}
          loading={savingLanguage}
        />
      )}

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

      {/* Main Dashboard Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent animate-gradient-flow-slow">
            Welcome to Your Dashboard!
          </h1>
          <p className="text-xl text-gray-700">
            Start your language learning journey today
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100 p-6 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-700 text-sm font-medium">
                Lessons Completed
              </h3>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{userProfile?.lessons_completed || 0}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100 p-6 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-700 text-sm font-medium">
                Current Streak
              </h3>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{userProfile?.current_streak || 0} days</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100 p-6 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-700 text-sm font-medium">
                Words Learned
              </h3>
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-700 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{userProfile?.words_learned || 0}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100 p-6 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-700 text-sm font-medium">
                XP Points
              </h3>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{userProfile?.xp_points || 0}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <button onClick={() => router.push('/lessons')} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100 p-8 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 text-left group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Start a Lesson
            </h3>
            <p className="text-gray-700">
              Begin learning with interactive lessons
            </p>
          </button>

          <button onClick={() => router.push('/chat')} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100 p-8 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 text-left group">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Practice Conversation
            </h3>
            <p className="text-gray-700">
              Chat with AI to practice speaking
            </p>
          </button>

          <button className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100 p-8 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 text-left group">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Quick Translation
            </h3>
            <p className="text-gray-700">
              Translate words and phrases instantly
            </p>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Recent Activity
          </h2>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-700 text-lg">
              No activity yet. Start learning to see your progress here!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
