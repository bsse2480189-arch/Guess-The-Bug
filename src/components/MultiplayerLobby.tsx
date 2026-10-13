import React, { useState } from 'react';
import { GameRoom, UserStats } from '../types/game';
import { Users, Swords, Copy, Check, Play, UserCheck, Shield } from 'lucide-react';
import { playClick } from '../lib/audio';

interface MultiplayerLobbyProps {
  room: GameRoom | null;
  userStats: UserStats;
  socketId: string | null;
  onJoinRoom: (roomId: string) => void;
  onToggleReady: () => void;
  onLeaveRoom: () => void;
}

export const MultiplayerLobby: React.FC<MultiplayerLobbyProps> = ({
  room,
  userStats,
  socketId,
  onJoinRoom,
  onToggleReady,
  onLeaveRoom
}) => {
  const [inputCode, setInputCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    if (room?.code) {
      playClick();
      navigator.clipboard.writeText(room.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleQuickMatch = () => {
    playClick();
    onJoinRoom('QUICK-1');
  };

  const handleCreateCustom = () => {
    playClick();
    const randomCode = `BUG-${Math.floor(100 + Math.random() * 900)}`;
    onJoinRoom(randomCode);
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    playClick();
    onJoinRoom(inputCode.trim().toUpperCase());
  };

  // If user is NOT yet in a room, show matchmaking / create room screen
  if (!room) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
          <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#58A6FF]">
            <Swords className="w-4 h-4" />
            <span>REAL-TIME 1v1 CODE SHOWDOWN</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Multiplayer Matchmaking
          </h1>
          <p className="text-sm text-[#8B949E]">
            Battle head-to-head with other developers. 5 rounds, 3 lives, 30 seconds per snippet. Faster bug squashes score higher ELO!
          </p>
        </div>

        {/* 3 Action Cards: Quick Match, Create Room, Join Room */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Quick Match */}
          <div className="bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF]/40 rounded-2xl p-6 flex flex-col justify-between gap-5 transition-all shadow-xl">
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#58A6FF]/10 text-[#58A6FF] flex items-center justify-center text-xl">
                ⚡
              </div>
              <h3 className="text-lg font-bold text-white">Instant Match</h3>
              <p className="text-xs text-[#8B949E] leading-relaxed">
                Jump into the public matchmaking lobby to play against anyone online right now.
              </p>
            </div>

            <button
              onClick={handleQuickMatch}
              className="w-full py-3 bg-[#1F6FEB] hover:bg-[#388BFD] text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Swords className="w-4 h-4" />
              <span>Find Opponent</span>
            </button>
          </div>

          {/* 2. Create Private Room */}
          <div className="bg-[#161B22] border border-[#30363D] hover:border-[#238636]/40 rounded-2xl p-6 flex flex-col justify-between gap-5 transition-all shadow-xl">
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#238636]/10 text-[#3FB950] flex items-center justify-center text-xl">
                🛡️
              </div>
              <h3 className="text-lg font-bold text-white">Private Duel</h3>
              <p className="text-xs text-[#8B949E] leading-relaxed">
                Generate a private Room Code to invite a colleague or friend to a 1v1 battle.
              </p>
            </div>

            <button
              onClick={handleCreateCustom}
              className="w-full py-3 bg-[#238636] hover:bg-[#2EA043] text-white font-medium text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Create Room Code</span>
            </button>
          </div>

          {/* 3. Join with Code */}
          <div className="bg-[#161B22] border border-[#30363D] hover:border-[#D29922]/40 rounded-2xl p-6 flex flex-col justify-between gap-5 transition-all shadow-xl">
            <div className="flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#D29922]/10 text-[#D29922] flex items-center justify-center text-xl">
                🔑
              </div>
              <h3 className="text-lg font-bold text-white">Join by Code</h3>
              <p className="text-xs text-[#8B949E] leading-relaxed">
                Enter an existing Room Code shared with you to join an active lobby.
              </p>
            </div>

            <form onSubmit={handleJoinByCode} className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="e.g. BUG-742"
                value={inputCode}
                onChange={e => setInputCode(e.target.value)}
                className="w-full px-3 py-2 bg-[#0D1117] border border-[#30363D] rounded-lg font-mono text-sm text-white uppercase placeholder:text-[#484F58] focus:border-[#58A6FF] outline-none"
              />
              <button
                type="submit"
                disabled={!inputCode.trim()}
                className="w-full py-2 bg-[#21262D] hover:bg-[#30363D] disabled:opacity-50 text-white font-medium text-sm rounded-lg transition-all cursor-pointer"
              >
                Join Room
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // User is IN a room lobby waiting for players/ready
  const players = Object.values(room.players);
  const myPlayer = socketId ? room.players[socketId] : null;
  const isMeReady = myPlayer?.isReady || false;
  const canStart = players.length >= 2 && players.every(p => p.isReady);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Room Header & Code Banner */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#58A6FF]/10 text-[#58A6FF] flex items-center justify-center font-mono font-black text-xl">
            #
          </div>
          <div>
            <div className="text-xs font-mono text-[#8B949E]">ROOM CODE</div>
            <div className="text-2xl font-black font-mono text-white tracking-wider flex items-center gap-2">
              <span>{room.code}</span>
              <button
                onClick={handleCopyCode}
                className="p-1 hover:bg-[#21262D] rounded text-[#8B949E] hover:text-white transition-colors"
                title="Copy Room Code"
              >
                {copiedCode ? <Check className="w-4 h-4 text-[#3FB950]" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onLeaveRoom}
          className="text-xs text-[#F85149] hover:underline font-mono px-3 py-1.5 rounded hover:bg-[#F85149]/10"
        >
          Leave Room
        </button>
      </div>

      {/* Players List */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-[#58A6FF]" />
            <span>Players in Arena ({players.length}/4)</span>
          </h3>
          <span className="text-xs text-[#8B949E] font-mono">
            {players.length < 2 ? 'Waiting for opponent to join...' : 'Ready up to begin!'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {players.map(p => {
            const isMe = p.id === socketId;
            return (
              <div
                key={p.id}
                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                  p.isReady
                    ? 'bg-[#238636]/10 border-[#238636]/40'
                    : 'bg-[#0D1117] border-[#30363D]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.avatar}</span>
                  <div>
                    <div className="font-mono text-sm font-semibold text-white flex items-center gap-1.5">
                      <span>{p.username}</span>
                      {isMe && <span className="text-[10px] text-[#58A6FF] font-normal">(You)</span>}
                    </div>
                    <div className="text-xs text-[#8B949E] font-mono">
                      ELO: <strong className="text-white">{p.elo}</strong>
                    </div>
                  </div>
                </div>

                <div>
                  {p.isReady ? (
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-[#3FB950] bg-[#3FB950]/15 px-2 py-0.5 rounded border border-[#3FB950]/30">
                      <UserCheck className="w-3.5 h-3.5" /> READY
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-[#8B949E]">
                      Not Ready
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {players.length < 2 && (
            <div className="p-4 rounded-xl border border-dashed border-[#30363D] flex items-center justify-center text-xs font-mono text-[#8B949E] bg-[#0D1117]/50 min-h-[72px]">
              Waiting for player 2... Share code: {room.code}
            </div>
          )}
        </div>

        {/* Ready Action Footer */}
        <div className="pt-4 border-t border-[#30363D] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#8B949E]">
            Match starts automatically as soon as both players click Ready.
          </div>

          <button
            onClick={onToggleReady}
            className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              isMeReady
                ? 'bg-[#D29922] hover:bg-[#E3B341] text-black'
                : 'bg-[#238636] hover:bg-[#2EA043] text-white shadow-[#238636]/20'
            }`}
          >
            {isMeReady ? 'Cancel Ready' : 'Ready Up!'}
          </button>
        </div>
      </div>
    </div>
  );
};
