import React, { useState } from 'react';
import { Language, QuestionType } from '../types/game';
import { highlightLine, TOKEN_COLOR_MAP } from '../lib/syntax';
import { Bug, Check, Copy, AlertTriangle, FileCode } from 'lucide-react';
import { playClick } from '../lib/audio';

interface CodeViewerProps {
  code: string;
  language: Language;
  questionType: QuestionType;
  selectedLine?: number;
  onSelectLine?: (lineNum: number) => void;
  isRevealed?: boolean;
  actualBugLine?: number;
  fontSize?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

const LANGUAGE_LABELS: Record<string, { name: string; color: string; icon: string }> = {
  python: { name: 'Python', color: '#3572A5', icon: '🐍' },
  javascript: { name: 'JavaScript', color: '#F7DF1E', icon: '⚡' },
  typescript: { name: 'TypeScript', color: '#3178C6', icon: '🔷' },
  java: { name: 'Java', color: '#B07219', icon: '☕' },
  c: { name: 'C', color: '#A8B9CC', icon: '⚙️' },
  cpp: { name: 'C++', color: '#F34B7D', icon: '⚙️' },
  csharp: { name: 'C#', color: '#239120', icon: '🎯' },
  html: { name: 'HTML5', color: '#E34F26', icon: '🌐' },
  css: { name: 'CSS3', color: '#1572B6', icon: '🎨' },
  sql: { name: 'SQL', color: '#4479A1', icon: '🗄️' },
  php: { name: 'PHP', color: '#777BB4', icon: '🐘' },
  ruby: { name: 'Ruby', color: '#CC342D', icon: '💎' },
  go: { name: 'Go', color: '#00ADD8', icon: '🐹' },
  rust: { name: 'Rust', color: '#DEA584', icon: '🦀' },
  kotlin: { name: 'Kotlin', color: '#7F52FF', icon: '📱' },
  swift: { name: 'Swift', color: '#F05138', icon: '🦅' },
  random: { name: 'Random Stack', color: '#58A6FF', icon: '🎲' }
};

const DEFAULT_LANG = { name: 'Code', color: '#58A6FF', icon: '💻' };

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language,
  questionType,
  selectedLine,
  onSelectLine,
  isRevealed = false,
  actualBugLine,
  fontSize = 'md',
  interactive = true
}) => {
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n');
  const isClickLineMode = questionType === 'click_line';

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  const fontSizeClasses = {
    sm: 'text-xs leading-5',
    md: 'text-sm leading-6',
    lg: 'text-base leading-7'
  }[fontSize];

  return (
    <div className="w-full bg-[#0D1117] rounded-xl border border-[#30363D] overflow-hidden shadow-2xl flex flex-col">
      {/* Editor Header */}
      <div className="bg-[#161B22] border-b border-[#30363D] px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          {/* Window control dots */}
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56]/80 border border-[#E0443E]" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E]/80 border border-[#DEA123]" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F]/80 border border-[#1AAB29]" />
          </div>

          {/* Language tag */}
          <div className="flex items-center gap-1.5 font-mono text-[#C9D1D9] pl-2 border-l border-[#30363D]">
            <span>{(LANGUAGE_LABELS[language] || DEFAULT_LANG).icon}</span>
            <span className="font-semibold">{(LANGUAGE_LABELS[language] || DEFAULT_LANG).name}</span>
            <span className="text-[#8B949E] text-[11px] hidden sm:inline">snippet</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isClickLineMode && !isRevealed && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#58A6FF] font-mono bg-[#58A6FF]/10 border border-[#58A6FF]/20 px-2.5 py-0.5 rounded">
              <Bug className="w-3 h-3 animate-pulse" />
              <span>Click the buggy line</span>
            </div>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#C9D1D9] transition-all font-mono text-[11px]"
            title="Copy snippet"
          >
            {copied ? <Check className="w-3 h-3 text-[#3FB950]" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Code Area with gutter */}
      <div className="relative overflow-x-auto p-2 sm:p-4 font-mono select-none">
        <div className={`table w-full ${fontSizeClasses}`}>
          {lines.map((line, idx) => {
            const lineNum = idx + 1;
            const isSelected = selectedLine === lineNum;
            const isActualBug = isRevealed && actualBugLine === lineNum;
            const isUserWrongSelection = isRevealed && isSelected && selectedLine !== actualBugLine;
            const canClick = isClickLineMode && !isRevealed && interactive;

            let rowBg = 'hover:bg-[#161B22]/60';
            if (isActualBug) {
              rowBg = 'bg-[#3FB950]/15 border-l-4 border-l-[#3FB950]';
            } else if (isUserWrongSelection) {
              rowBg = 'bg-[#F85149]/20 border-l-4 border-l-[#F85149]';
            } else if (isSelected) {
              rowBg = 'bg-[#58A6FF]/20 border-l-4 border-l-[#58A6FF]';
            }

            const tokens = highlightLine(line, language);

            return (
              <div
                key={lineNum}
                onClick={() => {
                  if (canClick && onSelectLine) {
                    playClick();
                    onSelectLine(lineNum);
                  }
                }}
                className={`table-row group transition-colors ${rowBg} ${
                  canClick ? 'cursor-pointer' : ''
                }`}
                role={canClick ? 'button' : undefined}
                tabIndex={canClick ? 0 : undefined}
                onKeyDown={e => {
                  if (canClick && (e.key === 'Enter' || e.key === ' ') && onSelectLine) {
                    e.preventDefault();
                    playClick();
                    onSelectLine(lineNum);
                  }
                }}
                aria-label={`Line ${lineNum}`}
              >
                {/* Gutter: Line Number */}
                <div className="table-cell pr-3 sm:pr-4 pl-1 text-right text-[#484F58] group-hover:text-[#8B949E] transition-colors select-none w-8 sm:w-12 tabular-nums align-top">
                  <div className="flex items-center justify-end gap-1">
                    {isSelected && !isRevealed && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#58A6FF]" />
                    )}
                    {isActualBug && (
                      <Bug className="w-3.5 h-3.5 text-[#3FB950] animate-bounce" />
                    )}
                    {isUserWrongSelection && (
                      <AlertTriangle className="w-3.5 h-3.5 text-[#F85149]" />
                    )}
                    <span>{lineNum}</span>
                  </div>
                </div>

                {/* Code line content */}
                <div className="table-cell pl-2 sm:pl-3 pr-4 whitespace-pre font-mono select-text align-top">
                  {tokens.length === 0 || line.trim() === '' ? (
                    <span>&nbsp;</span>
                  ) : (
                    tokens.map((token, tIdx) => (
                      <span key={tIdx} className={TOKEN_COLOR_MAP[token.type]}>
                        {token.text}
                      </span>
                    ))
                  )}

                  {/* Inline indicator badge on reveal */}
                  {isActualBug && (
                    <span className="ml-3 inline-flex items-center gap-1 text-[11px] font-sans font-semibold text-[#3FB950] bg-[#3FB950]/20 px-2 py-0.5 rounded border border-[#3FB950]/30 animate-pulse">
                      🐛 BUG IS HERE
                    </span>
                  )}
                  {isUserWrongSelection && (
                    <span className="ml-3 inline-flex items-center gap-1 text-[11px] font-sans font-semibold text-[#F85149] bg-[#F85149]/20 px-2 py-0.5 rounded border border-[#F85149]/30">
                      ❌ YOUR SELECTION
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
