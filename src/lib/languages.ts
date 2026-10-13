export interface LanguageInfo {
  id: string;
  name: string;
  puzzleCount: number;
  color: string;
  bgGlow: string;
  tagline: string;
  extension: string;
  iconSvg: string; // Raw inline SVG markup
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    id: 'python',
    name: 'Python',
    puzzleCount: 28,
    color: '#3776AB',
    bgGlow: 'rgba(55, 118, 171, 0.25)',
    tagline: 'Mutable defaults, scoping, GIL & tuples',
    extension: '.py',
    iconSvg: `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M63.3 5C45.2 5 33.7 13.1 33.7 25.1v10.3h29.9v4.1H23.5C11.5 39.5 5 49.3 5 63.7c0 14.7 7.7 24.3 22 24.3h7.2v-11.4c0-12 10.3-21.7 22.8-21.7h29.8c7.5 0 13.5-6.1 13.5-13.7V25.1C100.3 13.1 84.7 5 63.3 5zm-14 11.4c3.4 0 6.2 2.8 6.2 6.2 0 3.4-2.8 6.2-6.2 6.2-3.4 0-6.2-2.8-6.2-6.2 0-3.4 2.8-6.2 6.2-6.2z" fill="#3776AB"/>
      <path d="M64.7 123c18.1 0 29.6-8.1 29.6-20.1V92.6H64.4v-4.1h40.1c12 0 18.5-9.8 18.5-24.2 0-14.7-7.7-24.3-22-24.3h-7.2v11.4c0 12-10.3 21.7-22.8 21.7H41.2c-7.5 0-13.5 6.1-13.5 13.7v15.8c0 12 15.6 20.1 37 20.1zm14-11.4c-3.4 0-6.2-2.8-6.2-6.2 0-3.4 2.8-6.2 6.2-6.2 3.4 0 6.2 2.8 6.2 6.2 0 3.4-2.8 6.2-6.2 6.2z" fill="#FFD43B"/>
    </svg>`
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    puzzleCount: 26,
    color: '#F7DF1E',
    bgGlow: 'rgba(247, 223, 30, 0.25)',
    tagline: 'Coercion, event loop, closures & ASI',
    extension: '.js',
    iconSvg: `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="16" fill="#F7DF1E"/>
      <path d="M85.4 99.2c-4.4 2.6-9.6 4-15 4-14.7 0-23.7-9.1-23.7-24.8 0-16.7 9.8-25.9 25.1-25.9 5.3 0 10.1 1.3 14 3.7l-4.5 9.7c-3-1.8-6.4-2.8-10.1-2.8-8.8 0-13.7 5.7-13.7 15.1 0 8.8 4.7 14.5 13.5 14.5 3.7 0 7.3-1 10.4-2.9l4 9.4zm32 0c-4.6 2.7-10.4 4.1-16.2 4.1-12.8 0-20.7-7.2-20.7-19.1 0-10.2 6.7-16.4 17.6-18.7l5.4-1.1c5.2-1.1 7.2-2.9 7.2-6.2 0-4.3-3.6-7.1-9.6-7.1-4.7 0-9.2 1.5-12.9 4.3l-4.4-8.9c5.1-3.6 11.9-5.6 18.6-5.6 12.8 0 19.8 7 19.8 17.7 0 9.8-6.1 15.8-16.8 18l-5.6 1.2c-5.5 1.1-7.8 3.2-7.8 6.9 0 4.8 4.1 8 10.7 8 5.4 0 10.4-1.6 14.7-4.6l4 9.4z" fill="#000000" fill-opacity="0"/>
      <path d="M67.3 100.8c-3.8 2.2-8.3 3.4-13 3.4-11.8 0-18.6-6.4-18.6-17.7v-33h12v31.8c0 5.4 3 8.3 7.8 8.3 3.2 0 6.2-1 8.4-2.8l3.4 10zm49.9-2.8c-5.2 3.6-11.9 5.5-18.8 5.5-13.2 0-21-7.1-21-18.7 0-11 7.2-17.6 18.9-20l6.2-1.3c4.7-1 6.8-2.6 6.8-5.7 0-4-3.5-6.6-9.1-6.6-4.9 0-9.7 1.6-13.7 4.7l-4.7-9.4c5.9-4 13.3-6.2 20.3-6.2 13.4 0 20.7 7.2 20.7 18.2 0 10.9-7.2 17.3-18.8 19.7l-6.3 1.3c-4.9 1-6.8 2.8-6.8 6.2 0 4.4 3.7 7.3 9.8 7.3 5.4 0 10.6-1.7 14.8-4.7l4 9.7z" fill="#000000"/>
    </svg>`
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    puzzleCount: 22,
    color: '#3178C6',
    bgGlow: 'rgba(49, 120, 198, 0.25)',
    tagline: 'Generics, union narrowing & any traps',
    extension: '.ts',
    iconSvg: `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="128" rx="16" fill="#3178C6"/>
      <path d="M64 50.7H41.5V104h-12V50.7H7V40.5h57v10.2zm51.7 47.7c-5.2 3.6-11.9 5.5-18.8 5.5-13.2 0-21-7.1-21-18.7 0-11 7.2-17.6 18.9-20l6.2-1.3c4.7-1 6.8-2.6 6.8-5.7 0-4-3.5-6.6-9.1-6.6-4.9 0-9.7 1.6-13.7 4.7l-4.7-9.4c5.9-4 13.3-6.2 20.3-6.2 13.4 0 20.7 7.2 20.7 18.2 0 10.9-7.2 17.3-18.8 19.7l-6.3 1.3c-4.9 1-6.8 2.8-6.8 6.2 0 4.4 3.7 7.3 9.8 7.3 5.4 0 10.6-1.7 14.8-4.7l4 9.7z" fill="#FFFFFF"/>
    </svg>`
  },
  {
    id: 'java',
    name: 'Java',
    puzzleCount: 24,
    color: '#ED8B00',
    bgGlow: 'rgba(237, 139, 0, 0.25)',
    tagline: 'Autoboxing, equals vs == & concurrency',
    extension: '.java',
    iconSvg: `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M47.7 89.2c-4.5.3-9.5-2-12.8-5.2-1.5-1.5-3.3-4.2-3.8-5.5-.3-.7-.2-.9.4-.9 1.1 0 4.8 1.9 6.8 3.5 6.4 5.2 15.6 5.8 23.3 1.5 2.5-1.4 6.7-5.1 6.7-5.9 0-.3.4-.4.8-.2 1.4.9-.7 3.8-3.4 5.7-4.8 3.5-12.8 6.6-18 7zm36.8-15.6c-.6-.4-.6-.7-.1-.9 2.5-1.3 5-4.2 5.5-6.6.2-.9.2-.9-1-.1-2.9 2-8 3.6-12.2 4-5.3.5-11.7-.8-17-3.4-3.5-1.7-5.7-2.1-9.7-1.8-4.5.3-8.8 2.3-12.7 5.7-1.3 1.1-2.6 2-2.9 2-.4 0 .1-.8 1.1-1.7 3.9-3.7 7.7-5.4 13.5-5.9 4-.3 6.6.3 10.8 2.2 4.6 2 11.2 3.2 15.9 2.7 5.2-.6 10.8-2.8 13.8-5.4.9-.8 1.7-1.3 1.8-1.2.2.3-.5 1.8-1.5 3-2.6 3.1-6.2 5.9-8.7 6.7-1 .3-.8.7.2.7 1.4 0 3.3-1.3 4.8-3.3.4-.5.8-.8.9-.7.4.4-1.2 2.8-2.6 4-1.6 1.3-1.6 1.4-.4 1.4 1.1 0 3.1-1.8 4.3-3.8.4-.7.8-1.1.9-.9.4.6-2.6 4.3-4.4 5.3-1.2.7-2.7 1.4-3.3 1.5-.7.2-.6.4.2.4 1 0 3.7-1.7 4.7-3 .3-.5.7-.7.8-.5.3.7-3.8 4.3-5.7 5z" fill="#ED8B00"/>
      <path d="M49.6 112.5c-7.6-.7-16.7-3.8-20.9-7.1-2.2-1.8-4.4-4.8-4.3-6 .1-.4.5-.3 1.2.4 3.7 3.7 12 7.2 20.3 8.5 13.9 2.2 30.6-.2 41.3-6.1 3.5-1.9 7.7-5.6 7.7-6.8 0-.4.3-.5.7-.3 1.4 1-5 5.9-10.7 8.3-9.5 4-25.5 7.9-35.3 7.1z" fill="#5382A1"/>
      <path d="M72.3 35.8c-2.3 2.9-4.8 5.4-8 8.1-4.8 4.1-6.7 6.9-6.3 9.4.5 3 4.2 5.2 10.2 6.3 1.5.3 2.8.6 2.8.8 0 .4-3.5 1.5-5.9 1.8-7.7 1-13-1.7-13.8-7.1-.6-4 1.6-7.8 7.3-12.7 3.8-3.3 6.9-6.9 7.9-9.1.8-1.8.8-3 .1-3.6-1.1-.9-3.7.6-5.8 3.5-3.1 4.1-4.4 8.7-3.4 11.6.4 1.1.2 1.3-.8.6-2.5-1.8-3.4-5.2-2.1-8.5 1.3-3.3 4.9-7.1 8.9-9.4 3.4-2 6.5-2.6 8.5-1.7 3.3 1.4 3.5 4.1.5 10.6z" fill="#ED8B00"/>
    </svg>`
  },
  {
    id: 'c',
    name: 'C',
    puzzleCount: 20,
    color: '#A8B9CC',
    bgGlow: 'rgba(168, 185, 204, 0.25)',
    tagline: 'Buffer overflows, pointers & malloc leaks',
    extension: '.c',
    iconSvg: `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M115.4 31.6L67.7 4.1c-2.3-1.3-5.1-1.3-7.4 0L12.6 31.6C10.3 33 8.9 35.4 8.9 38v52c0 2.6 1.4 5.1 3.7 6.4l47.7 27.5c2.3 1.3 5.1 1.3 7.4 0l47.7-27.5c2.3-1.3 3.7-3.8 3.7-6.4V38c0-2.6-1.4-5-3.7-6.4z" fill="#00599C"/>
      <path d="M64 26.6c-20.7 0-37.4 16.7-37.4 37.4s16.7 37.4 37.4 37.4c12.2 0 23.3-5.9 30.1-15.6l-13.4-7.8c-4 5.8-10.4 9.4-16.7 9.4-12.9 0-23.4-10.5-23.4-23.4s10.5-23.4 23.4-23.4c6.3 0 12.7 3.6 16.7 9.4l13.4-7.8C87.3 32.5 76.2 26.6 64 26.6z" fill="#FFFFFF"/>
    </svg>`
  },
  {
    id: 'cpp',
    name: 'C++',
    puzzleCount: 22,
    color: '#00599C',
    bgGlow: 'rgba(0, 89, 156, 0.25)',
    tagline: 'UB, iterator invalidation & destructors',
    extension: '.cpp',
    iconSvg: `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M115.4 31.6L67.7 4.1c-2.3-1.3-5.1-1.3-7.4 0L12.6 31.6C10.3 33 8.9 35.4 8.9 38v52c0 2.6 1.4 5.1 3.7 6.4l47.7 27.5c2.3 1.3 5.1 1.3 7.4 0l47.7-27.5c2.3-1.3 3.7-3.8 3.7-6.4V38c0-2.6-1.4-5-3.7-6.4z" fill="#00599C"/>
      <path d="M52 32c-17.7 0-32 14.3-32 32s14.3 32 32 32c10.4 0 19.9-5 25.7-13.3l-11.5-6.7c-3.4 5-8.9 8-14.2 8-11 0-20-9-20-20s9-20 20-20c5.3 0 10.8 3 14.2 8l11.5-6.7C71.9 37 62.4 32 52 32zm30 26v-9h6v9h9v6h-9v9h-6v-9h-9v-6h9zm22 0v-9h6v9h9v6h-9v9h-6v-9h-9v-6h9z" fill="#FFFFFF"/>
    </svg>`
  },
  {
    id: 'csharp',
    name: 'C#',
    puzzleCount: 18,
    color: '#239120',
    bgGlow: 'rgba(35, 145, 32, 0.25)',
    tagline: 'LINQ lazy eval, async void & delegates',
    extension: '.cs',
    iconSvg: `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M115.4 31.6L67.7 4.1c-2.3-1.3-5.1-1.3-7.4 0L12.6 31.6C10.3 33 8.9 35.4 8.9 38v52c0 2.6 1.4 5.1 3.7 6.4l47.7 27.5c2.3 1.3 5.1 1.3 7.4 0l47.7-27.5c2.3-1.3 3.7-3.8 3.7-6.4V38c0-2.6-1.4-5-3.7-6.4z" fill="#68217A"/>
      <path d="M52 36c-15.5 0-28 12.5-28 28s12.5 28 28 28c9.1 0 17.4-4.4 22.5-11.6l-10-5.8c-3 4.4-7.8 7-12.5 7-9.9 0-18-8.1-18-18s8.1-18 18-18c4.7 0 9.5 2.6 12.5 7l10-5.8C69.4 40.4 61.1 36 52 36zm38 18l1.5-6h5l-1.5 6h6v4h-7l-1.5 6h6v4h-7l-2 8h-5l2-8h-6l-2 8h-5l2-8h-6v-4h7l1.5-6h-6v-4h7l2-8h5l-2 8h6zm-4.5 10l1.5-6h-6l-1.5 6h6z" fill="#FFFFFF"/>
    </svg>`
  },
  {
    id: 'html',
    name: 'HTML',
    puzzleCount: 16,
    color: '#E34F26',
    bgGlow: 'rgba(227, 79, 38, 0.25)',
    tagline: 'Self-closing tags, script defer & forms',
    extension: '.html',
    iconSvg: `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.1 113.8L9.9 10.7h108.2l-9.2 103.1L64 125.1l-44.9-11.3z" fill="#E34F26"/>
      <path d="M64 115.8l37.2-9.4 7.7-86.7H64v96.1z" fill="#EF652A"/>
      <path d="M64 52.8H46.5l-1.2-13.4H64V26H31.7l3.6 40.3H64V52.8zm0 33.6l-19.1-5.1-1.2-13.4H30.3l2.4 27 31.3 8.7V86.4z" fill="#EBEBEB"/>
      <path d="M64 52.8h17.5l-1.7 18.5-15.8 4.3v13.5l31.2-8.7.4-4.8 3.5-39.6.3-3.6H64v13.4zm0-26.8h33.8l.3-3.4.6-6.6.3-3.4H64V26z" fill="#FFFFFF"/>
    </svg>`
  },
  {
    id: 'css',
    name: 'CSS',
    puzzleCount: 18,
    color: '#1572B6',
    bgGlow: 'rgba(21, 114, 182, 0.25)',
    tagline: 'Specificity wars, z-index & flexbox wrap',
    extension: '.css',
    iconSvg: `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.1 113.8L9.9 10.7h108.2l-9.2 103.1L64 125.1l-44.9-11.3z" fill="#1572B6"/>
      <path d="M64 115.8l37.2-9.4 7.7-86.7H64v96.1z" fill="#33A9DC"/>
      <path d="M64 52.8H46.5l-1.2-13.4H64V26H31.7l3.6 40.3H64V52.8zm0 33.6l-19.1-5.1-1.2-13.4H30.3l2.4 27 31.3 8.7V86.4z" fill="#EBEBEB"/>
      <path d="M64 52.8h17.5l-1.7 18.5-15.8 4.3v13.5l31.2-8.7.4-4.8 3.5-39.6.3-3.6H64v13.4zm0-26.8h33.8l.3-3.4.6-6.6.3-3.4H64V26z" fill="#FFFFFF"/>
    </svg>`
  },
  {
    id: 'sql',
    name: 'SQL',
    puzzleCount: 20,
    color: '#4479A1',
    bgGlow: 'rgba(68, 121, 161, 0.25)',
    tagline: 'NULL in NOT IN, JOIN cartesian & GROUP BY',
    extension: '.sql',
    iconSvg: `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M64 8C33.1 8 8 18.7 8 32v64c0 13.3 25.1 24 56 24s56-10.7 56-24V32c0-13.3-25.1-24-56-24zm0 16c26.5 0 48 8.1 48 16s-21.5 16-48 16-48-8.1-48-16 21.5-16 48-16zm0 32c26.5 0 48 8.1 48 16s-21.5 16-48 16-48-8.1-48-16 21.5-16 48-16zm0 32c26.5 0 48 8.1 48 16s-21.5 16-48 16-48-8.1-48-16 21.5-16 48-16z" fill="#00758F"/>
      <ellipse cx="64" cy="32" rx="48" ry="16" fill="#F29111"/>
    </svg>`
  },
  {
    id: 'php',
    name: 'PHP',
    puzzleCount: 18,
    color: '#777BB4',
    bgGlow: 'rgba(119, 123, 180, 0.25)',
    tagline: 'Loose comparisons, array merge & references',
    extension: '.php',
    iconSvg: `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M64 16C28.7 16 0 37.5 0 64s28.7 48 64 48 64-21.5 64-48-28.7-48-64-48z" fill="#777BB4"/>
      <path d="M37.3 43.7H20.4L11 84.3h12.5l3.5-15.3h7.2c11.3 0 17.6-5.8 19.9-15.8 2.2-9.6-2.5-9.5-16.8-9.5zm-5.7 16h-5.2l2.6-11.4h5.2c5.4 0 7.3 1.9 6.2 6.6-1.1 4.7-3.8 4.8-8.8 4.8zm38.1-16H52.8L43.4 84.3h12.5l3.5-15.3h7.2c11.3 0 17.6-5.8 19.9-15.8 2.2-9.6-2.5-9.5-16.8-9.5zm-5.7 16h-5.2l2.6-11.4h5.2c5.4 0 7.3 1.9 6.2 6.6-1.1 4.7-3.8 4.8-8.8 4.8zm38.1-16H85.2L75.8 84.3h12.5l3.5-15.3h7.2c11.3 0 17.6-5.8 19.9-15.8 2.2-9.6-2.5-9.5-16.8-9.5zm-5.7 16h-5.2l2.6-11.4h5.2c5.4 0 7.3 1.9 6.2 6.6-1.1 4.7-3.8 4.8-8.8 4.8z" fill="#232531"/>
    </svg>`
  },
  {
    id: 'ruby',
    name: 'Ruby',
    puzzleCount: 16,
    color: '#CC342D',
    bgGlow: 'rgba(204, 52, 45, 0.25)',
    tagline: 'Blocks vs Procs, nil falsiness & symbols',
    extension: '.rb',
    iconSvg: `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M128 89.6L102.4 128H25.6L0 89.6l64-81.6 64 81.6z" fill="#CC342D"/>
      <path d="M64 8L0 89.6h25.6L64 8z" fill="#E5473E"/>
      <path d="M64 8l38.4 81.6H128L64 8z" fill="#992621"/>
      <path d="M25.6 89.6L64 8l38.4 81.6-38.4 38.4-38.4-38.4z" fill="#A81D17"/>
    </svg>`
  },
  {
    id: 'go',
    name: 'Go',
    puzzleCount: 20,
    color: '#00ADD8',
    bgGlow: 'rgba(0, 173, 216, 0.25)',
    tagline: 'Goroutine leaks, nil slices & shadow vars',
    extension: '.go',
    iconSvg: `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M26.4 57.5c2.2-7.1 8-12.7 15.5-14.8l-4.5-9.3C26.7 36.8 18 45.4 14.8 56.4l11.6 1.1zm60.1 13.9H59.7v10.5h16.2c-2.4 5.9-7.8 9.9-14.1 9.9-8.4 0-15.3-6.9-15.3-15.3s6.9-15.3 15.3-15.3c4.5 0 8.6 2 11.4 5.1l8.1-8.1c-5.2-5.4-12.4-8.7-20.4-8.7C40.6 49.5 29 61.1 29 75.3s11.6 25.8 25.8 25.8c13.7 0 24.8-10.7 25.7-24.2v-5.5zM100 60.7l-9.8 4.2c2.6 6 2.3 12.9-.8 18.7l9.4 4.8c4.6-8.5 5.1-18.7 1.2-27.7z" fill="#00ADD8"/>
    </svg>`
  },
  {
    id: 'rust',
    name: 'Rust',
    puzzleCount: 22,
    color: '#DEA584',
    bgGlow: 'rgba(222, 165, 132, 0.25)',
    tagline: 'Borrow checker, lifetimes, unwrap & drop',
    extension: '.rs',
    iconSvg: `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M64 8a56 56 0 1056 56A56 56 0 0064 8zm0 102a46 46 0 1146-46 46 46 0 01-46 46z" fill="#CE422B"/>
      <path d="M48 40h20c8.8 0 16 7.2 16 16 0 5.3-2.6 10-6.6 12.9L86 88H72l-8-16H58v16H48V40zm10 24h10c3.3 0 6-2.7 6-6s-2.7-6-6-6H58v12z" fill="#FFFFFF"/>
    </svg>`
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    puzzleCount: 18,
    color: '#7F52FF',
    bgGlow: 'rgba(127, 82, 255, 0.25)',
    tagline: 'Null safety `!!`, coroutines & smart casts',
    extension: '.kt',
    iconSvg: `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M120 120H8L120 8z" fill="#7F52FF"/>
      <path d="M8 120h56L8 64z" fill="#C757BC"/>
      <path d="M8 8l56 56L8 120z" fill="#E4485D"/>
    </svg>`
  },
  {
    id: 'swift',
    name: 'Swift',
    puzzleCount: 18,
    color: '#F05138',
    bgGlow: 'rgba(240, 81, 56, 0.25)',
    tagline: 'Force unwrapping, retain cycles & defer',
    extension: '.swift',
    iconSvg: `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M120.5 86.8c-.5.9-1.1 1.7-1.7 2.5-12.7 16.5-35.3 22.8-55.5 15.6 24.3-11.2 33-31.9 33.1-32.2 0-.2-.1-.3-.2-.3-6.2 3.6-13.3 5.4-20.6 5.4-15.6 0-29.4-8.3-37-20.8 17.5 4.5 32.5-.9 41.3-6.7.2-.1.1-.4-.1-.4-8.7 1.8-19.1-.1-27.2-5.7C41.5 36.4 34 23.9 32.5 10c0-.2-.3-.3-.4-.1C24.4 25.1 14.8 53.6 28.5 76.5 15.4 61.6 15 42.4 17.2 31c0-.2-.3-.4-.4-.2C7.3 46.9 3.5 69.2 14.2 87.7c15.7 27.2 51.5 36.8 80.7 21.8 10.6-5.4 19.3-13.8 25.9-23.7.1-.1 0-.3-.3-1z" fill="#F05138"/>
    </svg>`
  }
];

export const RANDOM_LANGUAGE: LanguageInfo = {
  id: 'random',
  name: 'Surprise Me',
  puzzleCount: 170,
  color: '#58A6FF',
  bgGlow: 'rgba(88, 166, 255, 0.3)',
  tagline: 'Random language each round across all 16 stacks!',
  extension: '.*',
  iconSvg: `<svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="128" height="128" rx="24" fill="#1F6FEB" fill-opacity="0.2" stroke="#58A6FF" stroke-width="4"/>
    <path d="M42 46l14 14-14 14M86 82l-14-14 14-14M64 36v56" stroke="#58A6FF" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="64" cy="64" r="8" fill="#58A6FF"/>
  </svg>`
};
