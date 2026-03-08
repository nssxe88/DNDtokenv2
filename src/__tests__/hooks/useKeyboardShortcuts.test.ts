import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts.ts';
import { useStore } from '../../store/index.ts';
import type { Token } from '../../types/index.ts';

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    // Reset store
    useStore.setState({
      tokens: [],
      selectedTokenIds: [],
      zoom: 1,
      panOffset: { x: 0, y: 0 },
      gridVisible: false,
      exportModalOpen: false,
      cropModalTokenId: null,
      projectManagerOpen: false,
      _past: [],
      _future: [],
      canUndo: false,
      canRedo: false,
    });

    // Mock store methods
    vi.spyOn(useStore.getState(), 'undo');
    vi.spyOn(useStore.getState(), 'redo');
    vi.spyOn(useStore.getState(), 'saveCurrentProject');
    vi.spyOn(useStore.getState(), 'selectTokens');
    vi.spyOn(useStore.getState(), 'duplicateToken');
    vi.spyOn(useStore.getState(), 'removeTokens');
    vi.spyOn(useStore.getState(), 'pushHistory');
    vi.spyOn(useStore.getState(), 'toggleGrid');
    vi.spyOn(useStore.getState(), 'openExportModal');
    vi.spyOn(useStore.getState(), 'closeExportModal');
    vi.spyOn(useStore.getState(), 'closeCropModal');
    vi.spyOn(useStore.getState(), 'closeProjectManager');
    vi.spyOn(useStore.getState(), 'clearSelection');
    vi.spyOn(useStore.getState(), 'setZoom');
    vi.spyOn(useStore.getState(), 'setPanOffset');
    vi.spyOn(useStore.getState(), 'updateTokenPosition');
  });

  it('should attach keydown listener on mount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    renderHook(() => useKeyboardShortcuts());

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should remove keydown listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useKeyboardShortcuts());
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  describe('undo/redo shortcuts', () => {
    it('should call undo on Ctrl+Z', () => {
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true });
      window.dispatchEvent(event);

      expect(useStore.getState().undo).toHaveBeenCalled();
    });

    it('should call redo on Ctrl+Shift+Z', () => {
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true });
      window.dispatchEvent(event);

      expect(useStore.getState().redo).toHaveBeenCalled();
    });

    it('should call redo on Ctrl+Y', () => {
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 'y', ctrlKey: true });
      window.dispatchEvent(event);

      expect(useStore.getState().redo).toHaveBeenCalled();
    });

    it('should work with metaKey (Mac Cmd key)', () => {
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 'z', metaKey: true });
      window.dispatchEvent(event);

      expect(useStore.getState().undo).toHaveBeenCalled();
    });
  });

  describe('save shortcut', () => {
    it('should call saveCurrentProject on Ctrl+S', () => {
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
      window.dispatchEvent(event);

      expect(useStore.getState().saveCurrentProject).toHaveBeenCalled();
    });
  });

  describe('select all shortcut', () => {
    it('should select all tokens on Ctrl+A', () => {
      const tokens: Token[] = [
        { id: 't1' } as Token,
        { id: 't2' } as Token,
        { id: 't3' } as Token,
      ];

      useStore.setState({ tokens });
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true });
      window.dispatchEvent(event);

      expect(useStore.getState().selectTokens).toHaveBeenCalledWith(['t1', 't2', 't3']);
    });
  });

  describe('duplicate shortcut', () => {
    it('should duplicate selected tokens on Ctrl+D', () => {
      useStore.setState({ selectedTokenIds: ['t1', 't2'] });
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 'd', ctrlKey: true });
      window.dispatchEvent(event);

      expect(useStore.getState().pushHistory).toHaveBeenCalled();
      expect(useStore.getState().duplicateToken).toHaveBeenCalledWith('t1');
      expect(useStore.getState().duplicateToken).toHaveBeenCalledWith('t2');
    });
  });

  describe('delete shortcuts', () => {
    it('should delete selected tokens on Delete key', () => {
      useStore.setState({ selectedTokenIds: ['t1', 't2'] });
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 'Delete' });
      window.dispatchEvent(event);

      expect(useStore.getState().pushHistory).toHaveBeenCalled();
      expect(useStore.getState().removeTokens).toHaveBeenCalledWith(['t1', 't2']);
    });

    it('should delete selected tokens on Backspace key', () => {
      useStore.setState({ selectedTokenIds: ['t1'] });
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 'Backspace' });
      window.dispatchEvent(event);

      expect(useStore.getState().removeTokens).toHaveBeenCalledWith(['t1']);
    });

    it('should not delete if no tokens selected', () => {
      useStore.setState({ selectedTokenIds: [] });
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 'Delete' });
      window.dispatchEvent(event);

      expect(useStore.getState().removeTokens).not.toHaveBeenCalled();
    });
  });

  describe('toggle grid shortcut', () => {
    it('should toggle grid on Ctrl+G', () => {
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 'g', ctrlKey: true });
      window.dispatchEvent(event);

      expect(useStore.getState().toggleGrid).toHaveBeenCalled();
    });
  });

  describe('export shortcut', () => {
    it('should open export modal on Ctrl+P', () => {
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 'p', ctrlKey: true });
      window.dispatchEvent(event);

      expect(useStore.getState().openExportModal).toHaveBeenCalled();
    });
  });

  describe('escape key', () => {
    it('should close export modal if open', () => {
      useStore.setState({ exportModalOpen: true });
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(event);

      expect(useStore.getState().closeExportModal).toHaveBeenCalled();
    });

    it('should close crop modal if open', () => {
      useStore.setState({ cropModalTokenId: 't1', exportModalOpen: false });
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(event);

      expect(useStore.getState().closeCropModal).toHaveBeenCalled();
    });

    it('should close project manager if open', () => {
      useStore.setState({
        projectManagerOpen: true,
        exportModalOpen: false,
        cropModalTokenId: null
      });
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(event);

      expect(useStore.getState().closeProjectManager).toHaveBeenCalled();
    });

    it('should clear selection if no modals open', () => {
      useStore.setState({
        exportModalOpen: false,
        cropModalTokenId: null,
        projectManagerOpen: false
      });
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(event);

      expect(useStore.getState().clearSelection).toHaveBeenCalled();
    });
  });

  describe('zoom shortcuts', () => {
    it('should zoom in on + key', () => {
      useStore.setState({ zoom: 1 });
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: '+' });
      window.dispatchEvent(event);

      expect(useStore.getState().setZoom).toHaveBeenCalledWith(1.1);
    });

    it('should zoom in on = key', () => {
      useStore.setState({ zoom: 1 });
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: '=' });
      window.dispatchEvent(event);

      expect(useStore.getState().setZoom).toHaveBeenCalledWith(1.1);
    });

    it('should zoom out on - key', () => {
      useStore.setState({ zoom: 1 });
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: '-' });
      window.dispatchEvent(event);

      expect(useStore.getState().setZoom).toHaveBeenCalledWith(0.9);
    });

    it('should reset zoom and pan on 0 key', () => {
      useStore.setState({ zoom: 2, panOffset: { x: 100, y: 100 } });
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: '0' });
      window.dispatchEvent(event);

      expect(useStore.getState().setZoom).toHaveBeenCalledWith(1);
      expect(useStore.getState().setPanOffset).toHaveBeenCalledWith(0, 0);
    });

    it('should clamp zoom to min 0.2', () => {
      useStore.setState({ zoom: 0.2 });
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: '-' });
      window.dispatchEvent(event);

      expect(useStore.getState().setZoom).toHaveBeenCalledWith(0.2);
    });

    it('should clamp zoom to max 5', () => {
      useStore.setState({ zoom: 5 });
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: '+' });
      window.dispatchEvent(event);

      expect(useStore.getState().setZoom).toHaveBeenCalledWith(5);
    });
  });

  describe('arrow key nudge', () => {
    const mockToken: Token = {
      id: 't1',
      position: { x: 100, y: 100 },
    } as Token;

    beforeEach(() => {
      useStore.setState({
        tokens: [mockToken],
        selectedTokenIds: ['t1'],
      });
    });

    it('should nudge left by 1mm on ArrowLeft', () => {
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(event);

      expect(useStore.getState().updateTokenPosition).toHaveBeenCalledWith('t1', 99, 100);
    });

    it('should nudge right by 1mm on ArrowRight', () => {
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      window.dispatchEvent(event);

      expect(useStore.getState().updateTokenPosition).toHaveBeenCalledWith('t1', 101, 100);
    });

    it('should nudge up by 1mm on ArrowUp', () => {
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      window.dispatchEvent(event);

      expect(useStore.getState().updateTokenPosition).toHaveBeenCalledWith('t1', 100, 99);
    });

    it('should nudge down by 1mm on ArrowDown', () => {
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      window.dispatchEvent(event);

      expect(useStore.getState().updateTokenPosition).toHaveBeenCalledWith('t1', 100, 101);
    });

    it('should nudge by 5mm when Shift is held', () => {
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', shiftKey: true });
      window.dispatchEvent(event);

      expect(useStore.getState().updateTokenPosition).toHaveBeenCalledWith('t1', 95, 100);
    });

    it('should not nudge if no tokens selected', () => {
      useStore.setState({ selectedTokenIds: [] });
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(event);

      expect(useStore.getState().updateTokenPosition).not.toHaveBeenCalled();
    });

    it('should push history before nudging', () => {
      renderHook(() => useKeyboardShortcuts());

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
      window.dispatchEvent(event);

      expect(useStore.getState().pushHistory).toHaveBeenCalled();
    });
  });

  describe('input field protection', () => {
    it('should ignore shortcuts when input is focused', () => {
      renderHook(() => useKeyboardShortcuts());

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true });
      input.dispatchEvent(event);

      expect(useStore.getState().undo).not.toHaveBeenCalled();

      document.body.removeChild(input);
    });

    it('should ignore shortcuts when textarea is focused', () => {
      renderHook(() => useKeyboardShortcuts());

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      textarea.focus();

      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true });
      textarea.dispatchEvent(event);

      expect(useStore.getState().saveCurrentProject).not.toHaveBeenCalled();

      document.body.removeChild(textarea);
    });

    it('should ignore shortcuts when select is focused', () => {
      renderHook(() => useKeyboardShortcuts());

      const select = document.createElement('select');
      document.body.appendChild(select);
      select.focus();

      const event = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true, bubbles: true });
      select.dispatchEvent(event);

      expect(useStore.getState().selectTokens).not.toHaveBeenCalled();

      document.body.removeChild(select);
    });

    it('should ignore shortcuts when contentEditable is focused', () => {
      renderHook(() => useKeyboardShortcuts());

      const div = document.createElement('div');
      div.contentEditable = 'true';
      document.body.appendChild(div);
      div.focus();

      const event = new KeyboardEvent('keydown', { key: 'd', ctrlKey: true, bubbles: true });
      div.dispatchEvent(event);

      expect(useStore.getState().duplicateToken).not.toHaveBeenCalled();

      document.body.removeChild(div);
    });
  });
});
