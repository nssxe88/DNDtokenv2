import type { StateCreator } from 'zustand';
import type { EditorState } from '../types/index.ts';
import { DEFAULT_GRID_SIZE_MM } from '../utils/constants.ts';

export interface EditorSlice extends EditorState {
  // Modal state
  cropModalTokenId: string | null;

  setMode: (mode: EditorState['mode']) => void;
  selectToken: (id: string) => void;
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  selectTokens: (ids: string[]) => void;
  clearSelection: () => void;
  setZoom: (zoom: number) => void;
  setPanOffset: (x: number, y: number) => void;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
  toggleGuides: () => void;
  toggleCutMarks: () => void;
  setGridSize: (sizeMm: number) => void;
  openCropModal: (tokenId: string) => void;
  closeCropModal: () => void;
}

export const createEditorSlice: StateCreator<EditorSlice> = (set) => ({
  mode: 'edit',
  selectedTokenIds: [],
  zoom: 1,
  panOffset: { x: 0, y: 0 },
  gridEnabled: false,
  gridSizeMm: DEFAULT_GRID_SIZE_MM,
  snapToGrid: false,
  showGuides: true,
  showCutMarks: false,
  cropModalTokenId: null,

  setMode: (mode) => set({ mode }),

  selectToken: (id) => set({ selectedTokenIds: [id] }),

  addToSelection: (id) =>
    set((state) => ({
      selectedTokenIds: state.selectedTokenIds.includes(id)
        ? state.selectedTokenIds
        : [...state.selectedTokenIds, id],
    })),

  removeFromSelection: (id) =>
    set((state) => ({
      selectedTokenIds: state.selectedTokenIds.filter((tid) => tid !== id),
    })),

  selectTokens: (ids) => set({ selectedTokenIds: ids }),

  clearSelection: () => set({ selectedTokenIds: [] }),

  setZoom: (zoom) => set({ zoom }),

  setPanOffset: (x, y) => set({ panOffset: { x, y } }),

  toggleGrid: () => set((state) => ({ gridEnabled: !state.gridEnabled })),

  toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),

  toggleGuides: () => set((state) => ({ showGuides: !state.showGuides })),

  toggleCutMarks: () => set((state) => ({ showCutMarks: !state.showCutMarks })),

  setGridSize: (sizeMm) => set({ gridSizeMm: sizeMm }),

  openCropModal: (tokenId) => set({ cropModalTokenId: tokenId }),

  closeCropModal: () => set({ cropModalTokenId: null }),
});
