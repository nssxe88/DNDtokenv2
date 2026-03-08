import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../../store/index.ts';
import type { Token } from '../../types/index.ts';

describe('historySlice', () => {
  beforeEach(() => {
    // Reset store to initial state
    useStore.setState({
      tokens: [],
      _past: [],
      _future: [],
      canUndo: false,
      canRedo: false,
      paperSize: 'a4',
      customPaperSize: null,
      orientation: 'portrait',
      margins: 10,
      spacing: 5,
      cutMarks: false,
      bleed: 0,
    });
  });

  it('should start with empty history', () => {
    const state = useStore.getState();
    expect(state._past).toEqual([]);
    expect(state._future).toEqual([]);
    expect(state.canUndo).toBe(false);
    expect(state.canRedo).toBe(false);
  });

  it('should push a snapshot to history', () => {
    const state = useStore.getState();

    // Set initial state
    useStore.setState({
      tokens: [{
        id: 'token1',
        originalSrc: 'test.jpg',
        processedSrc: 'test.jpg',
        fileName: 'test.jpg',
        sizeMm: 25,
        sizePreset: 'medium',
        position: { x: 0, y: 0 },
        rotation: 0,
        scale: { x: 1, y: 1 },
        shape: 'circle',
        frame: {
          enabled: false,
          thicknessMm: 2,
          color: '#000000',
          style: 'solid',
          libraryAssetId: null,
        },
        crop: {
          enabled: false,
          cutFrameMm: 0,
        },
        overlayId: null,
        overlayOpacity: 1,
        imageCrop: {
          offsetX: 0,
          offsetY: 0,
          scale: 1,
          rotation: 0,
        },
        filters: {
          brightness: 1,
          contrast: 1,
          saturation: 1,
          hue: 0,
          blur: 0,
          grayscale: false,
          sepia: false,
        },
        count: 1,
        locked: false,
        visible: true,
        zIndex: 0,
      } as Token],
    });

    state.pushHistory();

    const updatedState = useStore.getState();
    expect(updatedState._past.length).toBe(1);
    expect(updatedState._future).toEqual([]);
    expect(updatedState.canUndo).toBe(true);
    expect(updatedState.canRedo).toBe(false);
  });

  it('should undo to previous state', () => {
    const state = useStore.getState();

    // Create initial state
    useStore.setState({ tokens: [], margins: 10 });
    state.pushHistory();

    // Modify state
    useStore.setState({ margins: 20 });

    // Undo
    state.undo();

    const updatedState = useStore.getState();
    expect(updatedState.margins).toBe(10);
    expect(updatedState.canUndo).toBe(false);
    expect(updatedState.canRedo).toBe(true);
  });

  it('should redo to next state', () => {
    const state = useStore.getState();

    // Create initial state
    useStore.setState({ margins: 10 });
    state.pushHistory();

    // Modify and undo
    useStore.setState({ margins: 20 });
    state.undo();

    // Redo
    state.redo();

    const updatedState = useStore.getState();
    expect(updatedState.margins).toBe(20);
    expect(updatedState.canUndo).toBe(true);
    expect(updatedState.canRedo).toBe(false);
  });

  it('should clear future when pushing new history after undo', () => {
    const state = useStore.getState();

    // Create history chain
    useStore.setState({ margins: 10 });
    state.pushHistory();
    useStore.setState({ margins: 20 });
    state.pushHistory();
    useStore.setState({ margins: 30 });

    // Undo twice
    state.undo();
    state.undo();

    expect(useStore.getState().canRedo).toBe(true);

    // Push new history should clear future
    state.pushHistory();

    const updatedState = useStore.getState();
    expect(updatedState._future).toEqual([]);
    expect(updatedState.canRedo).toBe(false);
  });

  it('should clear all history', () => {
    const state = useStore.getState();

    // Create some history
    useStore.setState({ margins: 10 });
    state.pushHistory();
    useStore.setState({ margins: 20 });
    state.pushHistory();

    expect(useStore.getState()._past.length).toBeGreaterThan(0);

    // Clear history
    state.clearHistory();

    const updatedState = useStore.getState();
    expect(updatedState._past).toEqual([]);
    expect(updatedState._future).toEqual([]);
    expect(updatedState.canUndo).toBe(false);
    expect(updatedState.canRedo).toBe(false);
  });

  it('should limit history to MAX_HISTORY (50 items)', () => {
    const state = useStore.getState();

    // Push 60 snapshots
    for (let i = 0; i < 60; i++) {
      useStore.setState({ margins: i });
      state.pushHistory();
    }

    const updatedState = useStore.getState();
    expect(updatedState._past.length).toBe(50);
  });

  it('should not undo when history is empty', () => {
    const state = useStore.getState();
    useStore.setState({ margins: 10 });

    state.undo();

    // Should not change state
    expect(useStore.getState().margins).toBe(10);
    expect(useStore.getState().canUndo).toBe(false);
  });

  it('should not redo when future is empty', () => {
    const state = useStore.getState();
    useStore.setState({ margins: 10 });

    state.redo();

    // Should not change state
    expect(useStore.getState().margins).toBe(10);
    expect(useStore.getState().canRedo).toBe(false);
  });

  it('should deep clone tokens to prevent mutation', () => {
    const state = useStore.getState();

    const token: Token = {
      id: 'token1',
      originalSrc: 'test.jpg',
      processedSrc: 'test.jpg',
      fileName: 'test.jpg',
      sizeMm: 25,
      sizePreset: 'medium',
      position: { x: 0, y: 0 },
      rotation: 0,
      scale: { x: 1, y: 1 },
      shape: 'circle',
      frame: {
        enabled: false,
        thicknessMm: 2,
        color: '#000000',
        style: 'solid',
        libraryAssetId: null,
      },
      crop: {
        enabled: false,
        cutFrameMm: 0,
      },
      overlayId: null,
      overlayOpacity: 1,
      imageCrop: {
        offsetX: 0,
        offsetY: 0,
        scale: 1,
        rotation: 0,
      },
      filters: {
        brightness: 1,
        contrast: 1,
        saturation: 1,
        hue: 0,
        blur: 0,
        grayscale: false,
        sepia: false,
      },
      count: 1,
      locked: false,
      visible: true,
      zIndex: 0,
    };

    useStore.setState({ tokens: [token] });
    state.pushHistory();

    // Mutate current token
    useStore.setState({
      tokens: [{
        ...token,
        sizeMm: 50,
      }],
    });

    // Undo should restore original
    state.undo();

    const restoredToken = useStore.getState().tokens[0];
    expect(restoredToken.sizeMm).toBe(25);
  });
});
