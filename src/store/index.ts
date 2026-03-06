import { create } from 'zustand';
import { createTokenSlice, type TokenSlice } from './tokenSlice.ts';
import { createEditorSlice, type EditorSlice } from './editorSlice.ts';
import { createPrintSlice, type PrintSlice } from './printSlice.ts';

export type AppStore = TokenSlice & EditorSlice & PrintSlice;

export const useStore = create<AppStore>()((...a) => ({
  ...createTokenSlice(...a),
  ...createEditorSlice(...a),
  ...createPrintSlice(...a),
}));
