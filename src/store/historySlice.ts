import type { StateCreator } from 'zustand';
import type { Token } from '../types/index.ts';
import type { PrintSettings } from '../types/index.ts';

/**
 * Snapshot of the undoable portion of the store state.
 * Only token data and print settings are tracked — UI state
 * (zoom, pan, selection, modals) is intentionally excluded.
 */
interface HistorySnapshot {
  tokens: Token[];
  paperSize: PrintSettings['paperSize'];
  customPaperSize: PrintSettings['customPaperSize'];
  orientation: PrintSettings['orientation'];
  margins: number;
  spacing: number;
  cutMarks: boolean;
  bleed: number;
}

const MAX_HISTORY = 50;

export interface HistorySlice {
  _past: HistorySnapshot[];
  _future: HistorySnapshot[];
  canUndo: boolean;
  canRedo: boolean;

  /** Call BEFORE mutating state to push a snapshot onto the undo stack. */
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
}

function takeSnapshot(state: Record<string, unknown>): HistorySnapshot {
  const s = state as unknown as HistorySnapshot;
  return {
    tokens: structuredClone(s.tokens),
    paperSize: s.paperSize,
    customPaperSize: s.customPaperSize,
    orientation: s.orientation,
    margins: s.margins,
    spacing: s.spacing,
    cutMarks: s.cutMarks,
    bleed: s.bleed,
  };
}

function applySnapshot(snapshot: HistorySnapshot): Partial<HistorySnapshot> {
  return {
    tokens: structuredClone(snapshot.tokens),
    paperSize: snapshot.paperSize,
    customPaperSize: snapshot.customPaperSize,
    orientation: snapshot.orientation,
    margins: snapshot.margins,
    spacing: snapshot.spacing,
    cutMarks: snapshot.cutMarks,
    bleed: snapshot.bleed,
  };
}

export const createHistorySlice: StateCreator<HistorySlice> = (set, get, api) => ({
  _past: [],
  _future: [],
  canUndo: false,
  canRedo: false,

  pushHistory: () => {
    const state = api.getState() as unknown as Record<string, unknown>;
    const snapshot = takeSnapshot(state);
    set((s) => {
      const newPast = [...s._past, snapshot];
      if (newPast.length > MAX_HISTORY) newPast.shift();
      return {
        _past: newPast,
        _future: [],
        canUndo: true,
        canRedo: false,
      };
    });
  },

  undo: () => {
    const { _past } = get();
    if (_past.length === 0) return;

    const state = api.getState() as unknown as Record<string, unknown>;
    const currentSnapshot = takeSnapshot(state);
    const previous = _past[_past.length - 1];

    set((s) => ({
      ...applySnapshot(previous),
      _past: s._past.slice(0, -1),
      _future: [currentSnapshot, ...s._future],
      canUndo: s._past.length > 1,
      canRedo: true,
    }));
  },

  redo: () => {
    const { _future } = get();
    if (_future.length === 0) return;

    const state = api.getState() as unknown as Record<string, unknown>;
    const currentSnapshot = takeSnapshot(state);
    const next = _future[0];

    set((s) => ({
      ...applySnapshot(next),
      _past: [...s._past, currentSnapshot],
      _future: s._future.slice(1),
      canUndo: true,
      canRedo: s._future.length > 1,
    }));
  },

  clearHistory: () => {
    set({ _past: [], _future: [], canUndo: false, canRedo: false });
  },
});
