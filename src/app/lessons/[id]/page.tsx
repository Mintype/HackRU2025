'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { SourceTextModule } from 'vm';
import { set } from '@elevenlabs/elevenlabs-js/core/schemas';

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
  type: 'teaching' | 'multiple_choice' | 'written' | 'matching';
  order: number;
  question?: string;
  title?: string;
  content?: string;
  options?: string[];
  correct_answer?: string | any;
  hint?: string;
  explanation?: string;
  pairs?: { spanish: string; english: string }[];
}

interface UserProfile {
  id: string;
  learning_language: string | null;
}

export default function LessonPage() {
  const params = useParams();
  const lessonId = params.id as string;
  const router = useRouter();
  
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Activity states
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResult, setShowResult] = useState<{ [key: number]: boolean }>({});
  const [correctAnswers, setCorrectAnswers] = useState<{ [key: number]: boolean }>({});
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  async function loadLesson() {
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

      // Fetch lesson
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (lessonError || !lessonData) {
        console.error('Error fetching lesson:', lessonError);
        router.push('/lessons');
        return;
      }

      // Parse content if it's a string
      if (lessonData?.content && typeof lessonData.content === 'string') {
        try {
          lessonData.content = JSON.parse(lessonData.content);
          console.log('Parsed activities:', JSON.stringify(lessonData.content.activities, null, 2));
        } catch (e) {
          console.error('Failed to parse content:', e);
        }
      }

      // Print number of activities
      const activityCount = lessonData?.content?.activities?.length || 0;
      console.log(`📚 This lesson has ${activityCount} activity${activityCount !== 1 ? 'ies' : ''}`);

      setLesson(lessonData);

      // Mark lesson as in progress
      await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lessonId,
          status: 'in_progress',
          last_accessed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,lesson_id'
        });

    } catch (error) {
      console.error('Error loading lesson:', error);
    } finally {
      setLoading(false);
    }
  }

  async function completeLesson(score: number) {
    if (!user || !lesson || !userProfile) return;

    try {
      // Update lesson progress
      const { error } = await supabase
        .from('user_lesson_progress')
        .upsert({
          user_id: user.id,
          lesson_id: lesson.id,
          status: 'completed',
          score: score,
          completed_at: new Date().toISOString(),
          last_accessed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,lesson_id'
        });

      if (error) {
        console.error('Error completing lesson:', error);
        return;
      }

      console.log(`🎉 Lesson "${lesson.title}" completed with score: ${score}%`);

      // Add vocabulary words to user's learned words
      if (lesson.content?.vocabulary && Array.isArray(lesson.content.vocabulary)) {
        await addVocabularyToUserProfile(lesson.content.vocabulary);
      }

      // Show completion message and redirect
      // alert('Lesson completed!');
      router.push('/lessons');
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  }

  async function addVocabularyToUserProfile(vocabulary: string[]) {
    if (!user || !userProfile?.learning_language) return;

    try {
      // Prepare vocabulary entries
      const vocabularyEntries = vocabulary.map(word => ({
        user_id: user.id,
        word: word,
        language_code: userProfile.learning_language,
      }));

      // Insert vocabulary words (will ignore duplicates due to UNIQUE constraint)
      const { error } = await supabase
        .from('user_vocabulary')
        .upsert(vocabularyEntries, {
          onConflict: 'user_id,word,language_code',
          ignoreDuplicates: false, // This will increment times_reviewed for existing words
        });

      if (error) {
        console.error('Error adding vocabulary:', error);
      } else {
        console.log(`📚 Added ${vocabulary.length} words to vocabulary`);
      }
    } catch (error) {
      console.error('Error in addVocabularyToUserProfile:', error);
    }
  }

  function checkIfLessonCompleted(p0: number) {
    console.log('Checking if lesson is completed...');

    let activityCount = lesson?.content?.activities?.length || 0;
    const answeredCount = Object.keys(correctAnswers).length;
    console.log(`Answered ${p0} out of ${activityCount} activities.`);

    if (p0 > 0 && p0 >= activityCount) {
      // All activities answered - calculate score
      const totalActivities = Object.keys(correctAnswers).length;
      const correctCount = Object.values(correctAnswers).filter(Boolean).length;
      const score = totalActivities > 0 ? Math.round((correctCount / totalActivities) * 100) : 0;
      console.log('All activities answered. Completing lesson with score:', score);

      // // Display beautiful completion screen
      // const pageDiv = document.getElementById('page');
      // if (pageDiv) {
      //   pageDiv.innerHTML = `
      //     <div class="text-center py-12 space-y-6 animate-fade-in">
      //       <div class="text-8xl mb-4 animate-bounce">🎉</div>
      //       <h2 class="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
      //         Lesson Completed!
      //       </h2>
      //       <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 mx-auto max-w-md border-2 border-indigo-200 shadow-lg">
      //         <p class="text-7xl font-bold text-indigo-600 mb-2">${score}%</p>
      //         <p class="text-gray-600 text-lg">Your Score</p>
      //       </div>
      //       <div class="flex items-center justify-center gap-2 text-gray-500">
      //         <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
      //         <p>Redirecting you back to lessons...</p>
      //       </div>
      //     </div>
      //   `;
      // }

      setTimeout(() => {

      // Display beautiful completion screen
      const pageDiv = document.getElementById('page');
      if (pageDiv) {
        pageDiv.innerHTML = `
          <div class="text-center py-12 space-y-6 animate-fade-in">
            <div class="text-8xl mb-4 animate-bounce">🎉</div>
            <h2 class="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Lesson Completed!
            </h2>
            <div class="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 mx-auto max-w-md border-2 border-indigo-200 shadow-lg">
              <p class="text-7xl font-bold text-indigo-600 mb-2">${score}%</p>
              <p class="text-gray-600 text-lg">Your Score</p>
            </div>
            <div class="flex items-center justify-center gap-2 text-gray-500">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
              <p>Redirecting you back to lessons...</p>
            </div>
          </div>
        `;
      }
      }, 2000);

      setTimeout(() => {
        completeLesson(score);
      }, 3000); // Wait 5 seconds to show completion screen
    }

  }

  function handleMultipleChoice(activityIndex: number, answer: string, correctAnswer: string) {
    const isCorrect = answer === correctAnswer;
    setUserAnswers({ ...userAnswers, [activityIndex]: answer });
    setShowResult({ ...showResult, [activityIndex]: true });
    setCorrectAnswers({ ...correctAnswers, [activityIndex]: isCorrect });
    console.log(`Activity ${activityIndex + 1} completed! Answer: ${isCorrect ? '✓ Correct' : '✗ Incorrect'}`);

    checkIfLessonCompleted(activityIndex + 1);
  }

  function handleWrittenAnswer(activityIndex: number, userAnswer: string, correctAnswer: string) {
    const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    const newCorrectAnswers = { ...correctAnswers, [activityIndex]: isCorrect };
    
    setShowResult({ ...showResult, [activityIndex]: true });
    setCorrectAnswers(newCorrectAnswers);
    console.log(`Activity ${activityIndex + 1} completed! Answer: ${isCorrect ? '✓ Correct' : '✗ Incorrect'}`);

    
    checkIfLessonCompleted(activityIndex + 1);

    // const activityCount = lesson?.content?.activities?.length || 0;

    // if(activityIndex + 1 >= activityCount) {
    //   // All activities completed - calculate score with the updated answers
    //   const totalActivities = Object.keys(newCorrectAnswers).length;
    //   const correctCount = Object.values(newCorrectAnswers).filter(Boolean).length;
    //   const score = totalActivities > 0 ? Math.round((correctCount / totalActivities) * 100) : 0;
      
    //   setTimeout(() => {
    //     completeLesson(score);
    //   }, 2000); // Wait 2 seconds to show completion screen
    // }

  }

  function handleNextActivity() {
    const nextIndex = currentActivityIndex + 1;
    setCurrentActivityIndex(nextIndex);
    setWrittenAnswer('');
    setShowHint(false);
    
    // Check if this was the last activity
    if (lesson && nextIndex >= lesson.content.activities.length) {
      // Complete the lesson and redirect - calculate final score
      const totalActivities = Object.keys(correctAnswers).length;
      const correctCount = Object.values(correctAnswers).filter(Boolean).length;
      const score = totalActivities > 0 ? Math.round((correctCount / totalActivities) * 100) : 0;
      
      setTimeout(() => {
        completeLesson(score);
      }, 2000); // Wait 2 seconds to show completion screen
    }
  }

  function calculateScore() {
    const totalActivities = Object.keys(correctAnswers).length;
    const correctCount = Object.values(correctAnswers).filter(Boolean).length;
    return totalActivities > 0 ? Math.round((correctCount / totalActivities) * 100) : 0;
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
          <p className="mt-4 text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Lesson not found</p>
          <button
            onClick={() => router.push('/lessons')}
            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Back to Lessons
          </button>
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

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-6 mb-6">
          <button
            onClick={() => router.push('/lessons')}
            className="text-indigo-600 hover:text-indigo-700 mb-4 flex items-center"
          >
            ← Back to Lessons
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {lesson.title}
          </h1>
          <p className="text-gray-600 mb-4">{lesson.description}</p>
          <div className="flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(lesson.difficulty)}`}>
              {lesson.difficulty}
            </span>
            <span className="text-gray-600">
              🏆 {lesson.xp_reward} XP
            </span>
          </div>
        </div>

        {/* Lesson Content */}
        {currentActivityIndex >= (lesson.content?.activities?.length || 0) ? (
          /* Show completion message when all activities are done */
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-12 mb-6 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Lesson completed!</h2>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 mb-6">
              <p className="text-5xl font-bold text-indigo-600 mb-2">{calculateScore()}%</p>
              <p className="text-gray-600">Your Score</p>
            </div>
            <p className="text-gray-600 mb-6">Redirecting you back to lessons...</p>
          </div>
        ) : (
          /* Show lesson content when activities are in progress */
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-6 mb-6">
          {lesson.content?.activities && lesson.content.activities.length > 0 ? (
            <>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Activity {currentActivityIndex + 1} of {lesson.content.activities.length}</span>
                  <span>{Math.round(((currentActivityIndex) / lesson.content.activities.length) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentActivityIndex) / lesson.content.activities.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {currentActivityIndex < lesson.content.activities.length ? (
                (() => {
                  const activity: Activity = lesson.content.activities[currentActivityIndex];
                  const hasAnswered = showResult[currentActivityIndex];
                  const isCorrect = correctAnswers[currentActivityIndex];

                  return (
                    <div id='page' className="space-y-6">
                      {activity.type === 'teaching' ? (
                        <h2 className="text-2xl font-bold text-gray-800">{activity.title || 'Lesson Content'}</h2>
                      ) : (
                        <h2 className="text-2xl font-bold text-gray-800">{activity.question}</h2>
                      )}

                      {/* Teaching Activity */}
                      {activity.type === 'teaching' && (
                        <div className="space-y-4">
                          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-6">
                            <div className="prose prose-lg max-w-none">
                              <div className="text-gray-800 whitespace-pre-line text-base leading-relaxed">
                                {activity.content}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setCorrectAnswers({ ...correctAnswers, [currentActivityIndex]: true });
                              console.log(`Activity ${currentActivityIndex + 1} completed! (Teaching activity)`);
                              handleNextActivity();
                            }}
                            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                          >
                            Continue →
                          </button>
                        </div>
                      )}

                      {/* Multiple Choice Activity */}
                      {activity.type === 'multiple_choice' && (
                        <div className="space-y-3">
                          {activity.options?.map((option, index) => {
                            const isSelected = userAnswers[currentActivityIndex] === option;
                            const isCorrectAnswer = option === activity.correct_answer;
                            
                            return (
                              <button
                                key={index}
                                onClick={() => !hasAnswered && handleMultipleChoice(currentActivityIndex, option, activity.correct_answer)}
                                disabled={hasAnswered}
                                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                                  hasAnswered
                                    ? isCorrectAnswer
                                      ? 'border-green-500 bg-green-50'
                                      : isSelected
                                      ? 'border-red-500 bg-red-50'
                                      : 'border-gray-200 bg-gray-50'
                                    : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer'
                                } ${hasAnswered ? 'cursor-not-allowed' : ''}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-black">{option}</span>
                                  {hasAnswered && isCorrectAnswer && <span className="text-green-600">✓</span>}
                                  {hasAnswered && isSelected && !isCorrectAnswer && <span className="text-red-600">✗</span>}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Written Activity */}
                      {activity.type === 'written' && (
                        <div className="space-y-4">
                          {activity.hint && (
                            <button
                              onClick={() => setShowHint(!showHint)}
                              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                            >
                              {showHint ? '🙈 Hide Hint' : '💡 Show Hint'}
                            </button>
                          )}
                          {showHint && activity.hint && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                              💡 {activity.hint}
                            </div>
                          )}
                          <input
                            type="text"
                            value={writtenAnswer}
                            onChange={(e) => setWrittenAnswer(e.target.value)}
                            disabled={hasAnswered}
                            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed text-black"
                            placeholder="Type your answer here..."
                          />
                          {!hasAnswered && (
                            <button
                              onClick={() => handleWrittenAnswer(currentActivityIndex, writtenAnswer, activity.correct_answer)}
                              disabled={!writtenAnswer.trim()}
                              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              Check Answer
                            </button>
                          )}
                          {hasAnswered && (
                            <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`text-xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                  {isCorrect ? '✓' : '✗'}
                                </span>
                                <span className={`font-semibold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                                  {isCorrect ? 'Correct!' : 'Not quite right'}
                                </span>
                              </div>
                              {!isCorrect && (
                                <p className="text-sm text-gray-700 mb-1">
                                  Correct answer: <strong>{activity.correct_answer}</strong>
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Matching Activity */}
                      {activity.type === 'matching' && activity.pairs && (
                        <div className="space-y-3">
                          {activity.pairs.map((pair, index) => (
                            <div key={index} className="p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-800">{pair.spanish}</span>
                                <span className="text-gray-600">→</span>
                                <span className="text-gray-700">{pair.english}</span>
                              </div>
                            </div>
                          ))}
                          {!hasAnswered && (
                            <button
                              onClick={() => {
                                setShowResult({ ...showResult, [currentActivityIndex]: true });
                                setCorrectAnswers({ ...correctAnswers, [currentActivityIndex]: true });
                                console.log(`Activity ${currentActivityIndex + 1} completed! (Matching activity)`);
                              }}
                              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors mt-4"
                            >
                              Got it!
                            </button>
                          )}
                        </div>
                      )}

                      {/* Explanation */}
                      {hasAnswered && activity.explanation && currentActivityIndex < lesson.content.activities.length - 1 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-900">
                            <strong>📚 Explanation:</strong> {activity.explanation}
                          </p>
                        </div>
                      )}

                      {/* Navigation */}
                      {hasAnswered && currentActivityIndex < lesson.content.activities.length - 1 && (
                        <button
                          onClick={handleNextActivity}
                          className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                        >
                          Next Activity →
                        </button>
                      )}
                    </div>
                  );
                })()
              ) : (
                /* Lesson Complete */
                <div className="text-center space-y-6">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-gray-800">Lesson completed!</h2>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                    <p className="text-5xl font-bold text-indigo-600 mb-2">{calculateScore()}%</p>
                    <p className="text-gray-600">Your Score</p>
                  </div>
                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => {
                        setCurrentActivityIndex(0);
                        setUserAnswers({});
                        setShowResult({});
                        setCorrectAnswers({});
                        setWrittenAnswer('');
                        setShowHint(false);
                      }}
                      className="bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => completeLesson(calculateScore())}
                      className="bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                    >
                      Complete Lesson
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">This lesson doesn't have activities yet.</p>
              <button
                onClick={() => router.push('/lessons')}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                Back to Lessons
              </button>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
