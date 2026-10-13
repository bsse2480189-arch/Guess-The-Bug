import React, { useState } from 'react';
import { UserStats } from '../types/game';
import { ALL_BADGES, saveUserStats } from '../lib/storage';
import { playClick } from '../lib/audio';
import { Award, Check, Edit2, Flame, Shield, Trophy, Zap, Terminal } from 'lucide-react';

interface ProfileViewProps {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
}

const AVATAR_OPTIONS = ['👨‍💻', '👩‍💻', '👾', '🤖', '🐧', '🦀', '☕', '🐍', '⚡', '🧙‍♂️', '🥷', '🦊'];

export const ProfileView: React.FC<ProfileViewProps> = ({ userStats, onUpdateStats }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userStats.username);
  const [selectedAvatar, setSelectedAvatar] = useState(userStats.avatar);

  const handleSaveProfile = () => {
    playClick();
    const updated = {
      ...userStats,
      username: tempName.trim() || userStats.username,
      avatar: selectedAvatar
    };
    onUpdateStats(updated);
    saveUserStats(updated);
    setIsEditingName(false);
  };

  const accuracy = userStats.totalPlayed > 0
    ? Math.round((userStats.totalCorrect / userStats.totalPlayed) * 100)
    : 0;

  // Level progress
  const currentLevel = userStats.level;
  const currentLevelBaseXP = Math.pow(currentLevel - 1, 2) * 100;
  const nextLevelXP = Math.pow(currentLevel, 2) * 100;
  const levelProgress = Math.min(100, Math.max(0, ((userStats.xp - currentLevelBaseXP) / (nextLevelXP - currentLevelBaseXP)) * 100));

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Profile Header Card */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-5">
          {/* Avatar with selector dropdown */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-[#0D1117] border-2 border-[#58A6FF]/40 flex items-center justify-center text-4xl shadow-inner">
              {userStats.avatar}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={e => setTempName(e.target.value)}
                    className="px-2 py-1 bg-[#0D1117] border border-[#58A6FF] rounded font-mono text-sm text-white outline-none"
                    maxLength={16}
                  />
                  <button
                    onClick={handleSaveProfile}
                    className="p-1 bg-[#238636] hover:bg-[#2EA043] rounded text-white"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white font-mono">
                    {userStats.username}
                  </h1>
                  <button
                    onClick={() => {
                      playClick();
                      setIsEditingName(true);
                    }}
                    className="text-[#8B949E] hover:text-white p-1 rounded transition-colors"
                    title="Change username"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#8B949E]">
              <span className="text-[#3FB950] font-semibold">Level {userStats.level}</span>
              <span aria-hidden="true">·</span>
              <span>ELO Rating: <strong className="text-white">{userStats.elo}</strong></span>
              <span aria-hidden="true">·</span>
              <span>{userStats.xp} Total XP</span>
            </div>

            {/* Level XP Bar */}
            <div className="w-48 sm:w-64 h-2 bg-[#0D1117] rounded-full overflow-hidden border border-[#30363D] mt-2">
              <div
                className="h-full bg-[#58A6FF] rounded-full transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Avatar Quick Switch */}
        <div className="flex flex-wrap gap-1.5 max-w-[200px] bg-[#0D1117] p-2 rounded-xl border border-[#30363D]">
          {AVATAR_OPTIONS.slice(0, 8).map(av => (
            <button
              key={av}
              onClick={() => {
                playClick();
                setSelectedAvatar(av);
                const updated = { ...userStats, avatar: av };
                onUpdateStats(updated);
                saveUserStats(updated);
              }}
              className={`w-7 h-7 rounded flex items-center justify-center text-sm transition-transform hover:scale-110 ${
                userStats.avatar === av ? 'bg-[#58A6FF]/20 border border-[#58A6FF]' : 'hover:bg-[#21262D]'
              }`}
            >
              {av}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards (Zero-pill discipline) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 flex flex-col gap-1">
          <span className="text-xs font-mono text-[#8B949E]">Bugs Squashed</span>
          <span className="text-2xl font-black font-mono text-white">
            {userStats.totalCorrect}
          </span>
          <span className="text-[11px] text-[#8B949E]">{userStats.totalPlayed} attempted</span>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 flex flex-col gap-1">
          <span className="text-xs font-mono text-[#8B949E]">Accuracy Rate</span>
          <span className="text-2xl font-black font-mono text-[#3FB950]">
            {accuracy}%
          </span>
          <span className="text-[11px] text-[#8B949E]">Success ratio</span>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 flex flex-col gap-1">
          <span className="text-xs font-mono text-[#8B949E]">Current Streak</span>
          <span className="text-2xl font-black font-mono text-[#D29922] flex items-center gap-1">
            <Flame className="w-5 h-5 fill-[#D29922]" /> {userStats.streak}
          </span>
          <span className="text-[11px] text-[#8B949E]">Best: {userStats.bestStreak}</span>
        </div>

        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 flex flex-col gap-1">
          <span className="text-xs font-mono text-[#8B949E]">Multiplayer ELO</span>
          <span className="text-2xl font-black font-mono text-[#58A6FF]">
            {userStats.elo}
          </span>
          <span className="text-[11px] text-[#8B949E]">Competitive rank</span>
        </div>
      </div>

      {/* Language Breakdown */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 flex flex-col gap-4 shadow-xl">
        <h3 className="font-bold text-white text-base font-mono flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#58A6FF]" />
          <span>Language Mastery Breakdown</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {(['python', 'javascript', 'cpp', 'java'] as const).map(lang => {
            const stat = userStats.languageStats[lang] || { played: 0, correct: 0 };
            const rate = stat.played > 0 ? Math.round((stat.correct / stat.played) * 100) : 0;
            const labels = {
              python: { name: 'Python', color: '#3572A5' },
              javascript: { name: 'JavaScript', color: '#F7DF1E' },
              cpp: { name: 'C++', color: '#F34B7D' },
              java: { name: 'Java', color: '#B07219' }
            }[lang];

            return (
              <div key={lang} className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3.5 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-white">{labels.name}</span>
                  <span className="text-[#8B949E]">{stat.correct} / {stat.played}</span>
                </div>
                <div className="w-full h-1.5 bg-[#21262D] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${rate}%`, backgroundColor: labels.color }}
                  />
                </div>
                <div className="text-[11px] font-mono text-[#8B949E] text-right">
                  {rate}% accuracy
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges Showcase */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-6 flex flex-col gap-4 shadow-xl">
        <h3 className="font-bold text-white text-base font-mono flex items-center gap-2">
          <Award className="w-4 h-4 text-[#D29922]" />
          <span>Earned Badges ({userStats.badges.length}/{ALL_BADGES.length})</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {ALL_BADGES.map(badge => {
            const isUnlocked = userStats.badges.includes(badge.id);

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                  isUnlocked
                    ? 'bg-[#0D1117] border-[#30363D] text-white'
                    : 'bg-[#0D1117]/40 border-[#21262D] opacity-45'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#161B22] flex items-center justify-center text-xl shrink-0">
                  {badge.icon}
                </div>
                <div className="flex flex-col">
                  <div className="font-semibold text-xs text-white">
                    {badge.name}
                  </div>
                  <div className="text-[11px] text-[#8B949E] leading-snug">
                    {badge.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
