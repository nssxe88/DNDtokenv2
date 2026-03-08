import { create } from 'zustand';
import { createTokenSlice, type TokenSlice } from './tokenSlice.ts';
import { createEditorSlice, type EditorSlice } from './editorSlice.ts';
import { createPrintSlice, type PrintSlice } from './printSlice.ts';
import { createLibrarySlice, type LibrarySlice } from './librarySlice.ts';
import { createGallerySlice, type GallerySlice } from './gallerySlice.ts';
import { createHistorySlice, type HistorySlice } from './historySlice.ts';
import { createProjectSlice, type ProjectSlice } from './projectSlice.ts';
import { createConsentSlice, type ConsentSlice } from './consentSlice.ts';
import { createLanguageSlice, type LanguageSlice } from './languageSlice.ts';

export type AppStore = TokenSlice &
  EditorSlice &
  PrintSlice &
  LibrarySlice &
  GallerySlice &
  HistorySlice &
  ProjectSlice &
  ConsentSlice &
  LanguageSlice;

export const useStore = create<AppStore>()((...a) => ({
  ...createTokenSlice(...a),
  ...createEditorSlice(...a),
  ...createPrintSlice(...a),
  ...createLibrarySlice(...a),
  ...createGallerySlice(...a),
  ...createHistorySlice(...a),
  ...createProjectSlice(...a),
  ...createConsentSlice(...a),
  ...createLanguageSlice(...a),
}));
