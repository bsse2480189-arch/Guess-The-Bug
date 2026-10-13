import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { SUPPORTED_LANGUAGES, RANDOM_LANGUAGE, LanguageInfo } from '../lib/languages';
import { LanguageCard } from './LanguageCard';
import { StartButton } from './StartButton';
import { Search, Sparkles, Terminal, Code2, Cpu } from 'lucide-react';
import { playClick } from '../lib/audio';

interface LanguageGridProps {
  selectedLanguageId: string | null;
  onSelectLanguage: (langId: string) => void;
  onConfirmStart: () => void;
}

export const LanguageGrid: React.FC<LanguageGridProps> = ({
  selectedLanguageId,
  onSelectLanguage,
  onConfirmStart
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'web' | 'systems' | 'backend' | 'mobile'>('all');

  // Filter categorization
  const filteredLanguages = useMemo(() => {
    return SUPPORTED_LANGUAGES.filter(lang => {
      // Search text match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = lang.name.toLowerCase().includes(q);
        const matchesTag = lang.tagline.toLowerCase().includes(q);
        const matchesExt = lang.extension.toLowerCase().includes(q);
        if (!matchesName && !matchesTag && !matchesExt) return false;
      }

      // Category filter match
      if (activeFilter === 'web') {
        return ['javascript', 'typescript', 'html', 'css', 'php'].includes(lang.id);
      }
      if (activeFilter === 'systems') {
        return ['c', 'cpp', 'rust', 'go'].includes(lang.id);
      }
      if (activeFilter === 'backend') {
        return ['python', 'java', 'csharp', 'go', 'ruby', 'sql', 'php'].includes(lang.id);
      }
      if (activeFilter === 'mobile') {
        return ['kotlin', 'swift', 'javascript', 'typescript'].includes(lang.id);
      }

      return true;
    });
  }, [searchQuery, activeFilter]);

  // Selected language object
  const selectedLangObj = useMemo(() => {
    if (selectedLanguageId === 'random') return RANDOM_LANGUAGE;
    return SUPPORTED_LANGUAGES.find(l => l.id === selectedLanguageId);
  }, [selectedLanguageId]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:py-12 flex flex-col gap-8">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto flex flex-col items-center gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#161B22] border border-[#30363D] rounded-full text-xs font-mono text-[#58A6FF]">
          <Terminal className="w-3.5 h-3.5" />
          <span>Step 1: Choose Your Weapon</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Select Your Language
        </h1>

        <p className="text-sm sm:text-base text-[#8B949E] leading-relaxed">
          Choose which programming language you want to debug today. All 16 stacks contain authentic syntax quirks, off-by-one errors, and interview traps.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#161B22] border border-[#30363D] p-3 sm:p-4 rounded-2xl shadow-xl">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {(['all', 'web', 'systems', 'backend', 'mobile'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => {
                playClick();
                setActiveFilter(cat);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors capitalize cursor-pointer ${
                activeFilter === cat
                  ? 'bg-[#21262D] text-[#58A6FF] border border-[#58A6FF]/40 shadow-sm'
                  : 'text-[#8B949E] hover:text-white hover:bg-[#21262D]/50'
              }`}
            >
              {cat === 'all' ? 'All Stacks (16)' : cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#8B949E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search language..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#0D1117] border border-[#30363D] rounded-lg text-xs font-mono text-white placeholder:text-[#484F58] focus:border-[#58A6FF] outline-none"
          />
        </div>
      </div>

      {/* Main Grid: Random Card + 16 Languages */}
      <motion.div
        layout
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {/* 1. Surprise Me / Random Card (Always First) */}
        {activeFilter === 'all' && !searchQuery.trim() && (
          <LanguageCard
            language={RANDOM_LANGUAGE}
            isSelected={selectedLanguageId === 'random'}
            onSelect={onSelectLanguage}
          />
        )}

        {/* 2. All Filtered Languages */}
        {filteredLanguages.map(lang => (
          <LanguageCard
            key={lang.id}
            language={lang}
            isSelected={selectedLanguageId === lang.id}
            onSelect={onSelectLanguage}
          />
        ))}
      </motion.div>

      {/* Sticky Bottom Action: Start Game Button */}
      <div className="sticky bottom-6 z-30 pt-4 flex justify-center">
        <div className="bg-[#0D1117]/90 backdrop-blur-md p-3 rounded-2xl border border-[#30363D] shadow-2xl">
          <StartButton
            isDisabled={!selectedLanguageId}
            selectedLanguageName={selectedLangObj?.name}
            onStart={onConfirmStart}
          />
        </div>
      </div>
    </div>
  );
};
