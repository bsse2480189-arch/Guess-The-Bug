import React, { useState } from 'react';
import { Share2, Check, Copy, X } from 'lucide-react';
import { playClick } from '../lib/audio';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayString: string;
  isCorrect: boolean;
  timeTakenSec: number;
  points: number;
  streak: number;
  accuracyGrid?: string; // e.g. "🟩🟩🟥🟩" or "🟩"
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  dayString,
  isCorrect,
  timeTakenSec,
  points,
  streak,
  accuracyGrid
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const gridText = accuracyGrid || (isCorrect ? '🟩' : '🟥');
  const shareText = `Guess The Bug! 🐛 (${dayString})\n${isCorrect ? 'Squashed' : 'Escaped'} in ${timeTakenSec}s ⚡\nScore: ${points} pts · Streak: ${streak} 🔥\n${gridText}\nPlay now: https://guessthebug.dev`;

  const handleCopy = () => {
    playClick();
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-[#161B22] border border-[#30363D] rounded-2xl shadow-2xl overflow-hidden p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-lg font-mono">
            <Share2 className="w-5 h-5 text-[#58A6FF]" />
            <span>Share Your Result</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#8B949E] hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Card */}
        <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-4 font-mono text-xs text-[#C9D1D9] leading-relaxed select-all">
          <p className="font-bold text-[#58A6FF]">Guess The Bug! 🐛 ({dayString})</p>
          <p className="text-[#8B949E]">
            {isCorrect ? 'Squashed' : 'Escaped'} in {timeTakenSec}s ⚡
          </p>
          <p className="text-white font-semibold">
            Score: {points} pts · Streak: {streak} 🔥
          </p>
          <div className="text-lg tracking-widest my-2 select-all">{gridText}</div>
          <p className="text-[#8B949E]">https://guessthebug.dev</p>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="w-full py-3 bg-[#238636] hover:bg-[#2EA043] text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#238636]/20 cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy Share Card'}</span>
        </button>
      </div>
    </div>
  );
};
