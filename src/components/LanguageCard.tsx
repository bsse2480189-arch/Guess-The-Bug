import React from 'react';
import { motion } from 'motion/react';
import { LanguageInfo } from '../lib/languages';
import { Check, Sparkles } from 'lucide-react';
import { playClick } from '../lib/audio';

interface LanguageCardProps {
  language: LanguageInfo;
  isSelected: boolean;
  onSelect: (langId: string) => void;
}

export const LanguageCard: React.FC<LanguageCardProps> = ({
  language,
  isSelected,
  onSelect
}) => {
  const isRandom = language.id === 'random';

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => {
        playClick();
        onSelect(language.id);
      }}
      className={`relative rounded-2xl p-5 cursor-pointer transition-all duration-300 border flex flex-col justify-between overflow-hidden select-none group ${
        isSelected
          ? 'bg-[#161B22] border-[#58A6FF] shadow-[0_0_24px_rgba(88,166,255,0.35)] ring-1 ring-[#58A6FF]'
          : 'bg-[#161B22] border-[#30363D] hover:border-[#8B949E]/60 hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)]'
      }`}
      style={{
        boxShadow: isSelected
          ? `0 0 28px ${language.bgGlow}, inset 0 0 12px ${language.bgGlow}`
          : undefined
      }}
    >
      {/* Background ambient glow effect */}
      <div
        className="absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity"
        style={{ backgroundColor: language.color }}
      />

      {/* Top Header: Logo + Checkmark Badge */}
      <div className="flex items-start justify-between gap-3 z-10">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center p-2 bg-[#0D1117] border border-[#30363D] transition-transform group-hover:scale-105 shadow-inner shrink-0"
          dangerouslySetInnerHTML={{ __html: language.iconSvg }}
        />

        {/* Selected Checkmark or Extension Pill */}
        <div className="flex items-center gap-1.5">
          {isSelected ? (
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="w-6 h-6 rounded-full bg-[#3FB950] text-black flex items-center justify-center shadow-lg shadow-[#3FB950]/30"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </motion.div>
          ) : (
            <span className="font-mono text-[11px] text-[#8B949E] px-2 py-0.5 rounded bg-[#0D1117] border border-[#30363D]">
              {language.extension}
            </span>
          )}
        </div>
      </div>

      {/* Card Info */}
      <div className="flex flex-col gap-1.5 mt-4 z-10">
        <div className="flex items-center gap-2">
          <h3 className="font-mono text-base font-bold text-white group-hover:text-[#58A6FF] transition-colors flex items-center gap-1.5">
            {language.name}
            {isRandom && <Sparkles className="w-3.5 h-3.5 text-[#58A6FF] animate-pulse" />}
          </h3>
        </div>

        <p className="text-xs text-[#8B949E] line-clamp-1 leading-relaxed">
          {language.tagline}
        </p>
      </div>

      {/* Card Footer: Puzzle Count */}
      <div className="mt-4 pt-3 border-t border-[#21262D] flex items-center justify-between text-xs font-mono z-10">
        <span className="text-[#8B949E] flex items-center gap-1">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ backgroundColor: language.color }}
          />
          <span>{language.puzzleCount} bugs</span>
        </span>

        <span
          className={`text-[11px] font-semibold transition-colors ${
            isSelected ? 'text-[#58A6FF]' : 'text-[#484F58] group-hover:text-[#8B949E]'
          }`}
        >
          {isSelected ? 'SELECTED' : 'SELECT'}
        </span>
      </div>
    </motion.div>
  );
};
