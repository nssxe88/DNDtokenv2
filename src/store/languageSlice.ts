import type { StateCreator } from 'zustand';
import { type Language, detectBrowserLanguage } from '../i18n/index.ts';

const STORAGE_KEY = 'ftp-language';

function loadLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'hu') {
    return stored;
  }
  return detectBrowserLanguage();
}

export interface LanguageSlice {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const createLanguageSlice: StateCreator<LanguageSlice> = (set) => ({
  language: loadLanguage(),
  setLanguage: (lang) => {
    localStorage.setItem(STORAGE_KEY, lang);
    set({ language: lang });
  },
});
