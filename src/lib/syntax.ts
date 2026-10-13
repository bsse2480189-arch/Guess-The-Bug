// Universal syntax tokenizer for all 16 supported languages
import { Language } from '../types/game';

interface Token {
  text: string;
  type: 'keyword' | 'string' | 'number' | 'comment' | 'function' | 'type' | 'operator' | 'plain';
}

const COMMON_KEYWORDS = new Set(['function', 'return', 'if', 'else', 'for', 'while', 'import', 'class', 'let', 'const', 'var', 'new', 'try', 'catch', 'finally']);

const KEYWORDS: Partial<Record<string, Set<string>>> = {
  python: new Set(['def', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'import', 'from', 'as', 'class', 'try', 'except', 'finally', 'raise', 'with', 'lambda', 'async', 'await', 'pass', 'break', 'continue', 'and', 'or', 'not', 'is', 'None', 'True', 'False', 'yield', 'global', 'nonlocal']),
  javascript: new Set(['function', 'return', 'if', 'else', 'for', 'while', 'const', 'let', 'var', 'import', 'from', 'export', 'default', 'class', 'extends', 'try', 'catch', 'finally', 'throw', 'new', 'async', 'await', 'this', 'typeof', 'instanceof', 'void', 'delete', 'in', 'of', 'switch', 'case', 'break', 'continue', 'null', 'undefined', 'true', 'false']),
  typescript: new Set(['function', 'return', 'if', 'else', 'for', 'while', 'const', 'let', 'var', 'import', 'from', 'export', 'default', 'class', 'interface', 'type', 'enum', 'extends', 'implements', 'try', 'catch', 'finally', 'throw', 'new', 'async', 'await', 'this', 'typeof', 'instanceof', 'as', 'keyof', 'readonly', 'null', 'undefined', 'true', 'false']),
  cpp: new Set(['int', 'double', 'float', 'char', 'void', 'bool', 'auto', 'class', 'struct', 'public', 'private', 'protected', 'virtual', 'override', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'new', 'delete', 'nullptr', 'true', 'false', 'include', 'namespace', 'using', 'std', 'const', 'static', 'template', 'typename']),
  c: new Set(['int', 'char', 'float', 'double', 'void', 'struct', 'union', 'enum', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'sizeof', 'static', 'const', 'typedef', 'volatile']),
  csharp: new Set(['public', 'private', 'protected', 'internal', 'class', 'interface', 'struct', 'record', 'namespace', 'using', 'return', 'if', 'else', 'for', 'foreach', 'while', 'in', 'async', 'await', 'task', 'var', 'new', 'null', 'true', 'false', 'void', 'int', 'string', 'bool', 'override', 'virtual']),
  java: new Set(['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue', 'new', 'this', 'super', 'null', 'true', 'false', 'void', 'int', 'double', 'float', 'boolean', 'char', 'byte', 'short', 'long', 'static', 'final', 'try', 'catch', 'finally', 'throw', 'throws', 'import', 'package']),
  rust: new Set(['fn', 'let', 'mut', 'pub', 'struct', 'enum', 'impl', 'trait', 'match', 'if', 'else', 'for', 'while', 'loop', 'return', 'use', 'mod', 'crate', 'as', 'ref', 'move', 'async', 'await', 'self', 'Self', 'true', 'false', 'Option', 'Result', 'Some', 'None', 'Ok', 'Err']),
  go: new Set(['func', 'return', 'if', 'else', 'for', 'range', 'package', 'import', 'type', 'struct', 'interface', 'var', 'const', 'select', 'chan', 'go', 'defer', 'switch', 'case', 'break', 'continue', 'nil', 'true', 'false', 'make', 'new', 'len', 'cap', 'panic', 'recover']),
  kotlin: new Set(['fun', 'val', 'var', 'class', 'interface', 'object', 'companion', 'return', 'if', 'else', 'for', 'while', 'when', 'is', 'in', 'null', 'true', 'false', 'suspend', 'override', 'public', 'private', 'data']),
  swift: new Set(['func', 'let', 'var', 'class', 'struct', 'enum', 'protocol', 'extension', 'return', 'if', 'else', 'guard', 'for', 'in', 'while', 'switch', 'case', 'break', 'nil', 'true', 'false', 'self', 'Self', 'mutating', 'defer', 'throws', 'try', 'catch', 'async', 'await']),
  ruby: new Set(['def', 'end', 'class', 'module', 'return', 'if', 'elsif', 'else', 'unless', 'while', 'until', 'for', 'in', 'do', 'yield', 'nil', 'true', 'false', 'self', 'require', 'include', 'attr_accessor', 'puts']),
  php: new Set(['function', 'return', 'if', 'else', 'elseif', 'for', 'foreach', 'as', 'while', 'class', 'public', 'private', 'protected', 'static', 'new', 'try', 'catch', 'throw', 'null', 'true', 'false', 'echo', 'use', 'namespace']),
  sql: new Set(['SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'UPDATE', 'DELETE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL', 'AS', 'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'EXISTS', 'COUNT', 'SUM', 'AVG', 'select', 'from', 'where', 'join', 'group', 'order', 'by', 'as', 'and', 'or', 'null', 'is', 'in']),
  html: new Set(['html', 'head', 'body', 'div', 'span', 'p', 'a', 'script', 'style', 'link', 'meta', 'title', 'form', 'input', 'button', 'table', 'tr', 'td', 'th', 'ul', 'ol', 'li', 'header', 'footer', 'nav', 'main', 'section']),
  css: new Set(['display', 'position', 'color', 'background', 'margin', 'padding', 'width', 'height', 'flex', 'grid', 'border', 'font', 'transform', 'transition', 'animation', 'z-index', 'opacity', 'overflow', 'none', 'block', 'flex', 'inline', 'absolute', 'relative', 'fixed', 'sticky'])
};

