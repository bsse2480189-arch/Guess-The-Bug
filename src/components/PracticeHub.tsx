import React, { useState, useMemo } from 'react';
import { Difficulty, Language, Puzzle, QuestionType, Topic, UserStats } from '../types/game';
import { ALL_PUZZLES } from '../data/puzzles';
import { CodeViewer } from './CodeViewer';
import { QuestionBox } from './QuestionBox';
import { RevealModal } from './RevealModal';
import { recordPuzzleResult } from '../lib/storage';
import { playClick } from '../lib/audio';
import { Search, Filter, BookOpen, CheckCircle, RefreshCw, Sparkles, ArrowLeft, Eye } from 'lucide-react';

interface PracticeHubProps {
  userStats: UserStats;
  onUpdateStats: (newStats: UserStats) => void;
  fontSize: 'sm' | 'md' | 'lg';
  initialLanguage?: string | null;
}

export const PracticeHub: React.FC<PracticeHubProps> = ({
  userStats,
  onUpdateStats,
  fontSize,
  initialLanguage
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    initialLanguage && initialLanguage !== 'random' ? initialLanguage : 'all'
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active puzzle being solved
  const [activePuzzle, setActivePuzzle] = useState<Puzzle | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [unlockedBadges, setUnlockedBadges] = useState<any[]>([]);

  // Filtered puzzles list
  const filteredPuzzles = useMemo(() => {
    return ALL_PUZZLES.filter(p => {
      if (selectedLanguage !== 'all' && p.language !== selectedLanguage) return false;
      if (selectedDifficulty !== 'all' && p.difficulty !== selectedDifficulty) return false;
      if (selectedTopic !== 'all' && p.topic !== selectedTopic) return false;
      if (selectedType !== 'all' && p.type !== selectedType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesPrompt = p.prompt.toLowerCase().includes(q);
        const matchesTags = p.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesPrompt && !matchesTags) return false;
      }
      return true;
    });
  }, [selectedLanguage, selectedDifficulty, selectedTopic, selectedType, searchQuery]);

  const handleStartPuzzle = (puzzle: Puzzle) => {
    playClick();
    setActivePuzzle(puzzle);
    setSelectedOption(null);
    setSelectedLine(null);
    setIsRevealed(false);
  };

  const handleSubmitPractice = () => {
    if (!activePuzzle) return;
    const answer = activePuzzle.type === 'click_line'
      ? String(selectedLine)
      : selectedOption || '';

    const correct = answer.trim() === String(activePuzzle.correctAnswer).trim();
    setIsCorrect(correct);
    setIsRevealed(true);

    const { updatedStats, newBadges } = recordPuzzleResult(
      userStats,
      activePuzzle.language,
      correct,
      10,
      correct ? activePuzzle.points : 0
    );
    onUpdateStats(updatedStats);
    setUnlockedBadges(newBadges);
  };

  const handleNextRandom = () => {
    playClick();
    const remaining = filteredPuzzles.filter(p => p.id !== activePuzzle?.id);
    if (remaining.length > 0) {
      const nextP = remaining[Math.floor(Math.random() * remaining.length)];
      handleStartPuzzle(nextP);
    } else {
      setActivePuzzle(null);
    }
  };

  // If a puzzle is actively open for practice
  if (activePuzzle) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Navigation back bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              playClick();
              setActivePuzzle(null);
            }}
            className="flex items-center gap-2 text-xs font-mono text-[#8B949E] hover:text-white px-3 py-1.5 rounded-lg hover:bg-[#161B22] border border-[#30363D] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Practice Catalog</span>
          </button>

          <button
            onClick={handleNextRandom}
            className="flex items-center gap-2 text-xs font-mono text-[#58A6FF] hover:text-white px-3 py-1.5 rounded-lg bg-[#58A6FF]/10 hover:bg-[#58A6FF]/20 border border-[#58A6FF]/30 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Another Random Bug</span>
          </button>
        </div>

        {/* Puzzle Header */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono text-[#8B949E]">
              PRACTICE SNIPPET · <span className="uppercase text-[#58A6FF]">{activePuzzle.language}</span> · <span className="capitalize">{activePuzzle.difficulty}</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">{activePuzzle.title}</h2>
          </div>
          <div className="text-xs font-mono text-[#3FB950] bg-[#3FB950]/10 border border-[#3FB950]/20 px-2.5 py-1 rounded">
            +{activePuzzle.points} XP on correct
          </div>
        </div>

        {/* Code Viewer */}
        <CodeViewer
          code={activePuzzle.code}
          language={activePuzzle.language}
          questionType={activePuzzle.type}
          selectedLine={selectedLine || undefined}
          onSelectLine={l => !isRevealed && setSelectedLine(l)}
          isRevealed={isRevealed}
          actualBugLine={activePuzzle.bugLine}
          fontSize={fontSize}
          interactive={!isRevealed}
        />

        {/* Question Panel */}
        <QuestionBox
          puzzle={activePuzzle}
          selectedOption={selectedOption}
          selectedLine={selectedLine}
          onSelectOption={opt => setSelectedOption(opt)}
          onSubmit={handleSubmitPractice}
          disabled={isRevealed}
        />

        {/* Reveal Modal */}
        <RevealModal
          isOpen={isRevealed}
          isCorrect={isCorrect}
          puzzle={activePuzzle}
          userAnswer={activePuzzle.type === 'click_line' ? String(selectedLine) : selectedOption || ''}
          pointsEarned={isCorrect ? activePuzzle.points : 0}
          timeRemainingSec={20}
          streakCount={userStats.streak}
          newBadges={unlockedBadges}
          onNext={() => {
            setIsRevealed(false);
            handleNextRandom();
          }}
          nextButtonLabel="Next Practice Bug"
        />
      </div>
    );
  }

  // Catalog / Filter view
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#30363D]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#58A6FF]">
            <BookOpen className="w-4 h-4" />
            <span>UNLIMITED DEBUGGING DRILLS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            Practice Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#8B949E] mt-0.5">
            100+ real interview & production bugs across Python, JavaScript, C++, and Java. No timer stress.
          </p>
        </div>

        <button
          onClick={() => {
            if (filteredPuzzles.length > 0) {
              const rand = filteredPuzzles[Math.floor(Math.random() * filteredPuzzles.length)];
              handleStartPuzzle(rand);
            }
          }}
          className="px-5 py-2.5 bg-[#238636] hover:bg-[#2EA043] text-white font-medium text-xs font-mono rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Launch Random Bug</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 flex flex-col gap-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-[#8B949E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by bug title, keyword, or concept..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg text-xs font-mono text-white placeholder:text-[#484F58] focus:border-[#58A6FF] outline-none"
            />
          </div>

          <span className="text-xs font-mono text-[#8B949E] shrink-0">
            Showing <strong className="text-white">{filteredPuzzles.length}</strong> puzzles
          </span>
        </div>

        {/* Filter Selectors (Segmented Buttons per frontend design skill) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#21262D] text-xs font-mono">
          {/* Language filter */}
          <div className="flex items-center gap-1 bg-[#0D1117] p-1 rounded-lg border border-[#30363D]">
            {(['all', 'python', 'javascript', 'cpp', 'java'] as const).map(l => (
              <button
                key={l}
                onClick={() => {
                  playClick();
                  setSelectedLanguage(l);
                }}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedLanguage === l
                    ? 'bg-[#21262D] text-[#58A6FF] font-semibold border border-[#58A6FF]/30'
                    : 'text-[#8B949E] hover:text-white'
                }`}
              >
                {l === 'all' ? 'All Languages' : l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Difficulty filter */}
          <div className="flex items-center gap-1 bg-[#0D1117] p-1 rounded-lg border border-[#30363D]">
            {(['all', 'easy', 'medium', 'hard'] as const).map(d => (
              <button
                key={d}
                onClick={() => {
                  playClick();
                  setSelectedDifficulty(d);
                }}
                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                  selectedDifficulty === d
                    ? 'bg-[#21262D] text-[#3FB950] font-semibold border border-[#3FB950]/30'
                    : 'text-[#8B949E] hover:text-white'
                }`}
              >
                {d === 'all' ? 'All Levels' : d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>

          {/* Question Type Filter */}
          <div className="flex items-center gap-1 bg-[#0D1117] p-1 rounded-lg border border-[#30363D]">
            {(['all', 'click_line', 'output', 'fix', 'error_type'] as const).map(t => (
              <button
                key={t}
                onClick={() => {
                  playClick();
                  setSelectedType(t);
                }}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  selectedType === t
                    ? 'bg-[#21262D] text-[#D29922] font-semibold border border-[#D29922]/30'
                    : 'text-[#8B949E] hover:text-white'
                }`}
              >
                {t === 'all' ? 'All Types' : t === 'click_line' ? 'Click Line' : t === 'output' ? 'Predict Output' : t === 'fix' ? 'Find Fix' : 'Error Type'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Puzzle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPuzzles.map(puzzle => {
          return (
            <div
              key={puzzle.id}
              onClick={() => handleStartPuzzle(puzzle)}
              className="bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF]/60 rounded-xl p-4 flex flex-col justify-between gap-3 transition-all hover:-translate-y-0.5 cursor-pointer shadow-lg group"
            >
              <div className="flex flex-col gap-2">
                {/* Quiet text metadata per frontend design skill */}
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#8B949E]">
                  <span className="uppercase text-[#58A6FF] font-semibold">{puzzle.language}</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{puzzle.difficulty}</span>
                  <span aria-hidden="true">·</span>
                  <span>{puzzle.topic}</span>
                </div>

                <h3 className="font-bold text-white text-sm group-hover:text-[#58A6FF] transition-colors line-clamp-1">
                  {puzzle.title}
                </h3>

                <p className="text-xs text-[#8B949E] line-clamp-2 leading-relaxed">
                  {puzzle.prompt}
                </p>
              </div>

              {/* Code peek snippet */}
              <div className="bg-[#0D1117] p-2.5 rounded border border-[#21262D] font-mono text-[11px] text-[#8B949E] overflow-hidden truncate">
                <code>{puzzle.code.split('\n')[0]}</code>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-[#21262D] text-xs font-mono">
                <span className="text-[#3FB950]">+{puzzle.points} pts</span>
                <span className="text-[#58A6FF] flex items-center gap-1 group-hover:underline">
                  <span>Solve Bug</span>
                  <Eye className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
