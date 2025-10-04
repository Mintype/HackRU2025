'use client';

import { useState } from 'react';

export default function Home() {

  return (
    <div className="min-h-screen rel  ative bg-gradient-to-br from-blue-100 via-white to-purple-100">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 backdrop-blur-sm bg-white/80 sticky top-0 z-50 rounded-b-2xl shadow-sm opacity-0-animate animate-fadeInDown">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-800 bg-clip-text text-transparent animate-gradient-flow-fast">
              LLM
            </span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-900 dark:text-gray-600 hover:text-purple-600 dark:hover:text-purple-400 transition hover:scale-110 transform duration-200">Features</a>
            <a href="#how-it-works" className="text-gray-900 dark:text-gray-600 hover:text-purple-600 dark:hover:text-purple-400 transition hover:scale-110 transform duration-200">How It Works</a>
            <a href="#about" className="text-gray-900 dark:text-gray-600 hover:text-purple-600 dark:hover:text-purple-400 transition hover:scale-110 transform duration-200">About</a>
          </div>
          <a href="/login" className="bg-gradient-to-r from-blue-600 to-purple-800 text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105 inline-block animate-gradient-flow">
            Login
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent animate-gradient-flow-slow opacity-0-animate animate-fadeInDown">
          Language Learning Machine
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto mt-16 leading-relaxed opacity-0-animate animate-fadeInUp delay-300">
          Master any language with AI learning. Gamified lessons, instant translations, and intelligent conversation practice.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0-animate animate-scaleIn delay-600">
          <a href="/login" className="bg-gradient-to-r from-blue-600 to-purple-800 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105 inline-block animate-gradient-flow animate-bounce-gentle">
            Start Learning
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-6 py-20">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-purple-800 bg-clip-text text-transparent animate-gradient-flow-slow opacity-0-animate animate-fadeInUp">
          Main Features
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 opacity-0-animate animate-fadeInUp delay-100">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-float">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-800 bg-clip-text text-transparent animate-gradient-flow-fast">Gamified Learning</h3>
            <p className="text-gray-700 dark:text-gray-400">
              Level up your skills with interactive games, challenges, and rewards. Make learning addictive and fun!
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 opacity-0-animate animate-fadeInUp delay-200">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-float delay-200">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-cyan-600 to-blue-800 bg-clip-text text-transparent animate-gradient-flow-fast">Instant Translation</h3>
            <p className="text-gray-700 dark:text-gray-400">
              Highlight any text and get instant translations. Read foreign content effortlessly and learn in context.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 opacity-0-animate animate-fadeInUp delay-300">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-float delay-400">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-800 bg-clip-text text-transparent animate-gradient-flow-fast">AI Grammar Coach</h3>
            <p className="text-gray-700 dark:text-gray-400">
              Get personalized explanations for complex grammar rules. Understand the 'why' behind the language.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 opacity-0-animate animate-fadeInUp delay-400">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-float delay-600">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-indigo-800 bg-clip-text text-transparent animate-gradient-flow-fast">Smart Chatbot</h3>
            <p className="text-gray-700 dark:text-gray-400">
              Practice conversations with an AI that corrects your mistakes in real-time and adapts to your level.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 opacity-0-animate animate-fadeInUp delay-500">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-float delay-800">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-800 bg-clip-text text-transparent animate-gradient-flow-fast">Voice Conversation</h3>
            <p className="text-gray-700 dark:text-gray-400">
              Practice speaking naturally with voice-enabled AI. Improve pronunciation and build confidence.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 opacity-0-animate animate-fadeInUp delay-600">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-float">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-blue-800 bg-clip-text text-transparent animate-gradient-flow-fast">Progress Tracking</h3>
            <p className="text-gray-700 dark:text-gray-400">
              Monitor your learning journey with detailed analytics and personalized recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-6 py-20 bg-gradient-to-br from-white to-purple-50/50 rounded-3xl my-20 shadow-xl border border-gray-100 opacity-0-animate animate-fadeIn">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-purple-800 bg-clip-text text-transparent animate-gradient-flow-slow opacity-0-animate animate-fadeInDown">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center opacity-0-animate animate-fadeInUp delay-200">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold shadow-lg hover:scale-110 transition-transform duration-300 animate-gradient-flow animate-bounce-gentle">
              1
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-600">Choose Your Language</h3>
            <p className="text-gray-700 dark:text-gray-400">
              Select from 50+ languages and set your proficiency level. We'll customize your learning path.
            </p>
          </div>
          <div className="text-center opacity-0-animate animate-fadeInUp delay-400">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold shadow-lg hover:scale-110 transition-transform duration-300 animate-gradient-flow animate-bounce-gentle">
              2
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-600">Learn & Practice</h3>
            <p className="text-gray-700 dark:text-gray-400">
              Engage with interactive lessons, games, and AI conversations. Learn at your own pace.
            </p>
          </div>
          <div className="text-center opacity-0-animate animate-fadeInUp delay-600">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold shadow-lg hover:scale-110 transition-transform duration-300 animate-gradient-flow animate-bounce-gentle">
              3
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-600">Achieve Fluency</h3>
            <p className="text-gray-700 dark:text-gray-400">
              Track your progress and celebrate milestones. Become fluent faster than traditional methods.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-blue-600 via-purple-700 to-indigo-800 rounded-3xl p-12 md:p-20 shadow-2xl border border-purple-500/20 animate-gradient-flow-slow opacity-0-animate animate-scaleIn">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 opacity-0-animate animate-fadeInDown delay-200">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto opacity-0-animate animate-fadeInUp delay-400">
            Join as a learners and master a new languages with OUR tools. Start now today!
          </p>
          <a href="/login" className="bg-white text-purple-600 px-10 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-white/50 transition-all duration-300 transform hover:scale-105 inline-block animate-scaleIn delay-600 animate-bounce-gentle">
            Start Now
          </a>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="container mx-auto px-6 py-20">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-purple-800 bg-clip-text text-transparent animate-gradient-flow-slow opacity-0-animate animate-fadeInUp">
          About Us
        </h2>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 opacity-0-animate animate-fadeInUp delay-300">
            <p className="text-lg text-gray-700 dark:text-gray-400 mb-6 leading-relaxed">
              Language Learning Machine (LLM) is revolutionizing the way people learn languages. We combine cutting-edge AI technology with proven language learning methodologies to create an immersive, personalized, and effective learning experience.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-400 mb-6 leading-relaxed">
              Our mission is to break down language barriers and make fluency accessible to everyone. Whether you're learning for travel, career advancement, or personal enrichment, our AI-powered platform adapts to your learning style and pace.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-400 leading-relaxed">
              Founded by language enthusiasts and AI experts, we believe that learning a new language should be engaging, interactive, and fun. That's why we've built a platform that feels more like a game than a traditional course.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12">
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-gray-700 dark:text-gray-400">
          <p>&copy; 2025 Language Learning Machine. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
