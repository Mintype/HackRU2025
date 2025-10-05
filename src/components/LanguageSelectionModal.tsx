'use client';

import { useState } from 'react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
];

interface LanguageSelectionModalProps {
  onSelect: (languageCode: string) => void;
  loading?: boolean;
  onClose?: () => void;
  canClose?: boolean;
}

export default function LanguageSelectionModal({ onSelect, loading = false, onClose, canClose = false }: LanguageSelectionModalProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedLanguage) {
      onSelect(selectedLanguage);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (canClose && onClose && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            {canClose && onClose && (
              <button
                onClick={onClose}
                className="float-right text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🌍</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Choose Your Language
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Select the language you want to learn. You can change this later in settings.
            </p>
          </div>

          {/* Language Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => setSelectedLanguage(language.code)}
                disabled={loading}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  selectedLanguage === language.code
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-400'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-4xl mb-2">{language.flag}</div>
                <div className="font-semibold text-gray-800 dark:text-white">
                  {language.name}
                </div>
              </button>
            ))}
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={!selectedLanguage || loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-3"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Setting up your language...
              </span>
            ) : (
              'Start Learning'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
