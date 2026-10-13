import express, { Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { ALL_PUZZLES } from './src/data/puzzles';
import { GameRoom, Player, Puzzle, LeaderboardEntry } from './src/types/game';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(express.json());

// In-memory Leaderboards
const initialLeaderboard: LeaderboardEntry[] = [
  { id: 'lb-1', username: 'Linus_Bugsquash', avatar: '🐧', score: 14850, streak: 18, elo: 1850, solvedCount: 142, createdAt: Date.now() - 3600000 * 20 },
  { id: 'lb-2', username: 'ByteNinja', avatar: '🥷', score: 12900, streak: 14, elo: 1720, solvedCount: 119, createdAt: Date.now() - 3600000 * 45 },
  { id: 'lb-3', username: 'NullPointerQueen', avatar: '👑', score: 11400, streak: 12, elo: 1680, solvedCount: 98, createdAt: Date.now() - 3600000 * 60 },
  { id: 'lb-4', username: 'Rustacean_Crab', avatar: '🦀', score: 9850, streak: 9, elo: 1540, solvedCount: 84, createdAt: Date.now() - 3600000 * 80 },
  { id: 'lb-5', username: 'AsyncAwaiter', avatar: '⚡', score: 8700, streak: 7, elo: 1490, solvedCount: 76, createdAt: Date.now() - 3600000 * 95 },
  { id: 'lb-6', username: 'SyntaxSamurai', avatar: '⚔️', score: 7200, streak: 6, elo: 1410, solvedCount: 65, createdAt: Date.now() - 3600000 * 120 },
  { id: 'lb-7', username: 'SegFaultSurvivor', avatar: '🛡️', score: 6500, streak: 5, elo: 1360, solvedCount: 58, createdAt: Date.now() - 3600000 * 150 },
  { id: 'lb-8', username: 'RegexWizard', avatar: '🧙‍♂️', score: 5400, streak: 4, elo: 1290, solvedCount: 49, createdAt: Date.now() - 3600000 * 200 }
];

let leaderboards: LeaderboardEntry[] = [...initialLeaderboard];

// REST Endpoints
app.get('/api/puzzles', (req: Request, res: Response) => {
  const { language, difficulty, topic, type, limit } = req.query;
  let results = [...ALL_PUZZLES];

  if (language && typeof language === 'string' && language !== 'all') {
    results = results.filter(p => p.language === language.toLowerCase());
  }
  if (difficulty && typeof difficulty === 'string' && difficulty !== 'all') {
    results = results.filter(p => p.difficulty === difficulty.toLowerCase());
  }
  if (topic && typeof topic === 'string' && topic !== 'all') {
    results = results.filter(p => p.topic === topic.toLowerCase());
  }
  if (type && typeof type === 'string' && type !== 'all') {
    results = results.filter(p => p.type === type.toLowerCase());
  }

  if (limit && typeof limit === 'string') {
    const lim = parseInt(limit, 10);
    if (!isNaN(lim) && lim > 0) {
      results = results.slice(0, lim);
    }
  }

  res.json({ total: results.length, puzzles: results });
});

// Deterministic Daily Puzzle based on UTC date
app.get('/api/puzzles/daily', (_req: Request, res: Response) => {
  const now = new Date();
  const dateStr = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
  
  // Hash date string to choose a puzzle deterministically
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  const index = hash % ALL_PUZZLES.length;
  const puzzle = ALL_PUZZLES[index];

  res.json({
    date: dateStr,
    puzzle,
    nextResetUTC: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString()
  });
});

app.get('/api/leaderboard', (req: Request, res: Response) => {
  const { type = 'all-time' } = req.query;
  const sorted = [...leaderboards].sort((a, b) => b.score - a.score);
  res.json({ type, entries: sorted.slice(0, 50) });
});

app.post('/api/leaderboard', (req: Request, res: Response) => {
  const { username, score, streak, avatar, elo } = req.body;
  if (!username || typeof score !== 'number') {
    res.status(400).json({ error: 'Username and numeric score required' });
    return;
  }

  const existingIdx = leaderboards.findIndex(x => x.username.toLowerCase() === username.toLowerCase());
  if (existingIdx >= 0) {
    if (score > leaderboards[existingIdx].score) {
      leaderboards[existingIdx].score = score;
      leaderboards[existingIdx].streak = Math.max(leaderboards[existingIdx].streak, streak || 0);
      leaderboards[existingIdx].elo = Math.max(leaderboards[existingIdx].elo, elo || 1000);
      leaderboards[existingIdx].solvedCount += 1;
    }
  } else {
    leaderboards.push({
      id: `user-${Date.now()}`,
      username,
      avatar: avatar || '👾',
      score,
      streak: streak || 1,
      elo: elo || 1000,
      solvedCount: 1,
      createdAt: Date.now()
    });
  }

  leaderboards.sort((a, b) => b.score - a.score);
  res.json({ success: true, rank: leaderboards.findIndex(x => x.username.toLowerCase() === username.toLowerCase()) + 1 });
});

// Multiplayer Room State Management
const rooms: Record<string, GameRoom> = {};
const playerRoomMap: Record<string, string> = {}; // socketId -> roomId
const roundTimers: Record<string, NodeJS.Timeout> = {};

function pickRandomPuzzles(count: number): Puzzle[] {
  const shuffled = [...ALL_PUZZLES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function calculateEloDelta(winnerElo: number, loserElo: number): number {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  return Math.round(32 * (1 - expectedWinner));
}

io.on('connection', (socket: Socket) => {
  // Join or create room
  socket.on('join_room', ({ roomId, username, avatar, elo }: { roomId: string; username: string; avatar?: string; elo?: number }) => {
    const cleanRoomId = (roomId || 'QUICK-1').trim().toUpperCase();
    socket.join(cleanRoomId);
    playerRoomMap[socket.id] = cleanRoomId;

    if (!rooms[cleanRoomId]) {
      const selectedPuzzles = pickRandomPuzzles(5);
      rooms[cleanRoomId] = {
        code: cleanRoomId,
        hostId: socket.id,
        status: 'waiting',
        currentRound: 0,
        totalRounds: 5,
        roundDurationSec: 30,
        roundStartTime: 0,
        puzzleIds: selectedPuzzles.map(p => p.id),
        currentPuzzle: selectedPuzzles[0],
        players: {}
      };
    }

    const room = rooms[cleanRoomId];
    room.players[socket.id] = {
      id: socket.id,
      username: username || `Dev_${socket.id.slice(0, 4)}`,
      avatar: avatar || '👾',
      score: 0,
      lives: 3,
      isReady: false,
      hasAnsweredCurrentRound: false,
      elo: elo || 1000
    };

    io.to(cleanRoomId).emit('room_update', { room });
  });

  // Ready toggle
  socket.on('ready', ({ roomId }: { roomId: string }) => {
    const room = rooms[roomId];
    if (!room) return;

    const player = room.players[socket.id];
    if (!player) return;

    player.isReady = !player.isReady;

    // Check if at least 2 players and ALL ready
    const playerList = Object.values(room.players);
    const allReady = playerList.length >= 2 && playerList.every(p => p.isReady);

    if (allReady && room.status === 'waiting') {
      room.status = 'countdown';
      io.to(roomId).emit('room_update', { room });

      // Start match in 3 seconds
      setTimeout(() => {
        if (!rooms[roomId]) return;
        startNextRound(roomId);
      }, 3000);
    } else {
      io.to(roomId).emit('room_update', { room });
    }
  });

  // Submit Answer (Server-Authoritative Evaluation)
  socket.on('submit_answer', ({ roomId, answer, timeRemainingSec }: { roomId: string; answer: string; timeRemainingSec: number }) => {
    const room = rooms[roomId];
    if (!room || room.status !== 'in_round' || !room.currentPuzzle) return;

    const player = room.players[socket.id];
    if (!player || player.hasAnsweredCurrentRound || player.lives <= 0) return;

    player.hasAnsweredCurrentRound = true;
    player.answerTimeSec = Math.max(0, 30 - timeRemainingSec);

    // Validate answer server-side
    const correctAns = room.currentPuzzle.correctAnswer;
    const isCorrect = String(answer).trim() === String(correctAns).trim();
    player.lastAnswerCorrect = isCorrect;

    if (isCorrect) {
      // 100 base + time bonus (+5/sec remaining) + speed bonus (<5s -> +25)
      let roundScore = 100 + Math.max(0, Math.floor(timeRemainingSec * 5));
      if (player.answerTimeSec < 5) roundScore += 25;
      player.score += roundScore;
    } else {
      player.lives = Math.max(0, player.lives - 1);
    }

    io.to(roomId).emit('player_answered', {
      playerId: socket.id,
      username: player.username,
      livesRemaining: player.lives,
      score: player.score
    });

    // If all living players have answered, end round immediately
    const livingPlayers = Object.values(room.players).filter(p => p.lives > 0);
    const allLivingAnswered = livingPlayers.every(p => p.hasAnsweredCurrentRound);

    if (allLivingAnswered) {
      if (roundTimers[roomId]) clearTimeout(roundTimers[roomId]);
      endCurrentRound(roomId);
    }
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    const roomId = playerRoomMap[socket.id];
    if (!roomId || !rooms[roomId]) return;

    const room = rooms[roomId];
    delete room.players[socket.id];
    delete playerRoomMap[socket.id];

    if (Object.keys(room.players).length === 0) {
      if (roundTimers[roomId]) clearTimeout(roundTimers[roomId]);
      delete rooms[roomId];
    } else {
      if (room.hostId === socket.id) {
        room.hostId = Object.keys(room.players)[0];
      }
      io.to(roomId).emit('player_disconnected', { playerId: socket.id });
      io.to(roomId).emit('room_update', { room });
    }
  });

  socket.on('leave_room', ({ roomId }: { roomId: string }) => {
    socket.leave(roomId);
    delete playerRoomMap[socket.id];
    const room = rooms[roomId];
    if (room && room.players[socket.id]) {
      delete room.players[socket.id];
      if (Object.keys(room.players).length === 0) {
        if (roundTimers[roomId]) clearTimeout(roundTimers[roomId]);
        delete rooms[roomId];
      } else {
        io.to(roomId).emit('room_update', { room });
      }
    }
  });
});

function startNextRound(roomId: string) {
  const room = rooms[roomId];
  if (!room) return;

  room.currentRound += 1;

  // Check end conditions: reached 5 rounds OR only 1 living player left
  const livingPlayers = Object.values(room.players).filter(p => p.lives > 0);
  if (room.currentRound > room.totalRounds || livingPlayers.length <= 1) {
    finishMatch(roomId);
    return;
  }

  // Pick puzzle for round
  const puzzle = ALL_PUZZLES.find(p => p.id === room.puzzleIds[room.currentRound - 1]) || ALL_PUZZLES[0];
  room.currentPuzzle = puzzle;
  room.status = 'in_round';
  room.roundStartTime = Date.now();

  // Reset player round flags
  Object.values(room.players).forEach(p => {
    p.hasAnsweredCurrentRound = false;
    p.lastAnswerCorrect = undefined;
    p.answerTimeSec = undefined;
  });

  // Strip correctAnswer from client broadcast during round to prevent inspection cheating!
  const clientSafePuzzle: Partial<Puzzle> = {
    id: puzzle.id,
    title: puzzle.title,
    language: puzzle.language,
    difficulty: puzzle.difficulty,
    topic: puzzle.topic,
    type: puzzle.type,
    prompt: puzzle.prompt,
    code: puzzle.code,
    options: puzzle.options,
    tags: puzzle.tags,
    points: puzzle.points
  };

  io.to(roomId).emit('round_start', {
    round: room.currentRound,
    totalRounds: room.totalRounds,
    puzzle: clientSafePuzzle,
    durationSec: room.roundDurationSec
  });
  io.to(roomId).emit('room_update', { room });

  // 30-second round timer
  if (roundTimers[roomId]) clearTimeout(roundTimers[roomId]);
  roundTimers[roomId] = setTimeout(() => {
    // Punish players who didn't answer before timeout
    Object.values(room.players).forEach(p => {
      if (!p.hasAnsweredCurrentRound && p.lives > 0) {
        p.lives = Math.max(0, p.lives - 1);
        p.lastAnswerCorrect = false;
      }
    });
    endCurrentRound(roomId);
  }, room.roundDurationSec * 1000);
}

function endCurrentRound(roomId: string) {
  const room = rooms[roomId];
  if (!room || !room.currentPuzzle) return;

  room.status = 'round_reveal';

  io.to(roomId).emit('round_end', {
    round: room.currentRound,
    correctAnswer: room.currentPuzzle.correctAnswer,
    bugLine: room.currentPuzzle.bugLine,
    explanation: room.currentPuzzle.explanation,
    fixSnippet: room.currentPuzzle.fixSnippet,
    players: room.players
  });
  io.to(roomId).emit('room_update', { room });

  // 5-second cooldown reveal before next round
  setTimeout(() => {
    if (!rooms[roomId]) return;
    startNextRound(roomId);
  }, 5000);
}

function finishMatch(roomId: string) {
  const room = rooms[roomId];
  if (!room) return;

  room.status = 'finished';

  // Determine winner: highest score among living or overall
  const sortedPlayers = Object.values(room.players).sort((a, b) => {
    if (a.lives > 0 && b.lives === 0) return -1;
    if (b.lives > 0 && a.lives === 0) return 1;
    return b.score - a.score;
  });

  const winner = sortedPlayers[0];
  const loser = sortedPlayers[1];
  let eloDelta = 25;

  if (winner && loser) {
    eloDelta = calculateEloDelta(winner.elo, loser.elo);
    winner.elo += eloDelta;
    loser.elo = Math.max(100, loser.elo - eloDelta);
    winner.score += 200; // Multiplayer win bonus!
  }

  room.winnerId = winner?.id;

  io.to(roomId).emit('match_end', {
    winner,
    rankings: sortedPlayers,
    eloDelta
  });
  io.to(roomId).emit('room_update', { room });
}

// Development vs Production serving
async function setupServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Guess The Bug! server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch(err => {
  console.error('Failed to start server:', err);
});
