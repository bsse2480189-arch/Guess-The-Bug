import { Badge, Language, UserStats } from '../types/game';

export const ALL_BADGES: Badge[] = [
  {
    id: 'first_bug',
    name: 'First Bug Squashed',
    icon: '🐛',
    description: 'Solve your very first bug correctly.'
  },
  {
    id: 'on_fire',
    name: 'On Fire',
    icon: '🔥',
    description: 'Achieve a streak of 5 correct answers.'
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    icon: '⚡',
    description: 'Identify the bug in under 3 seconds.'
  },
  {
    id: 'bug_hunter',
    name: 'Bug Hunter',
    icon: '🧠',
    description: 'Accumulate 25 correct bug squashes.'
  },
  {
    id: 'champion',
    name: 'Champion',
    icon: '🏆',
    description: 'Win a multiplayer showdown.'
  },
  {
    id: 'polyglot',
    name: 'Polyglot',
    icon: '🌐',
    description: 'Solve at least one bug in Python, JS, C++, and Java.'
  },
  {
    id: 'pixel_perfect',
    name: 'Flawless Debugger',
    icon: '🎯',
    description: 'Complete a multi-round match without losing a single life.'
  }
];

const STORAGE_KEY = 'guessthebug_user_profile_v1';

export function getTodayDateString(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
}

export function getDefaultUserStats(): UserStats {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return {
    username: `Dev_${randomSuffix}`,
    avatar: '👨‍💻',
    xp: 0,
    level: 1,
    elo: 1000,
    streak: 0,
    bestStreak: 0,
    lastPlayedDate: '',
    totalPlayed: 0,
    totalCorrect: 0,
    badges: [],
    dailyCompletedDates: [],
    languageStats: {
      python: { played: 0, correct: 0 },
      javascript: { played: 0, correct: 0 },
      cpp: { played: 0, correct: 0 },
      java: { played: 0, correct: 0 }
    }
  };
}

export function loadUserStats(): UserStats {
  if (typeof window === 'undefined') return getDefaultUserStats();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultUserStats();
    const parsed = JSON.parse(raw);
    return { ...getDefaultUserStats(), ...parsed };
  } catch {
    return getDefaultUserStats();
  }
}

export function saveUserStats(stats: UserStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('Failed to save user stats', err);
  }
}

export function calculateLevel(xp: number): number {
  // 100 XP per level, with quadratic curve
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function recordPuzzleResult(
  stats: UserStats,
  language: Language,
  isCorrect: boolean,
  timeTakenSec: number,
  pointsEarned: number,
  isDaily = false
): { updatedStats: UserStats; newBadges: Badge[] } {
  const today = getTodayDateString();
  const next = { ...stats };

  next.totalPlayed += 1;
  const langStat = next.languageStats[language] || { played: 0, correct: 0 };
  langStat.played += 1;

  const newlyUnlocked: Badge[] = [];

  if (isCorrect) {
    next.totalCorrect += 1;
    langStat.correct += 1;
    next.streak += 1;
    if (next.streak > next.bestStreak) {
      next.bestStreak = next.streak;
    }
    next.xp += pointsEarned;
    next.level = calculateLevel(next.xp);

    // Badges checks
    if (!next.badges.includes('first_bug')) {
      next.badges.push('first_bug');
      const b = ALL_BADGES.find(x => x.id === 'first_bug');
      if (b) newlyUnlocked.push(b);
    }

    if (next.streak >= 5 && !next.badges.includes('on_fire')) {
      next.badges.push('on_fire');
      const b = ALL_BADGES.find(x => x.id === 'on_fire');
      if (b) newlyUnlocked.push(b);
    }

    if (timeTakenSec < 3 && !next.badges.includes('speed_demon')) {
      next.badges.push('speed_demon');
      const b = ALL_BADGES.find(x => x.id === 'speed_demon');
      if (b) newlyUnlocked.push(b);
    }

    if (next.totalCorrect >= 25 && !next.badges.includes('bug_hunter')) {
      next.badges.push('bug_hunter');
      const b = ALL_BADGES.find(x => x.id === 'bug_hunter');
      if (b) newlyUnlocked.push(b);
    }

    // Polyglot check
    const hasAll =
      (next.languageStats.python?.correct || 0) > 0 &&
      (next.languageStats.javascript?.correct || 0) > 0 &&
      (next.languageStats.cpp?.correct || 0) > 0 &&
      (next.languageStats.java?.correct || 0) > 0;
    if (hasAll && !next.badges.includes('polyglot')) {
      next.badges.push('polyglot');
      const b = ALL_BADGES.find(x => x.id === 'polyglot');
      if (b) newlyUnlocked.push(b);
    }
  } else {
    next.streak = 0;
  }

  next.languageStats[language] = langStat;
  next.lastPlayedDate = today;

  if (isDaily && isCorrect) {
    if (!next.dailyCompletedDates.includes(today)) {
      next.dailyCompletedDates.push(today);
    }
  }

  saveUserStats(next);
  return { updatedStats: next, newBadges: newlyUnlocked };
}
