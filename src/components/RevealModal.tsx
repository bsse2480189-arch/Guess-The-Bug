import React, { useEffect } from 'react';
import { Badge, Puzzle } from '../types/game';
import confetti from 'canvas-confetti';
import { playSquash, playError, playVictory } from '../lib/audio';
import { Check, X, ArrowRight, Zap, Flame, Award, Lightbulb } from 'lucide-react';

interface RevealModalProps {
  isOpen: boolean;
  isCorrect: boolean;
  puzzle: Puzzle;
  userAnswer: string;
  pointsEarned: number;
  timeRemainingSec: number;
  streakCount: number;
  newBadges?: Badge[];
  onNext: () => void;
  nextButtonLabel?: string;
  autoCooldownSec?: number;
}

export const RevealModal: React.FC<RevealModalProps> = ({
  isOpen,
  isCorrect,
  puzzle,
  userAnswer,
  pointsEarned,
  timeRemainingSec,
  streakCount,
  newBadges = [],
  onNext,
  nextButtonLabel = 'Next Puzzle',
  autoCooldownSec
}) => {
  useEffect(() => {
    if (!isOpen) return;

    if (isCorrect) {
      playSquash();
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#3FB950', '#58A6FF', '#D29922']
      });
      if (newBadges.length > 0) {
        setTimeout(playVictory, 500);
      }
    } else {
      playError();
    }
  }, [isOpen, isCorrect, newBadges]);

  if (!isOpen) return null;

  const timeBonus = isCorrect ? Math.floor(timeRemainingSec * 5) : 0;
  const speedBonus = isCorrect && (30 - timeRemainingSec) < 5 ? 25 : 0;
  const streakBonus = isCorrect && streakCount >= 3 ? 50 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#161B22] border border-[#30363D] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Banner Header */}
        <div
          className={`p-6 flex items-center justify-between border-b ${
            isCorrect
              ? 'bg-[#238636]/15 border-[#238636]/30 text-[#3FB950]'
              : 'bg-[#F85149]/15 border-[#F85149]/30 text-[#F85149]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg ${
                isCorrect ? 'bg-[#238636] text-white' : 'bg-[#DA3633] text-white'
              }`}
            >
              {isCorrect ? <Check className="w-6 h-6 stroke-[3]" /> : <X className="w-6 h-6 stroke-[3]" />}
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">
                {isCorrect ? 'Bug Squashed!' : 'Bug Escaped!'}
              </h3>
              <p className="text-xs text-[#8B949E]">
                {isCorrect
                  ? `Identified in ${Math.max(1, 30 - timeRemainingSec)} seconds`
                  : 'Better luck next time — inspect the analysis below'}
              </p>
            </div>
          </div>

          {/* Points Pill */}
          <div className="text-right font-mono">
            <div className={`text-2xl font-black ${isCorrect ? 'text-[#3FB950]' : 'text-[#8B949E]'}`}>
              {isCorrect ? `+${pointsEarned}` : '+0'} <span className="text-sm font-normal">pts</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[65vh]">
          {/* Points Breakdown if correct */}
          {isCorrect && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-[#0D1117] p-3 rounded-lg border border-[#30363D]">
              <div className="flex flex-col">
                <span className="text-[#8B949E]">Base</span>
                <span className="font-bold text-white">100 pts</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[#8B949E] flex items-center gap-1">
                  <Zap className="w-3 h-3 text-[#58A6FF]" /> Time ({timeRemainingSec}s)
                </span>
                <span className="font-bold text-[#58A6FF]">+{timeBonus} pts</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[#8B949E]">Speed Bonus</span>
                <span className="font-bold text-[#D29922]">+{speedBonus} pts</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[#8B949E] flex items-center gap-1">
                  <Flame className="w-3 h-3 text-[#F85149]" /> Streak ({streakCount})
                </span>
                <span className="font-bold text-[#F85149]">+{streakBonus} pts</span>
              </div>
            </div>
          )}

          {/* Newly Unlocked Badges */}
          {newBadges.length > 0 && (
            <div className="p-3 bg-[#D29922]/10 border border-[#D29922]/30 rounded-lg flex items-center gap-3">
              <span className="text-2xl">{newBadges[0].icon}</span>
              <div>
                <div className="text-xs font-bold text-[#D29922] flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> BADGE UNLOCKED: {newBadges[0].name}
                </div>
                <div className="text-xs text-[#C9D1D9]">{newBadges[0].description}</div>
              </div>
            </div>
          )}

          {/* Correct Answer Overview */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-mono text-[#8B949E] uppercase tracking-wider">
              Target Resolution
            </span>
            <div className="bg-[#0D1117] p-3 rounded-lg border border-[#30363D] font-mono text-xs sm:text-sm text-[#58A6FF] flex items-center justify-between">
              <span>Correct Answer: {puzzle.correctAnswer}</span>
              {puzzle.bugLine && (
                <span className="text-[#8B949E] text-xs">Bug Location: Line {puzzle.bugLine}</span>
              )}
            </div>
          </div>

          {/* Explanation */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#8B949E] uppercase tracking-wider">
              <Lightbulb className="w-3.5 h-3.5 text-[#D29922]" />
              <span>Technical Explanation</span>
            </div>
            <p className="text-sm text-[#C9D1D9] bg-[#0D1117] p-4 rounded-lg border border-[#30363D] leading-relaxed">
              {puzzle.explanation}
            </p>
          </div>

          {/* Fix Snippet if available */}
          {puzzle.fixSnippet && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-mono text-[#3FB950] uppercase tracking-wider">
                Recommended Fix Snippet
              </span>
              <pre className="bg-[#0D1117] p-3 rounded-lg border border-[#238636]/30 text-xs font-mono text-[#3FB950] overflow-x-auto">
                {puzzle.fixSnippet}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#161B22] border-t border-[#30363D] flex items-center justify-between gap-3">
          {autoCooldownSec !== undefined && (
            <span className="text-xs font-mono text-[#8B949E]">
              Next round in <span className="font-bold text-white">{autoCooldownSec}s</span>...
            </span>
          )}

          <button
            onClick={onNext}
            autoFocus
            className="ml-auto px-6 py-2.5 bg-[#238636] hover:bg-[#2EA043] text-white font-medium text-sm rounded-lg flex items-center gap-2 shadow-lg shadow-[#238636]/20 transition-all cursor-pointer"
          >
            <span>{nextButtonLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
