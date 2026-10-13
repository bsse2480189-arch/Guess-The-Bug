import React, { useState, useEffect, useRef } from 'react';
import { Puzzle, UserStats } from '../types/game';
import { ALL_PUZZLES } from '../data/puzzles';
import { getTodayDateString, recordPuzzleResult } from '../lib/storage';
import { CodeViewer } from './CodeViewer';
import { TimerBar } from './TimerBar';
import { QuestionBox } from './QuestionBox';
import { RevealModal } from './RevealModal';
import { ShareModal } from './ShareModal';
import { playCountdown, playVictory } from '../lib/audio';
import { Calendar, Clock, Trophy, Share2, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';

interface DailyGameProps {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  fontSize: 'sm' | 'md' | 'lg';
}

export const DailyGame: React.FC<DailyGameProps> = ({
  userStats,
  onUpdateStats,
  fontSize
}) => {
  const today = getTodayDateString();
  const alreadyPlayedToday = userStats.dailyCompletedDates.includes(today);

  // Pick deterministic daily puzzle
  const [dailyPuzzle, setDailyPuzzle] = useState<Puzzle>(() => {
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = (hash * 31 + today.charCodeAt(i)) >>> 0;
    }
    return ALL_PUZZLES[hash % ALL_PUZZLES.length];
  });

  const [gameState, setGameState] = useState<'intro' | 'countdown' | 'playing' | 'revealed' | 'already_done'>(
    alreadyPlayedToday ? 'already_done' : 'intro'
  );

  const [countdownNum, setCountdownNum] = useState<number>(3);
  const [remainingSec, setRemainingSec] = useState<number>(60);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [pointsEarned, setPointsEarned] = useState<number>(0);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [unlockedBadges, setUnlockedBadges] = useState<any[]>([]);
  const [timeUntilReset, setTimeUntilReset] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate time until midnight UTC
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
      const diffMs = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeUntilReset(`${hours}h ${mins}m ${secs}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // 3-2-1 Countdown before round start
  useEffect(() => {
    if (gameState === 'countdown') {
      playCountdown(countdownNum === 1);
      if (countdownNum > 1) {
        const timer = setTimeout(() => {
          setCountdownNum(prev => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => {
          setGameState('playing');
          setRemainingSec(60);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState, countdownNum]);

  // Round 60-second Timer
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setRemainingSec(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const handleStartCountdown = () => {
    setCountdownNum(3);
    setGameState('countdown');
  };

  const handleTimeout = () => {
    setIsCorrect(false);
    setPointsEarned(0);
    setGameState('revealed');

    const { updatedStats } = recordPuzzleResult(
      userStats,
      dailyPuzzle.language,
      false,
      60,
      0,
      true
    );
    onUpdateStats(updatedStats);
  };

  const handleSubmitAnswer = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const answer = dailyPuzzle.type === 'click_line'
      ? String(selectedLine)
      : selectedOption || '';

    const correct = answer.trim() === String(dailyPuzzle.correctAnswer).trim();
    const timeTaken = 60 - remainingSec;

    let pts = 0;
    if (correct) {
      pts = 100 + Math.max(0, remainingSec * 5);
      if (timeTaken < 5) pts += 25;
      if (userStats.streak >= 3) pts += 50;
    }

    setIsCorrect(correct);
    setPointsEarned(pts);
    setGameState('revealed');

    const { updatedStats, newBadges } = recordPuzzleResult(
      userStats,
      dailyPuzzle.language,
      correct,
      timeTaken,
      pts,
      true
    );
    onUpdateStats(updatedStats);
    setUnlockedBadges(newBadges);

    // Sync to global leaderboard in background
    fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: updatedStats.username,
        score: updatedStats.xp,
        streak: updatedStats.streak,
        avatar: updatedStats.avatar,
        elo: updatedStats.elo
      })
    }).catch(() => {});
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Daily Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#30363D]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#58A6FF]">
            <Calendar className="w-4 h-4" />
            <span>DAILY BUG CHALLENGE · {today}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Today's Broken Snippet
          </h1>
          <p className="text-xs sm:text-sm text-[#8B949E] mt-0.5">
            Single attempt · 60 seconds · Resets at midnight UTC
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161B22] border border-[#30363D] rounded-lg text-xs font-mono text-[#8B949E]">
            <Clock className="w-4 h-4 text-[#D29922]" />
            <span>Resets in: <strong className="text-white">{timeUntilReset}</strong></span>
          </div>
        </div>
      </div>

      {/* Screen 1: Intro State */}
      {gameState === 'intro' && (
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#58A6FF]/10 border border-[#58A6FF]/30 flex items-center justify-center text-3xl">
            🐛
          </div>

          <div className="max-w-md">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Ready for Daily #{today}?
            </h2>
            <p className="text-sm text-[#8B949E] leading-relaxed">
              You will have exactly 60 seconds to inspect broken code, find the flaw, and lock in your answer. High accuracy protects your daily streak!
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-[#8B949E]">
            <span className="bg-[#0D1117] px-3 py-1.5 rounded border border-[#30363D]">
              Language: <strong className="text-white uppercase">{dailyPuzzle.language}</strong>
            </span>
            <span className="bg-[#0D1117] px-3 py-1.5 rounded border border-[#30363D]">
              Difficulty: <strong className="text-white capitalize">{dailyPuzzle.difficulty}</strong>
            </span>
            <span className="bg-[#0D1117] px-3 py-1.5 rounded border border-[#30363D]">
              Reward: <strong className="text-[#3FB950] font-bold">100+ pts</strong>
            </span>
          </div>

          <button
            onClick={handleStartCountdown}
            className="px-8 py-3.5 bg-[#238636] hover:bg-[#2EA043] text-white font-bold text-base rounded-xl shadow-lg shadow-[#238636]/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Start Daily Challenge
          </button>
        </div>
      )}

      {/* Screen 2: 3-2-1 Countdown */}
      {gameState === 'countdown' && (
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-16 text-center flex flex-col items-center justify-center gap-4 min-h-[360px]">
          <div className="text-xs font-mono text-[#58A6FF] uppercase tracking-widest">
            Round starting in
          </div>
          <div className="text-7xl sm:text-8xl font-black font-mono text-white animate-pulse">
            {countdownNum}
          </div>
          <div className="text-xs text-[#8B949E]">
            Prepare your dev eyes...
          </div>
        </div>
      )}

      {/* Screen 3: Playing State */}
      {gameState === 'playing' && (
        <div className="flex flex-col gap-5">
          <TimerBar remainingSec={remainingSec} totalSec={60} />

          <CodeViewer
            code={dailyPuzzle.code}
            language={dailyPuzzle.language}
            questionType={dailyPuzzle.type}
            selectedLine={selectedLine || undefined}
            onSelectLine={l => setSelectedLine(l)}
            fontSize={fontSize}
          />

          <QuestionBox
            puzzle={dailyPuzzle}
            selectedOption={selectedOption}
            selectedLine={selectedLine}
            onSelectOption={opt => setSelectedOption(opt)}
            onSubmit={handleSubmitAnswer}
          />
        </div>
      )}

      {/* Screen 4: Already Done / Finished Today */}
      {(gameState === 'already_done' || gameState === 'revealed') && (
        <div className="flex flex-col gap-6">
          <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#238636]/20 border border-[#238636]/40 flex items-center justify-center text-2xl text-[#3FB950]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Daily Challenge Completed!
                </h3>
                <p className="text-xs text-[#8B949E]">
                  You have logged today's result. Next puzzle unlocks at midnight UTC.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowShareModal(true)}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#1F6FEB] hover:bg-[#388BFD] text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Daily Result</span>
            </button>
          </div>

          {/* Inspect today's code solution */}
          <div className="flex flex-col gap-3">
            <div className="text-xs font-mono text-[#8B949E] uppercase tracking-wider">
              Today's Puzzle Solution Review
            </div>
            <CodeViewer
              code={dailyPuzzle.code}
              language={dailyPuzzle.language}
              questionType={dailyPuzzle.type}
              isRevealed={true}
              actualBugLine={dailyPuzzle.bugLine}
              fontSize={fontSize}
              interactive={false}
            />

            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 flex flex-col gap-2">
              <div className="text-xs font-mono text-[#58A6FF] font-semibold">
                EXPLANATION & ANALYSIS
              </div>
              <p className="text-sm text-[#C9D1D9] leading-relaxed">
                {dailyPuzzle.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reveal Modal */}
      <RevealModal
        isOpen={gameState === 'revealed'}
        isCorrect={isCorrect}
        puzzle={dailyPuzzle}
        userAnswer={dailyPuzzle.type === 'click_line' ? String(selectedLine) : selectedOption || ''}
        pointsEarned={pointsEarned}
        timeRemainingSec={remainingSec}
        streakCount={userStats.streak}
        newBadges={unlockedBadges}
        onNext={() => {
          setGameState('already_done');
          setShowShareModal(true);
        }}
        nextButtonLabel="View Results & Share"
      />

      {/* Share Result Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        dayString={today}
        isCorrect={isCorrect || alreadyPlayedToday}
        timeTakenSec={Math.max(1, 60 - remainingSec)}
        points={pointsEarned}
        streak={userStats.streak}
      />
    </div>
  );
};
