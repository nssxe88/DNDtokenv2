import type { StateCreator } from 'zustand';
import type { PrintSettings, PaperSize, CustomPaperSize } from '../types/index.ts';
import { DEFAULT_PAPER_MARGINS_MM, DEFAULT_TOKEN_SPACING_MM } from '../utils/constants.ts';

export interface PrintSlice extends PrintSettings {
  setPaperSize: (size: PaperSize) => void;
  setCustomPaperSize: (size: CustomPaperSize) => void;
  setOrientation: (orientation: PrintSettings['orientation']) => void;
  setMargins: (mm: number) => void;
  setSpacing: (mm: number) => void;
  setUnit: (unit: PrintSettings['unit']) => void;
  toggleCutMarks: () => void;
  setBleed: (mm: number) => void;
}

export const createPrintSlice: StateCreator<PrintSlice> = (set) => ({
  paperSize: 'a4',
  customPaperSize: null,
  orientation: 'portrait',
  margins: DEFAULT_PAPER_MARGINS_MM,
  spacing: DEFAULT_TOKEN_SPACING_MM,
  unit: 'mm',
  cutMarks: false,
  bleed: 0,

  setPaperSize: (paperSize) => set({ paperSize }),

  setCustomPaperSize: (customPaperSize) =>
    set({ paperSize: 'custom', customPaperSize }),

  setOrientation: (orientation) => set({ orientation }),

  setMargins: (margins) => set({ margins }),

  setSpacing: (spacing) => set({ spacing }),

  setUnit: (unit) => set({ unit }),

  toggleCutMarks: () => set((state) => ({ cutMarks: !state.cutMarks })),

  setBleed: (bleed) => set({ bleed }),
});
