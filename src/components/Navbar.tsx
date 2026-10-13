import React from 'react';
import { GameView, UserStats } from '../types/game';
import { Bug, Volume2, VolumeX, Flame, Trophy, Award, BookOpen, Zap, Users, Calendar, Code, ChevronRight } from 'lucide-react';
import { playClick } from '../lib/audio';
import { SUPPORTED_LANGUAGES, RANDOM_LANGUAGE } from '../lib/languages';

interface NavbarProps {
  currentView: GameView;
  onNavigate: (view: GameView) => void;
  userStats: UserStats;
  isMuted: boolean;
  onToggleMute: () => void;
  fontSize: 'sm' | 'md' | 'lg';
  onChangeFontSize: (size: 'sm' | 'md' | 'lg') => void;
  selectedLanguage: string | null;
  onChangeLanguage: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  userStats,
  isMuted,
  onToggleMute,
  fontSize,
  onChangeFontSize,
  selectedLanguage,
  onChangeLanguage
}) => {
  const navItems: { view: GameView; label: string; icon: React.ReactNode }[] = [
    { view: 'daily', label: 'Daily Bug', icon: <Calendar className="w-4 h-4" /> },
    { view: 'multiplayer', label: 'Multiplayer 1v1', icon: <Users className="w-4 h-4" /> },
    { view: 'practice', label: 'Practice Hub', icon: <BookOpen className="w-4 h-4" /> },
    { view: 'speedrun', label: 'Speed Blitz', icon: <Zap className="w-4 h-4" /> },
    { view: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
    { view: 'profile', label: 'Profile', icon: <Award className="w-4 h-4" /> }
  ];

  const currentLangObj = selectedLanguage === 'random'
    ? RANDOM_LANGUAGE
    : SUPPORTED_LANGUAGES.find(l => l.id === selectedLanguage);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#30363D] bg-[#0D1117]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Language Switcher Pill */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playClick();
              onNavigate('home');
            }}
            className="flex items-center gap-2.5 text-left group focus:outline-none cursor-pointer"
          >
            <div className="w-9 h-9 rounded-md bg-[#58A6FF]/10 border border-[#58A6FF]/30 flex items-center justify-center text-[#58A6FF] group-hover:border-[#58A6FF] transition-all">
              <Bug className="w-5 h-5 transition-transform group-hover:rotate-12" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-white tracking-tight text-base font-mono">
                Guess The Bug<span className="text-[#58A6FF]">!</span>
              </div>
              <div className="text-[11px] text-[#8B949E] -mt-0.5 hidden sm:block">
                Code Debugging Trivia
              </div>
            </div>
          </button>

          {/* Change Language Button in Navbar */}
          {selectedLanguage && (
            <button
              onClick={() => {
                playClick();
                onChangeLanguage();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[#30363D] bg-[#161B22] hover:border-[#58A6FF]/60 hover:bg-[#21262D] transition-all text-xs font-mono group cursor-pointer shadow-sm"
              title="Click to switch language"
            >
              <div
                className="w-3.5 h-3.5 rounded flex items-center justify-center overflow-hidden"
                style={{ color: currentLangObj?.color || '#58A6FF' }}
              >
                <Code className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold text-white">
                {currentLangObj?.name || selectedLanguage}
              </span>
              <span className="text-[10px] text-[#58A6FF] group-hover:underline flex items-center">
                <span>Change</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </button>
          )}
        </div>

        {/* Navigation Tabs (Segmented control) */}
        <nav className="hidden lg:flex items-center gap-1 p-1 bg-[#161B22] border border-[#30363D] rounded-lg">
          {navItems.map(item => {
            const active = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => {
                  playClick();
                  onNavigate(item.view);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  active
                    ? 'bg-[#21262D] text-[#58A6FF] shadow-sm border border-[#388BFD]/30'
                    : 'text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#21262D]/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Utility Bar: Streak, Font-size, Sound, Profile preview */}
        <div className="flex items-center gap-3">
          {/* Daily Streak */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#D29922] px-2.5 py-1 bg-[#D29922]/10 border border-[#D29922]/20 rounded-md">
            <Flame className="w-3.5 h-3.5 fill-[#D29922]" />
            <span className="font-semibold">{userStats.streak}</span>
            <span className="hidden sm:inline text-[#8B949E]">streak</span>
          </div>

          {/* Code font size toggle */}
          <div className="hidden sm:flex items-center bg-[#161B22] border border-[#30363D] rounded-md p-0.5 text-xs font-mono text-[#8B949E]">
            {(['sm', 'md', 'lg'] as const).map(s => (
              <button
                key={s}
                onClick={() => {
                  playClick();
                  onChangeFontSize(s);
                }}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  fontSize === s ? 'bg-[#30363D] text-white font-semibold' : 'hover:text-[#C9D1D9]'
                }`}
                title={`Code font size: ${s.toUpperCase()}`}
              >
                {s === 'sm' ? 'A' : s === 'md' ? 'A+' : 'A++'}
              </button>
            ))}
          </div>

          {/* Sound Mute Toggle */}
          <button
            onClick={() => {
              playClick();
              onToggleMute();
            }}
            className="w-8 h-8 rounded-md border border-[#30363D] bg-[#161B22] flex items-center justify-center text-[#8B949E] hover:text-white hover:border-[#8B949E] transition-all cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-[#F85149]" /> : <Volume2 className="w-4 h-4 text-[#3FB950]" />}
          </button>

          {/* Profile Quick Pill */}
          <button
            onClick={() => {
              playClick();
              onNavigate('profile');
            }}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-md border border-[#30363D] bg-[#161B22] hover:border-[#58A6FF]/50 transition-all text-xs cursor-pointer"
          >
            <span className="text-base">{userStats.avatar}</span>
            <span className="hidden md:inline font-mono font-medium text-white truncate max-w-[90px]">
              {userStats.username}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 bg-[#238636]/20 border border-[#238636]/40 text-[#3FB950] font-mono rounded">
              Lvl {userStats.level}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden border-t border-[#21262D] px-3 py-1.5 flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
        {navItems.map(item => {
          const active = currentView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => {
                playClick();
                onNavigate(item.view);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs whitespace-nowrap rounded font-medium transition-all ${
                active
                  ? 'bg-[#21262D] text-[#58A6FF] border border-[#388BFD]/30'
                  : 'text-[#8B949E] hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
