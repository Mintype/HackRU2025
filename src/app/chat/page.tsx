'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { playStreamingAudio } from '@/lib/tts';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UserProfile {
  learning_language: string;
}

export default function ChatPage() {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [speakingMessageId, setSpeakingMessageId] = useState<number | null>(null);

  const playMessage = async (text: string, messageId: number) => {
    try {
      await playStreamingAudio(
        text,
        () => setSpeakingMessageId(messageId),
        () => setSpeakingMessageId(null)
      );
    } catch (error) {
      console.error('Error playing audio:', error);
      setSpeakingMessageId(null);
    }
  };
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    checkUserAndProfile();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function checkUserAndProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      setUser(user);

      // Fetch user profile to get learning language
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('learning_language')
        .eq('id', user.id)
        .single();

      if (!profile || !profile.learning_language) {
        router.push('/dashboard');
        return;
      }

      setUserProfile(profile);
      
      // Add welcome message
      const languageNames: { [key: string]: string } = {
        es: 'Spanish',
        fr: 'French',
        de: 'German',
        ja: 'Japanese',
        zh: 'Chinese',
        ko: 'Korean',
        it: 'Italian',
        pt: 'Portuguese',
        ru: 'Russian',
        ar: 'Arabic',
        hi: 'Hindi',
        nl: 'Dutch',
      };
      
      const languageName = languageNames[profile.learning_language] || profile.learning_language;
      
      const welcomeMessage = `Hello! I'm your ${languageName} practice partner. Let's have a conversation to help you practice. Feel free to write in ${languageName} or ask me anything!`;
      
      setMessages([
        {
          role: 'assistant',
          content: welcomeMessage,
        },
      ]);

      // Play the welcome message after a short delay to ensure the UI is ready
      setTimeout(() => {
        playMessage(welcomeMessage, 0);
      }, 500);
    } catch (error) {
      console.error('Error:', error);
      router.push('/login');
    } finally {
      setInitializing(false);
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading || !userProfile) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          language: userProfile.learning_language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Automatically play the new message
      const newMessageIndex = messages.length + 1;
      playMessage(data.message, newMessageIndex);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex flex-col">
      {/* Header */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Back to Dashboard
              </span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Practice Chat
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Chat Container */}
      <div className="flex-1 container mx-auto px-4 py-6 max-w-4xl flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-lg'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <p className="whitespace-pre-wrap break-words flex-1">{message.content}</p>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => playMessage(message.content, index)}
                      disabled={speakingMessageId !== null}
                      className="ml-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      {speakingMessageId === index ? (
                        <svg className="w-5 h-5 text-purple-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 rounded-2xl px-6 py-4 shadow-lg">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={sendMessage} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
