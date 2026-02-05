'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GistCard } from './GistCard';
import { GistResponse, StoryStructure, ArgumentStructure } from '@/lib/types';

interface GistViewerProps {
  gist: GistResponse;
  onReset: () => void;
}

type ViewSection = 'layers' | 'structure' | 'counter' | 'steelman';

export function GistViewer({ gist, onReset }: GistViewerProps) {
  const [activeSection, setActiveSection] = useState<ViewSection>('layers');
  const [layerIndex, setLayerIndex] = useState(0);

  // Calculate total cards for layers section
  const totalLayers = gist.layers.length;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeSection === 'layers') {
        if (e.key === 'ArrowLeft' && layerIndex > 0) {
          setLayerIndex(layerIndex - 1);
        } else if (e.key === 'ArrowRight' && layerIndex < totalLayers - 1) {
          setLayerIndex(layerIndex + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSection, layerIndex, totalLayers]);

  const renderStructure = useCallback(() => {
    if (gist.framework === 'story') {
      const s = gist.structure as StoryStructure;
      return (
        <div className="space-y-6">
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <h3 className="text-sm font-semibold text-amber-800 mb-2">📍 Situation</h3>
            <p className="text-gray-700">{s.situation}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <h3 className="text-sm font-semibold text-red-800 mb-2">⚡ Complication</h3>
            <p className="text-gray-700">{s.complication}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">❓ Question</h3>
            <p className="text-gray-700 italic">{s.question}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <h3 className="text-sm font-semibold text-green-800 mb-2">✅ Resolution</h3>
            <p className="text-gray-700">{s.resolution}</p>
          </div>
        </div>
      );
    } else {
      const a = gist.structure as ArgumentStructure;
      return (
        <div className="space-y-6">
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <h3 className="text-sm font-semibold text-purple-800 mb-2">💡 Thesis</h3>
            <p className="text-gray-700">{a.thesis}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">📊 Evidence</h3>
            <ul className="space-y-2">
              {a.evidence.map((e, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-700">
                  <span className="text-blue-500 mt-1">•</span>
                  {e}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
            <h3 className="text-sm font-semibold text-orange-800 mb-2">⚖️ Counter-Argument</h3>
            <p className="text-gray-700">{a.counterArgument}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border border-green-100">
            <h3 className="text-sm font-semibold text-green-800 mb-2">🔄 Synthesis</h3>
            <p className="text-gray-700">{a.synthesis}</p>
          </div>
        </div>
      );
    }
  }, [gist]);

  const sections: { id: ViewSection; label: string; icon: string }[] = [
    { id: 'layers', label: 'Summary', icon: '📄' },
    { id: 'structure', label: gist.framework === 'story' ? 'Story' : 'Argument', icon: gist.framework === 'story' ? '📖' : '⚖️' },
    { id: 'counter', label: 'Counter', icon: '🎯' },
    { id: 'steelman', label: 'Steelman', icon: '💪' },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          New Gist
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{gist.title}</h1>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <span className="capitalize">{gist.sourceType}</span>
          </span>
          <span>•</span>
          <span>{gist.wordCount.toLocaleString()} words</span>
          <span>•</span>
          <span className="capitalize">{gist.framework} format</span>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
              activeSection === section.id
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{section.icon}</span>
            {section.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeSection === 'layers' && (
          <motion.div
            key="layers"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <GistCard
              title={gist.layers[layerIndex]?.title || 'Summary'}
              content={gist.layers[layerIndex]?.content || gist.core}
              subtitle={`Depth level ${layerIndex}`}
              index={layerIndex}
              total={totalLayers}
              onPrevious={() => setLayerIndex(Math.max(0, layerIndex - 1))}
              onNext={() => setLayerIndex(Math.min(totalLayers - 1, layerIndex + 1))}
            />
            <p className="text-center text-xs text-gray-400 mt-3">
              Use ← → arrow keys to navigate
            </p>
          </motion.div>
        )}

        {activeSection === 'structure' && (
          <motion.div
            key="structure"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {gist.framework === 'story' ? '📖 Dramatic Structure' : '⚖️ Logical Structure'}
            </h2>
            {renderStructure()}
          </motion.div>
        )}

        {activeSection === 'counter' && (
          <motion.div
            key="counter"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">🎯 Counter-Argument</h2>
            <p className="text-sm text-gray-500 mb-4">The strongest case against this position</p>
            <p className="text-gray-700 leading-relaxed">{gist.counterArgument}</p>
          </motion.div>
        )}

        {activeSection === 'steelman' && (
          <motion.div
            key="steelman"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">💪 Steelman</h2>
            <p className="text-sm text-gray-500 mb-4">An even stronger version of the author&apos;s argument</p>
            <p className="text-gray-700 leading-relaxed">{gist.steelman}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Source link */}
      {gist.sourceUrl && (
        <div className="mt-6 text-center">
          <a
            href={gist.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
          >
            View original source
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
