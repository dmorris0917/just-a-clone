'use client';

import { useState } from 'react';
import { InputForm } from '@/components/InputForm';
import { GistViewer } from '@/components/GistViewer';
import { GistResponse } from '@/lib/types';

export default function Home() {
  const [gist, setGist] = useState<GistResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (input: { url?: string; text?: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate gist');
      }

      setGist(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setGist(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12 sm:py-20">
        {/* Header - only show when no gist */}
        {!gist && (
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Get the <span className="text-blue-600">Gist</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-lg mx-auto">
              Turn articles, videos, and PDFs into structured, layered summaries 
              with counter-arguments and steelman positions.
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-red-800 font-medium">Error</p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {gist ? (
          <GistViewer gist={gist} onReset={handleReset} />
        ) : (
          <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
        )}

        {/* Loading overlay with progress */}
        {isLoading && (
          <div className="max-w-2xl mx-auto mt-8">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-700 font-medium">Analyzing content...</p>
              <p className="text-sm text-gray-500 mt-2">
                Extracting text, detecting framework, generating structured summary
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 text-center text-sm text-gray-400">
          <p>
            Structured summaries using{' '}
            <a href="https://openai.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
              OpenAI
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
