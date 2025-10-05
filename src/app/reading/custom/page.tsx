'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  learning_language: string | null;
}

export default function CustomReadingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [translation, setTranslation] = useState<string | null>(null);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [wordPosition, setWordPosition] = useState<{ x: number; y: number } | null>(null);
  const [showInstruction, setShowInstruction] = useState(true);
  const [translationCache, setTranslationCache] = useState<Record<string, string>>({});

  useEffect(() => {
    checkUser();
    const urlTitle = searchParams.get('title');
    const urlText = searchParams.get('text');
    if (urlTitle) {
      setTitle(decodeURIComponent(urlTitle));
    }
    if (urlText) {
      setText(decodeURIComponent(urlText));
    }
  }, [searchParams]);

  async function checkUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      
      setUser(user);
      
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('id, learning_language')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // It's a custom text, so we don't push to dashboard, just log the error
      }

      setUserProfile(profile);
    } catch (error) {
      console.error('Error checking user:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  async function handleWordClick(word: string, index: number, event: React.MouseEvent) {
    const isChinese = userProfile?.learning_language === 'zh';
    
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").trim();
    
    if (!cleanWord) return;

    if (selectedIndices.includes(index)) {
      setSelectedWord(null);
      setSelectedIndices([]);
      setTranslation(null);
      setWordPosition(null);
      return;
    }

    let newIndices: number[] = [];
    let newWord: string = '';

    if (isChinese) {
      const isAdjacent = selectedIndices.length > 0 && 
        (selectedIndices.includes(index - 1) || selectedIndices.includes(index + 1));

      if (isAdjacent) {
        newIndices = [...selectedIndices, index].sort((a, b) => a - b);
        const chars = text.split('');
        newWord = newIndices.map(i => chars[i]).join('').replace(/[。，、！？；：""''（）【】《》…—]/g, '').trim();
      } else {
        newIndices = [index];
        newWord = cleanWord;
      }
    } else {
      const tokens = text.match(/[a-zA-Z\u00C0-\u00FF\u0100-\u017F]+|\s+|[^a-zA-Z\u00C0-\u00FF\u0100-\u017F\s]+/g) || [];
      const wordIndices = tokens.map((token, idx) => 
        /^[a-zA-Z\u00C0-\u00FF\u0100-\u017F]+$/.test(token) ? idx : -1
      ).filter(idx => idx !== -1);
      const wordSequenceIndex = wordIndices.indexOf(index);
      const selectedWordIndices = selectedIndices.map(idx => 
        wordIndices.indexOf(idx)
      ).filter(idx => idx !== -1);
      const isAdjacent = selectedWordIndices.length > 0 &&
        selectedWordIndices.some(idx => Math.abs(idx - wordSequenceIndex) === 1);
      
      if (isAdjacent) {
        const allIndices = [...selectedIndices, index];
        newIndices = allIndices.sort((a, b) => a - b);
        const firstIdx = Math.min(...newIndices);
        const lastIdx = Math.max(...newIndices);
        newWord = tokens.slice(firstIdx, lastIdx + 1).join('').trim();
      } else {
        newIndices = [index];
        newWord = cleanWord;
      }
    }

    setSelectedIndices(newIndices);
    setSelectedWord(newWord);

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const container = document.querySelector('.reading-content-container');
    const containerRect = container?.getBoundingClientRect();
    
    if (containerRect) {
      setWordPosition({ 
        x: rect.left - containerRect.left + rect.width / 2, 
        y: rect.top - containerRect.top - 10
      });
    }

    if (translationCache[newWord]) {
      setTranslation(translationCache[newWord]);
      setTranslationLoading(false);
      return;
    }

    setTranslationLoading(true);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: newWord,
          sourceLang: userProfile?.learning_language,
          targetLang: 'en'
        })
      });

      if (!response.ok) throw new Error('Translation failed');

      const data = await response.json();
      setTranslation(data.translation);
      
      setTranslationCache(prev => ({
        ...prev,
        [newWord]: data.translation
      }));
    } catch (error) {
      console.error('Error translating word:', error);
      setTranslation('Translation unavailable');
    } finally {
      setTranslationLoading(false);
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

  if (loading || !text) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
      <nav className="container mx-auto px-6 py-6 backdrop-blur-sm bg-white/80 sticky top-0 z-50 rounded-b-2xl shadow-sm">
        <div>
          <div className="flex items-center justify-between">
            <button onClick={() => router.push('/')} className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-800 bg-clip-text text-transparent animate-gradient-flow-fast">
                LLM
              </span>
            </button>
            <div className="flex items-center space-x-4">
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

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <button
          onClick={() => router.push('/reading')}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 mb-6 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Reading List</span>
        </button>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex-1 mb-8">
            {title}
          </h1>

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

          <div className="relative reading-content-container">
            <div className="text-lg md:text-xl leading-relaxed text-gray-800 space-y-4 whitespace-pre-wrap">
              {(() => {
                const isChinese = userProfile?.learning_language === 'zh';
                const tokens = isChinese
                  ? text.split('')
                  : text.match(/[a-zA-Z\u00C0-\u00FF\u0100-\u017F]+|\s+|[^a-zA-Z\u00C0-\u00FF\u0100-\u017F\s]+/g) || [];
                
                return tokens.map((token, index) => {
                  const isValidToken = isChinese
                    ? /[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff]/.test(token)
                    : /^[a-zA-Z\u00C0-\u00FF\u0100-\u017F]+$/.test(token);

                  const isSelected = selectedIndices.includes(index);

                  if (isValidToken) {
                    return (
                      <span
                        key={index}
                        onClick={(e) => handleWordClick(token, index, e)}
                        className={`cursor-pointer transition-all duration-150 rounded px-0.5 ${
                          isSelected 
                            ? 'bg-yellow-300 text-purple-900 ring-2 ring-yellow-400 font-semibold' 
                            : 'hover:bg-yellow-100 hover:text-purple-700'
                        }`}
                      >
                        {token}
                      </span>
                    );
                  }
                  return <span key={index}>{token}</span>;
                });
              })()}
            </div>

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
        </div>
      </div>
    </div>
  );
}
