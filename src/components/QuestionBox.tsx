import React, { useEffect } from 'react';
import { Puzzle, QuestionType } from '../types/game';
import { playClick } from '../lib/audio';
import { CheckCircle2, CornerDownLeft, HelpCircle } from 'lucide-react';

interface QuestionBoxProps {
  puzzle: Puzzle;
  selectedOption: string | null;
  selectedLine: number | null;
  onSelectOption: (option: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export const QuestionBox: React.FC<QuestionBoxProps> = ({
  puzzle,
  selectedOption,
  selectedLine,
  onSelectOption,
  onSubmit,
  isSubmitting = false,
  disabled = false
}) => {
  const isClickLine = puzzle.type === 'click_line';
  const hasSelection = isClickLine ? selectedLine !== null : selectedOption !== null;

  // Keyboard shortcut listener for options (1, 2, 3, 4) and Enter to submit
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isClickLine && puzzle.options) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const idx = parseInt(e.key, 10) - 1;
          if (puzzle.options[idx]) {
            playClick();
            onSelectOption(puzzle.options[idx]);
          }
        }
      }

      if (e.key === 'Enter' && hasSelection && !isSubmitting) {
        e.preventDefault();
        onSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, isClickLine, puzzle.options, onSelectOption, onSubmit, hasSelection, isSubmitting]);

  const typeLabels: Record<QuestionType, string> = {
    click_line: 'Identify Buggy Line',
    output: 'Predict Code Output',
    fix: 'Select the Proper Fix',
    error_type: 'Classify Runtime Error'
  };

  return (
    <div className="w-full bg-[#161B22] border border-[#30363D] rounded-xl p-5 flex flex-col gap-4 shadow-xl">
      {/* Question Header & Clean Metadata (Zero-pill discipline: unboxed text with ·) */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-xs text-[#8B949E] font-mono">
          <span className="uppercase text-[#58A6FF] font-semibold">{typeLabels[puzzle.type]}</span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">{puzzle.difficulty}</span>
          <span aria-hidden="true">·</span>
          <span>{puzzle.topic}</span>
          <span aria-hidden="true">·</span>
          <span className="text-[#3FB950] font-semibold">+{puzzle.points} pts</span>
        </div>

        <h2 className="text-base sm:text-lg font-semibold text-[#F0F6FC] leading-snug">
          {puzzle.prompt}
        </h2>
      </div>

      {/* Answer Area */}
      {isClickLine ? (
        <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#58A6FF]/10 text-[#58A6FF] flex items-center justify-center font-mono font-bold text-sm">
              {selectedLine !== null ? selectedLine : '?'}
            </div>
            <div>
              <div className="text-sm font-medium text-[#C9D1D9]">
                {selectedLine !== null ? `Line ${selectedLine} selected` : 'No line selected yet'}
              </div>
              <div className="text-xs text-[#8B949E]">
                Click anywhere on the buggy line inside the code snippet above
              </div>
            </div>
          </div>

          <button
            onClick={onSubmit}
            disabled={!hasSelection || disabled || isSubmitting}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
              hasSelection && !disabled && !isSubmitting
                ? 'bg-[#238636] hover:bg-[#2EA043] text-white shadow-lg shadow-[#238636]/20 cursor-pointer active:scale-95'
                : 'bg-[#21262D] text-[#484F58] cursor-not-allowed border border-[#30363D]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Line</span>
            <kbd className="hidden sm:inline text-[10px] bg-black/30 px-1.5 py-0.5 rounded text-white/70">
              ↵ Enter
            </kbd>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {puzzle.options?.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const shortcutKey = idx + 1;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (!disabled) {
                      playClick();
                      onSelectOption(opt);
                    }
                  }}
                  disabled={disabled}
                  className={`relative text-left p-3.5 rounded-lg border transition-all flex items-start gap-3 group ${
                    isSelected
                      ? 'bg-[#1F6FEB]/15 border-[#58A6FF] text-white shadow-md'
                      : 'bg-[#0D1117] border-[#30363D] hover:border-[#8B949E] text-[#C9D1D9] hover:bg-[#161B22]'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#58A6FF] text-black'
                        : 'bg-[#21262D] text-[#8B949E] group-hover:text-white'
                    }`}
                  >
                    {shortcutKey}
                  </span>

                  <span className="font-mono text-xs sm:text-sm break-words flex-1 leading-relaxed">
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-[#8B949E] flex items-center gap-1.5">
              <CornerDownLeft className="w-3.5 h-3.5" />
              <span>Press 1-4 to select, Enter to lock in answer</span>
            </div>

            <button
              onClick={onSubmit}
              disabled={!hasSelection || disabled || isSubmitting}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                hasSelection && !disabled && !isSubmitting
                  ? 'bg-[#238636] hover:bg-[#2EA043] text-white shadow-lg shadow-[#238636]/20 cursor-pointer active:scale-95'
                  : 'bg-[#21262D] text-[#484F58] cursor-not-allowed border border-[#30363D]'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Answer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
