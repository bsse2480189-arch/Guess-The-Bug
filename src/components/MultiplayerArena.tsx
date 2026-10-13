import React, { useState, useEffect } from 'react';
import { GameRoom, Puzzle, UserStats } from '../types/game';
import { CodeViewer } from './CodeViewer';
import { TimerBar } from './TimerBar';
import { QuestionBox } from './QuestionBox';
import confetti from 'canvas-confetti';
import { playSquash, playError, playVictory } from '../lib/audio';
import { Heart, Trophy, Swords, Zap, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface MultiplayerArenaProps {
  room: GameRoom;
  socketId: string;
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  onSubmitAnswer: (answer: string, remainingSec: number) => void;
  onLeaveRoom: () => void;
  fontSize: 'sm' | 'md' | 'lg';
}

export const MultiplayerArena: React.FC<MultiplayerArenaProps> = ({
  room,
  socketId,
  userStats,
  onUpdateStats,
  onSubmitAnswer,
  onLeaveRoom,
  fontSize
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [hasSubmittedThisRound, setHasSubmittedThisRound] = useState<boolean>(false);
  const [remainingSec, setRemainingSec] = useState<number>(30);

  const players = Object.values(room.players);
  const myPlayer = room.players[socketId];
  const puzzle = room.currentPuzzle;

  // Reset local answer selection upon new round
  useEffect(() => {
    setSelectedOption(null);
    setSelectedLine(null);
    setHasSubmittedThisRound(false);
    setRemainingSec(room.roundDurationSec);
  }, [room.currentRound]);

  // Round local countdown synchronized with roundStartTime
  useEffect(() => {
    if (room.status !== 'in_round') return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - room.roundStartTime) / 1000);
      const remaining = Math.max(0, room.roundDurationSec - elapsed);
      setRemainingSec(remaining);
    }, 250);

    return () => clearInterval(interval);
  }, [room.status, room.roundStartTime, room.roundDurationSec]);

  // Trigger celebration on match victory
  useEffect(() => {
    if (room.status === 'finished') {
      if (room.winnerId === socketId) {
        playVictory();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  }, [room.status, room.winnerId, socketId]);

  const handleSubmit = () => {
    if (hasSubmittedThisRound || !puzzle) return;
    const answer = puzzle.type === 'click_line'
      ? String(selectedLine)
      : selectedOption || '';

    setHasSubmittedThisRound(true);
    onSubmitAnswer(answer, remainingSec);
  };

  // 1. Finished match screen
  if (room.status === 'finished') {
    const isWinner = room.winnerId === socketId;
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6 animate-in fade-in">
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center gap-6 shadow-2xl">
          <div className="w-20 h-20 rounded-2xl bg-[#58A6FF]/10 text-4xl flex items-center justify-center border border-[#58A6FF]/30">
            {isWinner ? '🏆' : '⚔️'}
          </div>

          <div>
            <div className="text-xs font-mono text-[#8B949E] uppercase tracking-widest">
              Match Completed
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">
              {isWinner ? 'Victory is Yours!' : 'Match Over'}
            </h1>
            <p className="text-xs sm:text-sm text-[#8B949E] mt-1">
              {isWinner ? 'You out-debugged the competition!' : 'Great game — practice more to climb the leaderboard'}
            </p>
          </div>

          {/* Final Standings */}
          <div className="w-full max-w-md flex flex-col gap-2.5">
            {sortedPlayers.map((p, idx) => {
              const isMe = p.id === socketId;
              return (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between font-mono text-sm ${
                    idx === 0
                      ? 'bg-[#238636]/15 border-[#238636]/40 text-white'
                      : 'bg-[#0D1117] border-[#30363D] text-[#8B949E]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-xs text-[#58A6FF]">#{idx + 1}</span>
                    <span className="text-xl">{p.avatar}</span>
                    <div className="text-left">
                      <div className="font-semibold text-white">
                        {p.username} {isMe && '(You)'}
                      </div>
                      <div className="text-[11px] text-[#8B949E]">
                        {p.lives > 0 ? `${p.lives} lives remaining` : 'Eliminated'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black text-[#3FB950]">{p.score} pts</div>
                    <div className="text-[11px] text-[#8B949E]">ELO {p.elo}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={onLeaveRoom}
            className="px-8 py-3 bg-[#1F6FEB] hover:bg-[#388BFD] text-white font-medium text-sm rounded-xl transition-all cursor-pointer shadow-lg"
          >
            Return to Multiplayer Lobby
          </button>
        </div>
      </div>
    );
  }

  // 2. Countdown between rounds or game start
  if (room.status === 'countdown') {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-16 text-center flex flex-col items-center justify-center gap-4">
        <div className="text-xs font-mono text-[#58A6FF] uppercase tracking-widest">
          Multiplayer Showdown
        </div>
        <div className="text-6xl font-black font-mono text-white animate-pulse">
          Round 1 Incoming...
        </div>
        <div className="text-xs text-[#8B949E]">
          5 rounds · 3 lives each · First to answer gets speed bonus
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 flex flex-col gap-5">
      {/* Live Match Arena Header & Lives / Score Bar */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-[#58A6FF]">
            <Swords className="w-4 h-4" />
            <span>ROUND {room.currentRound} OF {room.totalRounds}</span>
          </div>

          <div className="flex items-center gap-4 text-[#8B949E]">
            <span>ROOM: <strong className="text-white">{room.code}</strong></span>
          </div>
        </div>

        {/* Real-time Player Status Cards (Side by Side) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {players.map(p => {
            const isMe = p.id === socketId;
            return (
              <div
                key={p.id}
                className={`p-3 rounded-xl border flex flex-col gap-2 ${
                  isMe
                    ? 'bg-[#1F6FEB]/10 border-[#58A6FF]/40'
                    : 'bg-[#0D1117] border-[#30363D]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{p.avatar}</span>
                    <span className="font-mono text-xs font-semibold text-white truncate max-w-[100px]">
                      {p.username} {isMe && '(You)'}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-xs text-[#3FB950]">
                    {p.score} pts
                  </span>
                </div>

                {/* Hearts / Lives */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map(heartIdx => (
                      <Heart
                        key={heartIdx}
                        className={`w-3.5 h-3.5 ${
                          heartIdx <= p.lives
                            ? 'text-[#F85149] fill-[#F85149]'
                            : 'text-[#484F58]'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-[11px] font-mono text-[#8B949E]">
                    {p.hasAnsweredCurrentRound
                      ? '⚡ Locked In'
                      : p.lives <= 0
                      ? '💀 Out'
                      : 'Thinking...'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Gameplay Area */}
      {puzzle && (
        <div className="flex flex-col gap-5">
          <TimerBar
            remainingSec={remainingSec}
            totalSec={room.roundDurationSec}
            isPaused={room.status === 'round_reveal'}
          />

          <CodeViewer
            code={puzzle.code}
            language={puzzle.language}
            questionType={puzzle.type}
            selectedLine={selectedLine || undefined}
            onSelectLine={l => !hasSubmittedThisRound && setSelectedLine(l)}
            isRevealed={room.status === 'round_reveal'}
            actualBugLine={puzzle.bugLine}
            fontSize={fontSize}
            interactive={!hasSubmittedThisRound && room.status === 'in_round'}
          />

          {room.status === 'in_round' ? (
            <QuestionBox
              puzzle={puzzle}
              selectedOption={selectedOption}
              selectedLine={selectedLine}
              onSelectOption={opt => setSelectedOption(opt)}
              onSubmit={handleSubmit}
              disabled={hasSubmittedThisRound || (myPlayer && myPlayer.lives <= 0)}
              isSubmitting={hasSubmittedThisRound}
            />
          ) : (
            // Round Reveal Cooldown State
            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 flex flex-col gap-3 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#58A6FF] font-bold">
                  ROUND {room.currentRound} REVEAL
                </span>
                <span className="text-xs font-mono text-[#8B949E]">
                  Next round starting in 5s...
                </span>
              </div>
              <div className="text-sm text-[#C9D1D9]">
                <strong>Correct Answer:</strong> {puzzle.correctAnswer}
              </div>
              <p className="text-xs text-[#8B949E] leading-relaxed">
                {puzzle.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
