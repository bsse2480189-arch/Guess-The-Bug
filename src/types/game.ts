export type Language =
  | 'python'
  | 'javascript'
  | 'typescript'
  | 'java'
  | 'c'
  | 'cpp'
  | 'csharp'
  | 'html'
  | 'css'
  | 'sql'
  | 'php'
  | 'ruby'
  | 'go'
  | 'rust'
  | 'kotlin'
  | 'swift'
  | 'random';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Topic =
  | 'syntax'
  | 'off-by-one'
  | 'null-handling'
  | 'async'
  | 'memory'
  | 'type-coercion'
  | 'regex'
  | 'concurrency'
  | 'logic'
  | 'scope';

export type QuestionType =
  | 'click_line'
  | 'output'
  | 'fix'
  | 'error_type';

export interface Puzzle {
  id: string;
  title: string;
  language: Language;
  difficulty: Difficulty;
  topic: Topic;
  type: QuestionType;
  prompt: string;
  code: string;
  /** 1-based index of the buggy line (for click_line type) */
  bugLine?: number;
  /** For multiple choice types (output, fix, error_type) */
  options?: string[];
  /** Correct answer: either line number string (e.g. "4") or matching option string */
  correctAnswer: string;
  explanation: string;
  fixSnippet?: string;
  tags: string[];
  points: number;
}

export interface Player {
  id: string;
  username: string;
  avatar: string;
  score: number;
  lives: number;
  isReady: boolean;
  hasAnsweredCurrentRound: boolean;
  lastAnswerCorrect?: boolean;
  answerTimeSec?: number;
  elo: number;
}

export interface GameRoom {
  code: string;
  hostId: string;
  status: 'waiting' | 'countdown' | 'in_round' | 'round_reveal' | 'finished';
  currentRound: number;
  totalRounds: number;
  roundDurationSec: number;
  roundStartTime: number;
  puzzleIds: string[];
  currentPuzzle?: Puzzle;
  players: Record<string, Player>;
  winnerId?: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar: string;
  score: number;
  dailyDate?: string;
  streak: number;
  elo: number;
  solvedCount: number;
  createdAt: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: number;
}

export interface UserStats {
  username: string;
  avatar: string;
  xp: number;
  level: number;
  elo: number;
  streak: number;
  lastPlayedDate: string;
  totalPlayed: number;
  totalCorrect: number;
  bestStreak: number;
  badges: string[]; // badge IDs
  dailyCompletedDates: string[]; // YYYY-MM-DD
  languageStats: Partial<Record<Language, { played: number; correct: number }>>;
}

export type GameView =
  | 'language_select'
  | 'home'
  | 'daily'
  | 'multiplayer'
  | 'practice'
  | 'speedrun'
  | 'leaderboard'
  | 'profile';
