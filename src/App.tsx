import React, { useState, useEffect } from 'react';
import { GameRoom, GameView, UserStats } from './types/game';
import { loadUserStats, saveUserStats, getTodayDateString } from './lib/storage';
import { getSoundMuted, setSoundMuted, playClick } from './lib/audio';
import { getSocket } from './lib/socket';
import { useGameStore } from './store/useGameStore';
import { Navbar } from './components/Navbar';
import { LanguageGrid } from './components/LanguageGrid';
import { DailyGame } from './components/DailyGame';
import { MultiplayerLobby } from './components/MultiplayerLobby';
import { MultiplayerArena } from './components/MultiplayerArena';
import { PracticeHub } from './components/PracticeHub';
import { SpeedrunGame } from './components/SpeedrunGame';
import { LeaderboardView } from './components/LeaderboardView';
import { ProfileView } from './components/ProfileView';
import { CodeViewer } from './components/CodeViewer';
import { ALL_PUZZLES } from './data/puzzles';
import { SUPPORTED_LANGUAGES, RANDOM_LANGUAGE } from './lib/languages';
import { Bug, Calendar, Swords, BookOpen, Zap, Trophy, ArrowRight, ShieldCheck, Check, Sparkles, Code2, RotateCcw } from 'lucide-react';

export default function App() {
  const {
    selectedLanguage,
    setSelectedLanguage,
    hasConfirmedLanguage,
    setHasConfirmedLanguage
  } = useGameStore();

  // If user hasn't selected and confirmed language yet, mandatory first screen is 'language_select'
  const [currentView, setCurrentView] = useState<GameView>(() => {
    return !hasConfirmedLanguage || !selectedLanguage ? 'language_select' : 'home';
  });

  const [userStats, setUserStats] = useState<UserStats>(() => loadUserStats());
  const [isMuted, setIsMuted] = useState<boolean>(() => getSoundMuted());
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');

  // Multiplayer socket state
  const [socketId, setSocketId] = useState<string | null>(null);
  const [room, setRoom] = useState<GameRoom | null>(null);

  // Home interactive demo snippet filtered to selected language
  const [demoSelectedLine, setDemoSelectedLine] = useState<number | null>(null);
  const [demoRevealed, setDemoRevealed] = useState<boolean>(false);

  // Active language object
  const activeLangObj = selectedLanguage === 'random'
    ? RANDOM_LANGUAGE
    : SUPPORTED_LANGUAGES.find(l => l.id === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  // Pick sample puzzle matching selected stack
  const samplePuzzle = ALL_PUZZLES.find(p => p.language === selectedLanguage) || ALL_PUZZLES[0];

  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => {
      setSocketId(socket.id || null);
    });

    socket.on('room_update', ({ room: updatedRoom }: { room: GameRoom }) => {
      setRoom(updatedRoom);
    });

    socket.on('round_start', ({ puzzle }: { puzzle: any }) => {
      setRoom(prev => prev ? { ...prev, currentPuzzle: puzzle, status: 'in_round' } : null);
    });

    socket.on('round_end', () => {
      setRoom(prev => prev ? { ...prev, status: 'round_reveal' } : null);
    });

    socket.on('match_end', () => {
      setRoom(prev => prev ? { ...prev, status: 'finished' } : null);
    });

    return () => {
      socket.off('connect');
      socket.off('room_update');
      socket.off('round_start');
      socket.off('round_end');
      socket.off('match_end');
    };
  }, []);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    setSoundMuted(next);
  };

  const handleUpdateStats = (newStats: UserStats) => {
    setUserStats(newStats);
    saveUserStats(newStats);
  };

  const handleConfirmLanguageStart = () => {
    setHasConfirmedLanguage(true);
    setCurrentView('home');
  };

  const handleChangeLanguage = () => {
    playClick();
    setCurrentView('language_select');
  };

  // Socket action handlers
  const handleJoinMultiplayerRoom = (roomId: string) => {
    const socket = getSocket();
    socket.emit('join_room', {
      roomId,
      username: userStats.username,
      avatar: userStats.avatar,
      elo: userStats.elo
    });
    setCurrentView('multiplayer');
  };

  const handleToggleReady = () => {
    if (!room) return;
    const socket = getSocket();
    socket.emit('ready', { roomId: room.code });
  };

  const handleSubmitMultiplayerAnswer = (answer: string, remainingSec: number) => {
    if (!room) return;
    const socket = getSocket();
    socket.emit('submit_answer', {
      roomId: room.code,
      answer,
      timeRemainingSec: remainingSec
    });
  };

  const handleLeaveRoom = () => {
    if (!room) return;
    const socket = getSocket();
    socket.emit('leave_room', { roomId: room.code });
    setRoom(null);
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#C9D1D9] flex flex-col font-sans selection:bg-[#58A6FF]/30 selection:text-[#58A6FF]">
      {/* Top Navbar: always displays brand, mode links, and Change Language button */}
      <Navbar
        currentView={currentView}
        onNavigate={setCurrentView}
        userStats={userStats}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        selectedLanguage={selectedLanguage}
        onChangeLanguage={handleChangeLanguage}
      />

      {/* Main Content View Switcher */}
      <main className="flex-1 w-full">
        {/* MANDATORY FIRST SCREEN: Language Selection */}
        {currentView === 'language_select' && (
          <LanguageGrid
            selectedLanguageId={selectedLanguage}
            onSelectLanguage={langId => setSelectedLanguage(langId)}
            onConfirmStart={handleConfirmLanguageStart}
          />
        )}

        {/* Home / Mode Selection Dashboard */}
        {currentView === 'home' && (
          <div className="w-full max-w-6xl mx-auto px-4 py-8 sm:py-12 flex flex-col gap-12 sm:gap-16">
            {/* Hero Section */}
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto gap-4">
              {/* Active Language Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#161B22] border border-[#30363D] rounded-full text-xs font-mono text-[#58A6FF] shadow-sm">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeLangObj.color }} />
                <span>Active Stack: <strong className="text-white">{activeLangObj.name}</strong></span>
                <span aria-hidden="true">·</span>
                <button
                  onClick={handleChangeLanguage}
                  className="text-[#58A6FF] hover:underline font-semibold cursor-pointer"
                >
                  Change Language
                </button>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
                Can You Spot <span className="text-[#F85149]">The Bug</span> Before Time Runs Out?
              </h1>

              <p className="text-base sm:text-lg text-[#8B949E] leading-relaxed max-w-2xl">
                The developer trivia game for <strong className="text-white">{activeLangObj.name}</strong> and 15 other languages. Click broken lines, predict tricky outputs, classify runtime errors, and battle colleagues in real-time 1v1 showdowns.
              </p>

              {/* Main Call to Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    playClick();
                    setCurrentView('daily');
                  }}
                  className="px-7 py-3.5 bg-[#238636] hover:bg-[#2EA043] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#238636]/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Play Today's Daily Bug</span>
                </button>

                <button
                  onClick={() => {
                    playClick();
                    setCurrentView('multiplayer');
                  }}
                  className="px-7 py-3.5 bg-[#1F6FEB] hover:bg-[#388BFD] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#1F6FEB]/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Swords className="w-4 h-4" />
                  <span>1v1 Multiplayer Showdown</span>
                </button>
              </div>
            </div>

            {/* Quick Mode Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Daily */}
              <div
                onClick={() => {
                  playClick();
                  setCurrentView('daily');
                }}
                className="bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF]/60 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:-translate-y-1 cursor-pointer group shadow-xl"
              >
                <div className="flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#58A6FF]/10 text-[#58A6FF] flex items-center justify-center text-lg">
                    📅
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-[#58A6FF] transition-colors">
                    Daily Challenge
                  </h3>
                  <p className="text-xs text-[#8B949E] leading-relaxed">
                    One new puzzle every day resetting at midnight UTC. Wordle-style shareable result card.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-mono text-[#58A6FF]">
                  <span>Play Daily</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Multiplayer */}
              <div
                onClick={() => {
                  playClick();
                  setCurrentView('multiplayer');
                }}
                className="bg-[#161B22] border border-[#30363D] hover:border-[#F85149]/60 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:-translate-y-1 cursor-pointer group shadow-xl"
              >
                <div className="flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#F85149]/10 text-[#F85149] flex items-center justify-center text-lg">
                    ⚔️
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-[#F85149] transition-colors">
                    1v1 Multiplayer
                  </h3>
                  <p className="text-xs text-[#8B949E] leading-relaxed">
                    5 rounds, 3 lives, 30s timer. Real-time scores and competitive ELO rating system.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-mono text-[#F85149]">
                  <span>Enter Arena</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Practice */}
              <div
                onClick={() => {
                  playClick();
                  setCurrentView('practice');
                }}
                className="bg-[#161B22] border border-[#30363D] hover:border-[#3FB950]/60 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:-translate-y-1 cursor-pointer group shadow-xl"
              >
                <div className="flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#238636]/10 text-[#3FB950] flex items-center justify-center text-lg">
                    📖
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-[#3FB950] transition-colors">
                    Practice Catalog
                  </h3>
                  <p className="text-xs text-[#8B949E] leading-relaxed">
                    Filter by language (16 stacks), difficulty, and bug topics without timers.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-mono text-[#3FB950]">
                  <span>Browse Puzzles</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Speed Blitz */}
              <div
                onClick={() => {
                  playClick();
                  setCurrentView('speedrun');
                }}
                className="bg-[#161B22] border border-[#30363D] hover:border-[#D29922]/60 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:-translate-y-1 cursor-pointer group shadow-xl"
              >
                <div className="flex flex-col gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#D29922]/10 text-[#D29922] flex items-center justify-center text-lg">
                    ⚡
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-[#D29922] transition-colors">
                    Speed Blitz
                  </h3>
                  <p className="text-xs text-[#8B949E] leading-relaxed">
                    5 rapid-fire snippets in 15 seconds each. Earn speed multipliers and climb high scores.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-mono text-[#D29922]">
                  <span>Launch Blitz</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Interactive Demo Snippet for Current Language */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 sm:p-8 flex flex-col gap-5 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-mono text-[#58A6FF] font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>TRY IT LIVE: {samplePuzzle.language.toUpperCase()}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">
                    {samplePuzzle.title}
                  </h2>
                </div>
                <button
                  onClick={handleChangeLanguage}
                  className="text-xs font-mono text-[#8B949E] hover:text-[#58A6FF] flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Switch Language Stack</span>
                </button>
              </div>

              <CodeViewer
                code={samplePuzzle.code}
                language={samplePuzzle.language}
                questionType={samplePuzzle.type}
                selectedLine={demoSelectedLine || undefined}
                onSelectLine={l => {
                  setDemoSelectedLine(l);
                  setDemoRevealed(true);
                }}
                isRevealed={demoRevealed}
                actualBugLine={samplePuzzle.bugLine || 1}
                fontSize={fontSize}
              />

              {demoRevealed && (
                <div
                  className={`p-4 rounded-xl border text-xs sm:text-sm leading-relaxed font-mono flex items-start gap-3 animate-in fade-in ${
                    demoSelectedLine === (samplePuzzle.bugLine || 1)
                      ? 'bg-[#238636]/15 border-[#238636]/40 text-[#3FB950]'
                      : 'bg-[#F85149]/15 border-[#F85149]/40 text-[#F85149]'
                  }`}
                >
                  <span className="text-xl">
                    {demoSelectedLine === (samplePuzzle.bugLine || 1) ? '🎯' : '❌'}
                  </span>
                  <div>
                    <div className="font-bold text-white text-sm mb-1">
                      {demoSelectedLine === (samplePuzzle.bugLine || 1)
                        ? `Spot On! Line ${demoSelectedLine} is the bug!`
                        : `You clicked Line ${demoSelectedLine}. Real bug is at line ${samplePuzzle.bugLine || 1}!`}
                    </div>
                    <p className="text-xs text-[#C9D1D9]">
                      {samplePuzzle.explanation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'daily' && (
          <DailyGame
            userStats={userStats}
            onUpdateStats={handleUpdateStats}
            fontSize={fontSize}
          />
        )}

        {currentView === 'multiplayer' && (
          room && room.status !== 'waiting' ? (
            <MultiplayerArena
              room={room}
              socketId={socketId || ''}
              userStats={userStats}
              onUpdateStats={handleUpdateStats}
              onSubmitAnswer={handleSubmitMultiplayerAnswer}
              onLeaveRoom={handleLeaveRoom}
              fontSize={fontSize}
            />
          ) : (
            <MultiplayerLobby
              room={room}
              userStats={userStats}
              socketId={socketId}
              onJoinRoom={handleJoinMultiplayerRoom}
              onToggleReady={handleToggleReady}
              onLeaveRoom={handleLeaveRoom}
            />
          )
        )}

        {currentView === 'practice' && (
          <PracticeHub
            userStats={userStats}
            onUpdateStats={handleUpdateStats}
            fontSize={fontSize}
            initialLanguage={selectedLanguage}
          />
        )}

        {currentView === 'speedrun' && (
          <SpeedrunGame
            userStats={userStats}
            onUpdateStats={handleUpdateStats}
            fontSize={fontSize}
          />
        )}

        {currentView === 'leaderboard' && (
          <LeaderboardView userStats={userStats} />
        )}

        {currentView === 'profile' && (
          <ProfileView
            userStats={userStats}
            onUpdateStats={handleUpdateStats}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#21262D] py-6 px-4 bg-[#0D1117] text-xs font-mono text-[#8B949E] text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bug className="w-4 h-4 text-[#58A6FF]" />
            <span className="text-white font-semibold">Guess The Bug!</span>
            <span>· 16 Languages Supported</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleChangeLanguage}
              className="text-[#58A6FF] hover:underline cursor-pointer"
            >
              Switch Language ({activeLangObj.name})
            </button>
            <span aria-hidden="true">·</span>
            <span>React 19 &amp; TypeScript</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
