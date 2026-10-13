import React, { useState, useEffect, useRef } from 'react';
import { Puzzle, UserStats } from '../types/game';
import { ALL_PUZZLES } from '../data/puzzles';
import { CodeViewer } from './CodeViewer';
import { TimerBar } from './TimerBar';
import { QuestionBox } from './QuestionBox';
import { RevealModal } from './RevealModal';
import { recordPuzzleResult } from '../lib/storage';
import { playCountdown, playVictory } from '../lib/audio';
import confetti from 'canvas-confetti';
import { Zap, Timer, Flame, CheckCircle, Trophy, RotateCcw } from 'lucide-react';

interface SpeedrunGameProps {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  fontSize: 'sm' | 'md' | 'lg';
}

export const SpeedrunGame: React.FC<SpeedrunGameProps> = ({
  userStats,
  onUpdateStats,
  fontSize
}) => {
  const [gameState, setGameState] = useState<'intro' | 'countdown' | 'playing' | 'revealed' | 'finished'>('intro');
  const [roundPuzzles, setRoundPuzzles] = useState<Puzzle[]>([]);
  const [currentRoundIdx, setCurrentRoundIdx] = useState<number>(0);
  const [remainingSec, setRemainingSec] = useState<number>(15);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [roundScore, setRoundScore] = useState<number>(0);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [unlockedBadges, setUnlockedBadges] = useState<any[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startBlitz = () => {
    // Pick 5 varied puzzles
    const shuffled = [...ALL_PUZZLES].sort(() => 0.5 - Math.random()).slice(0, 5);
    setRoundPuzzles(shuffled);
    setCurrentRoundIdx(0);
    setTotalScore(0);
    setCorrectCount(0);
    setGameState('countdown');
  };

  useEffect(() => {
    if (gameState === 'countdown') {
      playCountdown(false);
      const timer = setTimeout(() => {
        setGameState('playing');
        setRemainingSec(15);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setRemainingSec(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleRoundTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentRoundIdx]);

  const handleRoundTimeout = () => {
    setIsCorrect(false);
    setRoundScore(0);
    setGameState('revealed');
  };

  const currentPuzzle = roundPuzzles[currentRoundIdx];

  const handleSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const answer = currentPuzzle.type === 'click_line'
      ? String(selectedLine)
      : selectedOption || '';

    const correct = answer.trim() === String(currentPuzzle.correctAnswer).trim();
    const timeTaken = 15 - remainingSec;

    let pts = 0;
    if (correct) {
      pts = 100 + remainingSec * 10;
      if (timeTaken < 3) pts += 50; // extra blitz speed bonus
      setCorrectCount(prev => prev + 1);
    }

    setIsCorrect(correct);
    setRoundScore(pts);
    setTotalScore(prev => prev + pts);
    setGameState('revealed');

    const { updatedStats, newBadges } = recordPuzzleResult(
      userStats,
      currentPuzzle.language,
      correct,
      timeTaken,
      pts
    );
    onUpdateStats(updatedStats);
    setUnlockedBadges(newBadges);
  };

  const handleNextRound = () => {
    if (currentRoundIdx + 1 < roundPuzzles.length) {
      setCurrentRoundIdx(prev => prev + 1);
      setSelectedOption(null);
      setSelectedLine(null);
      setRemainingSec(15);
      setGameState('playing');
    } else {
      setGameState('finished');
      playVictory();
      confetti({ particleCount: 100, spread: 70 });
    }
  };

  if (gameState === 'intro') {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-12 flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 rounded-2xl bg-[#D29922]/10 border border-[#D29922]/30 text-[#D29922] flex items-center justify-center text-3xl">
          ⚡
        </div>

        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Speed Blitz Mode</h1>
          <p className="text-sm text-[#8B949E] mt-2 max-w-md mx-auto">
            5 rapid-fire snippets. 15 seconds per snippet. Maximize your score with ultra-fast squashes!
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-[#8B949E]">
          <span className="bg-[#161B22] px-3 py-1.5 rounded-lg border border-[#30363D]">
            5 Rounds
          </span>
          <span className="bg-[#161B22] px-3 py-1.5 rounded-lg border border-[#30363D]">
            15s / Round
          </span>
          <span className="bg-[#161B22] px-3 py-1.5 rounded-lg border border-[#30363D] text-[#3FB950]">
            Speed Multiplier Active
          </span>
        </div>

        <button
          onClick={startBlitz}
          className="px-8 py-3.5 bg-[#D29922] hover:bg-[#E3B341] text-black font-bold text-sm rounded-xl transition-all shadow-lg shadow-[#D29922]/20 cursor-pointer"
        >
          Launch Speed Blitz
        </button>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-12 flex flex-col items-center text-center gap-6 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-[#238636]/20 border border-[#238636]/40 text-[#3FB950] flex items-center justify-center text-3xl">
          🏆
        </div>

        <div>
          <h1 className="text-3xl font-black text-white">Blitz Complete!</h1>
          <p className="text-xs text-[#8B949E] mt-1">
            You tackled all 5 rapid debugging challenges.
          </p>
        </div>

        <div className="w-full bg-[#161B22] border border-[#30363D] rounded-xl p-5 flex items-center justify-around font-mono text-center">
          <div>
            <div className="text-xs text-[#8B949E]">Total Score</div>
            <div className="text-2xl font-black text-[#3FB950]">{totalScore} pts</div>
          </div>
          <div className="h-8 w-px bg-[#30363D]" />
          <div>
            <div className="text-xs text-[#8B949E]">Accuracy</div>
            <div className="text-2xl font-black text-white">{correctCount} / 5</div>
          </div>
        </div>

        <button
          onClick={startBlitz}
          className="px-8 py-3 bg-[#1F6FEB] hover:bg-[#388BFD] text-white font-medium text-sm rounded-xl transition-all cursor-pointer shadow-lg"
        >
          Play Another Blitz
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Blitz Header Bar */}
      <div className="flex items-center justify-between text-xs font-mono bg-[#161B22] p-3 rounded-xl border border-[#30363D]">
        <div className="flex items-center gap-2 text-[#D29922]">
          <Zap className="w-4 h-4" />
          <span>BLITZ ROUND {currentRoundIdx + 1} OF 5</span>
        </div>
        <div className="text-[#3FB950] font-bold">
          TOTAL: {totalScore} pts
        </div>
      </div>

      {currentPuzzle && (
        <div className="flex flex-col gap-5">
          <TimerBar remainingSec={remainingSec} totalSec={15} />

          <CodeViewer
            code={currentPuzzle.code}
            language={currentPuzzle.language}
            questionType={currentPuzzle.type}
            selectedLine={selectedLine || undefined}
            onSelectLine={l => setSelectedLine(l)}
            fontSize={fontSize}
          />

          <QuestionBox
            puzzle={currentPuzzle}
            selectedOption={selectedOption}
            selectedLine={selectedLine}
            onSelectOption={opt => setSelectedOption(opt)}
            onSubmit={handleSubmit}
          />
        </div>
      )}

      {/* Reveal Modal */}
      {currentPuzzle && (
        <RevealModal
          isOpen={gameState === 'revealed'}
          isCorrect={isCorrect}
          puzzle={currentPuzzle}
          userAnswer={currentPuzzle.type === 'click_line' ? String(selectedLine) : selectedOption || ''}
          pointsEarned={roundScore}
          timeRemainingSec={remainingSec}
          streakCount={userStats.streak}
          newBadges={unlockedBadges}
          onNext={handleNextRound}
          nextButtonLabel={currentRoundIdx + 1 < roundPuzzles.length ? 'Next Blitz Round' : 'See Blitz Results'}
        />
      )}
    </div>
  );
};