const TYPES: Partial<Record<string, Set<string>>> = {
  python: new Set(['int', 'str', 'float', 'bool', 'list', 'dict', 'set', 'tuple', 'object']),
  javascript: new Set(['Promise', 'Array', 'Object', 'String', 'Number', 'Boolean', 'Set', 'Map', 'RegExp', 'Date']),
  typescript: new Set(['Promise', 'Array', 'Record', 'Partial', 'string', 'number', 'boolean', 'any', 'unknown', 'never', 'void']),
  cpp: new Set(['string', 'vector', 'map', 'unordered_map', 'pair', 'size_t', 'int64_t', 'uint32_t']),
  java: new Set(['String', 'Integer', 'Boolean', 'Double', 'List', 'ArrayList', 'Map', 'HashMap', 'Set', 'HashSet', 'Optional', 'Object']),
  rust: new Set(['i32', 'u32', 'i64', 'u64', 'f32', 'f64', 'bool', 'str', 'String', 'Vec', 'HashMap']),
  go: new Set(['int', 'int64', 'string', 'bool', 'byte', 'rune', 'error', 'float64'])
};

export function highlightLine(line: string, language: Language): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const len = line.length;
  const kwSet = KEYWORDS[language] || KEYWORDS.javascript || COMMON_KEYWORDS;
  const typeSet = TYPES[language] || TYPES.javascript || new Set();

  while (i < len) {
    const char = line[i];

    // Single-line Comments
    if (
      (char === '#' && (language === 'python' || language === 'ruby' || language === 'php')) ||
      (char === '/' && line[i + 1] === '/') ||
      (char === '-' && line[i + 1] === '-' && language === 'sql') ||
      (line.slice(i, i + 4) === '<!--' && language === 'html')
    ) {
      tokens.push({ text: line.slice(i), type: 'comment' });
      break;
    }

    // Strings
    if (char === '"' || char === "'" || char === '`') {
      const quote = char;
      let j = i + 1;
      let escaped = false;
      while (j < len) {
        if (!escaped && line[j] === quote) {
          j++;
          break;
        }
        if (line[j] === '\\' && !escaped) {
          escaped = true;
        } else {
          escaped = false;
        }
        j++;
      }
      tokens.push({ text: line.slice(i, j), type: 'string' });
      i = j;
      continue;
    }

    // Numbers
    if (/\d/.test(char) && (i === 0 || !/[a-zA-Z_$]/.test(line[i - 1]))) {
      let j = i;
      while (j < len && /[\d.a-fA-FxX]/.test(line[j])) {
        j++;
      }
      tokens.push({ text: line.slice(i, j), type: 'number' });
      i = j;
      continue;
    }

    // Identifiers & keywords
    if (/[a-zA-Z_$@]/.test(char)) {
      let j = i;
      while (j < len && /[a-zA-Z0-9_$@-]/.test(line[j])) {
        j++;
      }
      const word = line.slice(i, j);

      if (kwSet.has(word) || kwSet.has(word.toUpperCase())) {
        tokens.push({ text: word, type: 'keyword' });
      } else if (typeSet.has(word)) {
        tokens.push({ text: word, type: 'type' });
      } else if (line[j] === '(') {
        tokens.push({ text: word, type: 'function' });
      } else {
        tokens.push({ text: word, type: 'plain' });
      }
      i = j;
      continue;
    }

    // Operators & symbols
    if (/[=+\-*/%&|^!<>?:;.,()[\]{}]/.test(char)) {
      tokens.push({ text: char, type: 'operator' });
      i++;
      continue;
    }

    // Whitespace
    let j = i;
    while (j < len && /\s/.test(line[j])) {
      j++;
    }
    if (j > i) {
      tokens.push({ text: line.slice(i, j), type: 'plain' });
      i = j;
    } else {
      tokens.push({ text: char, type: 'plain' });
      i++;
    }
  }

  return tokens;
}

export const TOKEN_COLOR_MAP: Record<Token['type'], string> = {
  keyword: 'text-[#FF7B72] font-semibold',
  string: 'text-[#A5D6FF]',
  number: 'text-[#79C0FF]',
  comment: 'text-[#8B949E] italic',
  function: 'text-[#D2A8FF]',
  type: 'text-[#FFA657]',
  operator: 'text-[#79C0FF]',
  plain: 'text-[#C9D1D9]'
};
