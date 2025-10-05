'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { playStreamingAudio, stopAudio } from '@/lib/tts';

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
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [audioDownloaded, setAudioDownloaded] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

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

  // Handle visibility change and cleanup on unmount
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAudio();
        setSpeakingMessageId(null);
      }
    };

    const handleBeforeUnload = () => {
      stopAudio();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function that runs when component unmounts (e.g., when navigating away)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      stopAudio();
      setSpeakingMessageId(null);
    };
  }, []); // Empty dependency array so cleanup runs on unmount

  useEffect(() => {
    checkUserAndProfile();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle auto-play for all assistant messages
  useEffect(() => {
    if (autoPlayEnabled && messages.length > 0 && 
        messages[messages.length - 1].role === 'assistant' && 
        !speakingMessageId && !initializing) {
      const lastMessage = messages[messages.length - 1];
      const messageId = messages.length - 1;
      playMessage(lastMessage.content, messageId);
    }
  }, [messages, initializing, autoPlayEnabled]);

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
      
      setMessages([{
        role: 'assistant',
        content: welcomeMessage,
      }]);
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

  async function startRecording() {
    try {
      setRecordingError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Create MediaRecorder to record audio
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // // Download the audio file for testing
        // downloadAudio(audioBlob);
        
        // Send audio for transcription
        await handleAudioTranscription(audioBlob);
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setRecordingError('Recording error occurred. Please try again.');
        setIsRecording(false);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (error: any) {
      console.error('Error starting recording:', error);
      
      if (error.name === 'NotAllowedError') {
        setRecordingError('Microphone access denied. Please allow microphone access in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        setRecordingError('No microphone found. Please connect a microphone and try again.');
      } else {
        setRecordingError('Failed to start recording. Please check your microphone and try again.');
      }
      
      setIsRecording(false);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  function downloadAudio(audioBlob: Blob) {
    try {
      // Create a download link
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      a.download = `voice-recording-${timestamp}.webm`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Show success notification
      setAudioDownloaded(true);
      setTimeout(() => setAudioDownloaded(false), 3000);
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log('Audio file downloaded successfully');
    } catch (error) {
      console.error('Error downloading audio:', error);
    }
  }

  async function handleAudioTranscription(audioBlob: Blob) {
    try {
      setLoading(true);
      
      // Convert audio blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        const base64Data = base64Audio.split(',')[1];
        
        // Send to Gemini API with audio support
        await sendAudioToGemini(base64Data);
      };
      
      reader.onerror = () => {
        setRecordingError('Failed to process audio. Please try again.');
        setLoading(false);
      };
      
    } catch (error) {
      console.error('Error handling audio transcription:', error);
      setRecordingError('Failed to process audio. Please try typing instead.');
      setLoading(false);
    }
  }

  async function sendAudioToGemini(base64Audio: string) {
    try {
      if (!userProfile) {
        setLoading(false);
        return;
      }

      // Add a placeholder message for user
      const placeholderMessage: Message = {
        role: 'user',
        content: '🎤 Processing voice message...',
      };
      setMessages((prev) => [...prev, placeholderMessage]);

      // Use the dedicated audio chat API
      const response = await fetch('/api/chat-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioData: base64Audio,
          language: userProfile.learning_language,
          conversationHistory: messages, // Send conversation context
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process audio');
      }

      const data = await response.json();
      
      // Replace placeholder with actual transcription
      if (data.transcription) {
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            role: 'user',
            content: data.transcription,
          };
          return newMessages;
        });
      }
      
      // Add assistant's response
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error sending audio:', error);
      
      // Remove placeholder and show error
      setMessages((prev) => {
        const newMessages = prev.slice(0, -1); // Remove placeholder
        return [
          ...newMessages,
          {
            role: 'assistant',
            content: `Sorry, I couldn't process your voice message. ${error.message || 'Please try again or use text chat.'}`,
          },
        ];
      });
    } finally {
      setLoading(false);
    }
  }

  async function sendTranscribedMessage(text: string) {
    if (!text.trim() || !userProfile) {
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: text.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 flex flex-col">
      {/* Header */}
      <nav className="container mx-auto px-6 py-6 backdrop-blur-sm bg-white/80 sticky top-0 z-50 rounded-b-2xl shadow-sm">
        <div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-lg font-semibold text-gray-700">
                Back to Dashboard
              </span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
                Practice Chat
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Chat Container */}
      <div className="flex-1 container mx-auto px-6 py-12 max-w-4xl flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-3xl px-6 py-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl'
                    : 'bg-white/80 backdrop-blur-sm text-gray-800 shadow-xl border border-gray-100'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <p className="whitespace-pre-wrap break-words flex-1">{message.content}</p>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => {
                        if (speakingMessageId === index) {
                          stopAudio();
                          setSpeakingMessageId(null);
                        } else {
                          playMessage(message.content, index);
                        }
                      }}
                      disabled={speakingMessageId !== null && speakingMessageId !== index}
                      className="ml-2 p-2 hover:bg-gray-100 rounded-full transition-colors"
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
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl px-6 py-4 shadow-xl border border-gray-100">
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

        {/* Bottom Controls */}
        <div className="flex flex-col space-y-4">
          <button
            onClick={() => setAutoPlayEnabled(!autoPlayEnabled)}
            className={`self-start flex items-center space-x-2 px-4 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${
              autoPlayEnabled
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl'
                : 'bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-300 shadow-xl'
            }`}
            title={autoPlayEnabled ? 'Disable autoplay' : 'Enable autoplay'}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={autoPlayEnabled 
                  ? "M15.536 15.536L9.879 9.879M9.879 9.879L4.222 4.222M9.879 9.879L15.536 4.222M9.879 9.879L4.222 15.536"
                  : "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"}
              />
            </svg>
            <span>
              Autoplay {autoPlayEnabled ? 'On' : 'Off'}
            </span>
          </button>

          <form onSubmit={sendMessage} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 p-6">
            {audioDownloaded && (
              <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-2xl text-blue-700 text-sm flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>✓ Audio file downloaded! Check your downloads folder.</span>
              </div>
            )}
            {recordingError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-2xl text-red-700 text-sm flex items-start space-x-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{recordingError}</span>
              </div>
            )}
            {isRecording && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-2xl text-red-700 text-sm flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-red-600 rounded-full animate-pulse"></div>
                  <div className="w-1 h-6 bg-red-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-5 bg-red-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  <div className="w-1 h-7 bg-red-600 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                </div>
                <span className="font-semibold">Recording... Click stop when finished</span>
              </div>
            )}
            <div className="flex space-x-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading || isRecording}
                placeholder={isRecording ? "🎤 Recording..." : "Type your message or use voice..."}
                className="flex-1 px-6 py-3 rounded-full border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition disabled:opacity-50"
              />
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={loading}
                className={`px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl ${
                  isRecording
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white animate-pulse'
                    : 'bg-gradient-to-r from-green-600 to-green-700 text-white'
                }`}
                title={isRecording ? "Stop recording and send" : "Start voice recording"}
              >
                {isRecording ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
              <button
                type="submit"
                disabled={loading || !input.trim() || isRecording}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}