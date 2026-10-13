import React, { useEffect } from 'react';
import { Timer } from 'lucide-react';
import { playTick } from '../lib/audio';

interface TimerBarProps {
  remainingSec: number;
  totalSec: number;
  isPaused?: boolean;
}

export const TimerBar: React.FC<TimerBarProps> = ({
  remainingSec,
  totalSec,
  isPaused = false
}) => {
  const percentage = Math.max(0, Math.min(100, (remainingSec / totalSec) * 100));

  // Audio tick on critical time (< 5 seconds remaining)
  useEffect(() => {
    if (!isPaused && remainingSec <= 5 && remainingSec > 0) {
      playTick();
    }
  }, [remainingSec, isPaused]);

  // Determine bar color
  let colorClass = 'bg-[#3FB950] shadow-[0_0_12px_rgba(63,185,80,0.4)]'; // Green
  let textClass = 'text-[#3FB950]';
  if (percentage <= 25) {
    colorClass = 'bg-[#F85149] shadow-[0_0_14px_rgba(248,81,73,0.6)] animate-pulse'; // Red
    textClass = 'text-[#F85149]';
  } else if (percentage <= 50) {
    colorClass = 'bg-[#D29922] shadow-[0_0_12px_rgba(210,153,34,0.4)]'; // Yellow/Orange
    textClass = 'text-[#D29922]';
  }

  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5 text-[#8B949E]">
          <Timer className="w-3.5 h-3.5" />
          <span>TIME REMAINING</span>
        </div>
        <div className={`font-bold tabular-nums text-sm ${textClass}`}>
          {remainingSec}s <span className="text-[#8B949E] font-normal text-xs">/ {totalSec}s</span>
        </div>
      </div>

      <div className="w-full h-2 bg-[#21262D] rounded-full overflow-hidden border border-[#30363D]">
        <div
          className={`h-full transition-all duration-300 ease-linear rounded-full ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
