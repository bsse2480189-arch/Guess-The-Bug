import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import { playClick } from '../lib/audio';

interface StartButtonProps {
  isDisabled: boolean;
  selectedLanguageName?: string;
  onStart: () => void;
}

export const StartButton: React.FC<StartButtonProps> = ({
  isDisabled,
  selectedLanguageName,
  onStart
}) => {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <motion.button
        whileHover={!isDisabled ? { scale: 1.04, y: -2 } : {}}
        whileTap={!isDisabled ? { scale: 0.98 } : {}}
        onClick={() => {
          if (!isDisabled) {
            playClick();
            onStart();
          }
        }}
        disabled={isDisabled}
        className={`relative px-10 py-4 rounded-xl font-bold font-mono text-sm sm:text-base flex items-center justify-center gap-3 transition-all duration-300 select-none ${
          isDisabled
            ? 'bg-[#21262D] text-[#484F58] border border-[#30363D] cursor-not-allowed opacity-60'
            : 'bg-[#238636] hover:bg-[#2EA043] text-white shadow-[0_0_30px_rgba(35,134,54,0.4)] border border-[#3FB950]/40 cursor-pointer active:scale-95'
        }`}
      >
        {!isDisabled && (
          <span className="absolute inset-0 rounded-xl bg-[#3FB950]/20 animate-pulse pointer-events-none" />
        )}

        <Play className={`w-4 h-4 ${!isDisabled ? 'fill-white' : ''}`} />
        <span>
          {isDisabled
            ? 'Select a Language to Continue'
            : `Start Game with ${selectedLanguageName}`}
        </span>
        <ArrowRight className={`w-4 h-4 ${!isDisabled ? 'animate-bounce-horizontal' : ''}`} />
      </motion.button>

      {/* Helper caption */}
      <span className="text-xs font-mono text-[#8B949E]">
        {isDisabled
          ? 'Pick any stack above (or choose "Surprise Me")'
          : `Ready to squash ${selectedLanguageName} bugs · You can switch stacks anytime`}
      </span>
    </div>
  );
};
