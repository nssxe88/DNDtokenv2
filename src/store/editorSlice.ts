import type { StateCreator } from 'zustand';
import type { EditorState } from '../types/index.ts';
import { DEFAULT_GRID_SIZE_MM } from '../utils/constants.ts';

export interface EditorSlice extends EditorState {
  // Modal state
  cropModalTokenId: string | null;
  exportModalOpen: boolean;

  // Sidebar state (responsive)
  sidebarOpen: boolean;

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
  toggleShowCutMarks: () => void;
  setGridSize: (sizeMm: number) => void;
  openCropModal: (tokenId: string) => void;
  closeCropModal: () => void;
  openExportModal: () => void;
  closeExportModal: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
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
  exportModalOpen: false,
  sidebarOpen: true,

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

  toggleShowCutMarks: () => set((state) => ({ showCutMarks: !state.showCutMarks })),

  setGridSize: (sizeMm) => set({ gridSizeMm: sizeMm }),

  openCropModal: (tokenId) => set({ cropModalTokenId: tokenId }),

  closeCropModal: () => set({ cropModalTokenId: null }),

  openExportModal: () => set({ exportModalOpen: true }),

  closeExportModal: () => set({ exportModalOpen: false }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
});
