import { create } from 'zustand';
import { createTokenSlice, type TokenSlice } from './tokenSlice.ts';
import { createEditorSlice, type EditorSlice } from './editorSlice.ts';
import { createPrintSlice, type PrintSlice } from './printSlice.ts';
import { createLibrarySlice, type LibrarySlice } from './librarySlice.ts';

export type AppStore = TokenSlice & EditorSlice & PrintSlice & LibrarySlice;

export const useStore = create<AppStore>()((...a) => ({
  ...createTokenSlice(...a),
  ...createEditorSlice(...a),
  ...createPrintSlice(...a),
  ...createLibrarySlice(...a),
}));
