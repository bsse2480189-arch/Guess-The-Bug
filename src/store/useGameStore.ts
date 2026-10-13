import { create } from 'zustand';

interface GameStoreState {
  selectedLanguage: string | null;
  setSelectedLanguage: (langId: string) => void;
  resetLanguage: () => void;
  hasConfirmedLanguage: boolean;
  setHasConfirmedLanguage: (confirmed: boolean) => void;
}

const STORAGE_KEY_LANG = 'guessthebug_selected_language';
const STORAGE_KEY_CONFIRMED = 'guessthebug_language_confirmed';

export const useGameStore = create<GameStoreState>((set) => ({
  selectedLanguage: typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_LANG) : null,
  hasConfirmedLanguage: typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_CONFIRMED) === 'true' : false,

  setSelectedLanguage: (langId: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_LANG, langId);
    }
    set({ selectedLanguage: langId });
  },

  resetLanguage: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_CONFIRMED);
    }
    set({ hasConfirmedLanguage: false });
  },

  setHasConfirmedLanguage: (confirmed: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CONFIRMED, confirmed ? 'true' : 'false');
    }
    set({ hasConfirmedLanguage: confirmed });
  }
}));
