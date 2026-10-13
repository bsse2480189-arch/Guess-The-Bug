import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, UserStats } from '../types/game';
import { Trophy, Medal, Flame, Zap, Shield, Crown } from 'lucide-react';
import { playClick } from '../lib/audio';

interface LeaderboardViewProps {
  userStats: UserStats;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ userStats }) => {
  const [tab, setTab] = useState<'daily' | 'weekly' | 'all-time'>('all-time');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/leaderboard?type=${tab}`)
      .then(res => res.json())
      .then(data => {
        if (data.entries) {
          setEntries(data.entries);
        }
      })
      .catch(() => {
        // Fallback default
        setEntries([
          { id: '1', username: 'Linus_Bugsquash', avatar: '🐧', score: 14850, streak: 18, elo: 1850, solvedCount: 142, createdAt: Date.now() },
          { id: '2', username: 'ByteNinja', avatar: '🥷', score: 12900, streak: 14, elo: 1720, solvedCount: 119, createdAt: Date.now() },
          { id: '3', username: 'NullPointerQueen', avatar: '👑', score: 11400, streak: 12, elo: 1680, solvedCount: 98, createdAt: Date.now() },
          { id: '4', username: 'Rustacean_Crab', avatar: '🦀', score: 9850, streak: 9, elo: 1540, solvedCount: 84, createdAt: Date.now() },
          { id: '5', username: userStats.username, avatar: userStats.avatar, score: userStats.xp, streak: userStats.streak, elo: userStats.elo, solvedCount: userStats.totalCorrect, createdAt: Date.now() }
        ]);
      })
      .finally(() => setIsLoading(false));
  }, [tab, userStats]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#30363D]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#58A6FF]">
            <Trophy className="w-4 h-4" />
            <span>GLOBAL DEVELOPER STANDINGS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-[#8B949E] mt-0.5">
            Ranked by overall debugging score, accuracy, and multiplayer ELO rating.
          </p>
        </div>

        {/* Tab segmented control */}
        <div className="flex items-center gap-1 p-1 bg-[#161B22] border border-[#30363D] rounded-lg">
          {(['daily', 'weekly', 'all-time'] as const).map(t => (
            <button
              key={t}
              onClick={() => {
                playClick();
                setTab(t);
              }}
              className={`px-3 py-1.5 text-xs font-mono font-medium rounded-md transition-all capitalize ${
                tab === t
                  ? 'bg-[#21262D] text-[#58A6FF] border border-[#58A6FF]/30'
                  : 'text-[#8B949E] hover:text-white'
              }`}
            >
              {t.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium Highlights */}
      {!isLoading && entries.length >= 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Rank 2 */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 flex flex-col items-center text-center gap-2 order-2 sm:order-1">
            <div className="text-xs font-mono text-[#8B949E] flex items-center gap-1">
              🥈 2nd Place
            </div>
            <div className="text-3xl">{entries[1]?.avatar || '🥈'}</div>
            <div className="font-mono text-sm font-bold text-white truncate max-w-full">
              {entries[1]?.username}
            </div>
            <div className="font-mono text-sm font-black text-[#58A6FF]">
              {entries[1]?.score} pts
            </div>
          </div>

          {/* Rank 1 */}
          <div className="bg-[#1F6FEB]/10 border border-[#58A6FF]/40 rounded-xl p-5 flex flex-col items-center text-center gap-2 order-1 sm:order-2 shadow-xl -mt-2">
            <div className="text-xs font-mono text-[#D29922] font-bold flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 fill-[#D29922]" /> 1st Place
            </div>
            <div className="text-4xl">{entries[0]?.avatar || '👑'}</div>
            <div className="font-mono text-base font-bold text-white truncate max-w-full">
              {entries[0]?.username}
            </div>
            <div className="font-mono text-lg font-black text-[#3FB950]">
              {entries[0]?.score} pts
            </div>
          </div>

          {/* Rank 3 */}
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 flex flex-col items-center text-center gap-2 order-3 sm:order-3">
            <div className="text-xs font-mono text-[#8B949E] flex items-center gap-1">
              🥉 3rd Place
            </div>
            <div className="text-3xl">{entries[2]?.avatar || '🥉'}</div>
            <div className="font-mono text-sm font-bold text-white truncate max-w-full">
              {entries[2]?.username}
            </div>
            <div className="font-mono text-sm font-black text-[#58A6FF]">
              {entries[2]?.score} pts
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table List */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden shadow-xl">
        <div className="divide-y divide-[#21262D]">
          {isLoading ? (
            <div className="p-8 text-center text-xs font-mono text-[#8B949E]">
              Loading rankings...
            </div>
          ) : entries.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-[#8B949E]">
              No entries logged for this period yet. Be the first!
            </div>
          ) : (
            entries.map((entry, idx) => {
              const rank = idx + 1;
              const isCurrentUser = entry.username.toLowerCase() === userStats.username.toLowerCase();

              return (
                <div
                  key={entry.id || idx}
                  className={`p-4 flex items-center justify-between transition-colors ${
                    isCurrentUser
                      ? 'bg-[#1F6FEB]/10 border-l-4 border-l-[#58A6FF]'
                      : 'hover:bg-[#0D1117]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-mono font-bold text-xs text-[#8B949E]">
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                    </span>
                    <span className="text-2xl">{entry.avatar}</span>
                    <div>
                      <div className="font-mono text-sm font-semibold text-white flex items-center gap-1.5">
                        <span>{entry.username}</span>
                        {isCurrentUser && (
                          <span className="text-[10px] text-[#58A6FF] font-normal">(You)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-[#8B949E]">
                        <span>ELO: {entry.elo}</span>
                        <span aria-hidden="true">·</span>
                        <span>{entry.solvedCount} squashes</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right font-mono">
                    {entry.streak > 0 && (
                      <div className="hidden sm:flex items-center gap-1 text-xs text-[#D29922]">
                        <Flame className="w-3.5 h-3.5 fill-[#D29922]" />
                        <span>{entry.streak}</span>
                      </div>
                    )}
                    <div className="text-base font-bold text-[#3FB950]">
                      {entry.score} <span className="text-xs font-normal text-[#8B949E]">pts</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
