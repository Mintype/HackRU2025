'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

interface Lesson {
  id: string;
  course_id: string;
  lesson_number: number;
  title: string;
  description: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  xp_reward: number;
  content: any;
  is_published: boolean;
}

interface Activity {
  type: 'multiple_choice' | 'written' | 'matching';
  order: number;
  question: string;
  options?: string[];
  correct_answer: string | any;
  hint?: string;
  explanation: string;
  pairs?: { spanish: string; english: string }[];
}

interface LessonProgress {
  id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score: number | null;
  attempts: number;
  completed_at: string | null;
}

interface UserProfile {
  id: string;
  learning_language: string | null;
}

interface LanguageCourse {
  id: string;
  language_code: string;
  language_name: string;
}

export default function LessonsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonProgress, setLessonProgress] = useState<{ [key: string]: LessonProgress }>({});
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<LanguageCourse | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    checkUserAndLoadLessons();
  }, []);

  async function checkUserAndLoadLessons() {
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

      // Fetch the course for user's learning language
      const { data: courseData, error: courseError } = await supabase
        .from('language_courses')
        .select('*')
        .eq('language_code', profile.learning_language)
        .single();

      if (courseError || !courseData) {
        console.error('Error fetching course:', courseError);
        setLoading(false);
        return;
      }

      setCourse(courseData);

      // Fetch lessons for the course
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseData.id)
        .eq('is_published', true)
        .order('lesson_number', { ascending: true });



      if (lessonsError) {
        console.error('Error fetching lessons:', lessonsError);
      } else {
        setLessons(lessonsData || []);

        // Fetch user's progress for these lessons
        if (lessonsData && lessonsData.length > 0) {
          const lessonIds = lessonsData.map(l => l.id);
          const { data: progressData, error: progressError } = await supabase
            .from('user_lesson_progress')
            .select('*')
            .eq('user_id', user.id)
            .in('lesson_id', lessonIds);

          if (!progressError && progressData) {
            const progressMap: { [key: string]: LessonProgress } = {};
            progressData.forEach(progress => {
              progressMap[progress.lesson_id] = progress;
            });
            setLessonProgress(progressMap);
          }
        }
      }
    } catch (error) {
      console.error('Error loading lessons:', error);
    } finally {
      setLoading(false);
    }
  }

  async function startLesson(lesson: Lesson) {
    if (!user) return;

    try {
      // Navigate to the individual lesson page
      router.push(`/lessons/${lesson.id}`);
    } catch (error) {
      console.error('Error starting lesson:', error);
    }
  }

  function getDifficultyColor(difficulty: string) {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  function getStatusColor(status: string | undefined) {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'not_started':
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  function getStatusText(status: string | undefined) {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'not_started':
      default:
        return 'Not Started';
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lessons...</p>
        </div>
      </div>
    );
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
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
            {course?.language_name} Lessons
          </h1>
          <p className="text-gray-600">
            Complete lessons to earn XP and improve your language skills!
          </p>
        </div>

        {/* Lessons Grid */}
        {lessons.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
            <p className="text-xl text-gray-600">
              No lessons available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => {
              const progress = lessonProgress[lesson.id];
              const status = progress?.status || 'not_started';
              
              return (
                <div
                  key={lesson.id}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
                >
                  <div className="p-6">
                    {/* Lesson Number Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-indigo-600">
                        #{lesson.lesson_number}
                      </span>
                      {status === 'completed' && (
                        <span className="text-2xl">✓</span>
                      )}
                    </div>

                    {/* Title and Description */}
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      {lesson.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {lesson.description || 'Practice and improve your skills'}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                        {lesson.difficulty}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {getStatusText(status)}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                        🏆 {lesson.xp_reward} XP
                      </span>
                    </div>

                    {/* Progress Info */}
                    {progress && (
                      <div className="mb-4 text-sm text-gray-600">
                        {progress.score !== null && (
                          <p>Score: {progress.score}%</p>
                        )}
                        {progress.attempts > 0 && (
                          <p>Attempts: {progress.attempts}</p>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => startLesson(lesson)}
                      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      {status === 'completed' ? 'Review' : status === 'in_progress' ? 'Continue' : 'Start Lesson'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
