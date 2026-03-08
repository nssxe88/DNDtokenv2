import { useEffect } from 'react';
import { useStore } from '../store/index.ts';
import { clamp } from '../utils/math.ts';

/**
 * Global keyboard shortcuts for the editor.
 * Attaches a single keydown listener to `window`.
 *
 * NOTE: The existing Delete/Backspace/Escape/Ctrl+A handlers in KonvaCanvas
 * are superseded by this hook — they should be removed from KonvaCanvas
 * once this hook is wired into App.tsx.
 */
export function useKeyboardShortcuts() {
  useEffect(() => {
    function isInputFocused(): boolean {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName;
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        (el as HTMLElement).isContentEditable
      );
    }

    function handleKeyDown(e: KeyboardEvent) {
      // Never intercept keyboard events in form fields
      if (isInputFocused()) return;

      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const key = e.key;
      const state = useStore.getState();

      // ===== Undo / Redo =====
      if (ctrl && !shift && key === 'z') {
        e.preventDefault();
        state.undo();
        return;
      }
      if (ctrl && shift && key === 'z') {
        e.preventDefault();
        state.redo();
        return;
      }
      if (ctrl && key === 'y') {
        e.preventDefault();
        state.redo();
        return;
      }

      // ===== Save project =====
      if (ctrl && key === 's') {
        e.preventDefault();
        state.saveCurrentProject();
        return;
      }

      // ===== Select all =====
      if (ctrl && key === 'a') {
        e.preventDefault();
        state.selectTokens(state.tokens.map((t) => t.id));
        return;
      }

      // ===== Duplicate selected =====
      if (ctrl && key === 'd') {
        e.preventDefault();
        state.selectedTokenIds.forEach((id) => {
          state.pushHistory();
          state.duplicateToken(id);
        });
        return;
      }

      // ===== Delete selected =====
      if (key === 'Delete' || key === 'Backspace') {
        if (state.selectedTokenIds.length > 0) {
          state.pushHistory();
          state.removeTokens(state.selectedTokenIds);
        }
        return;
      }

      // ===== Toggle grid =====
      if (ctrl && key === 'g') {
        e.preventDefault();
        state.toggleGrid();
        return;
      }

      // ===== Export PDF =====
      if (ctrl && key === 'p') {
        e.preventDefault();
        state.openExportModal();
        return;
      }

      // ===== Escape =====
      if (key === 'Escape') {
        // Close modals first, then deselect
        if (state.exportModalOpen) {
          state.closeExportModal();
        } else if (state.cropModalTokenId) {
          state.closeCropModal();
        } else if (state.projectManagerOpen) {
          state.closeProjectManager();
        } else {
          state.clearSelection();
        }
        return;
      }

      // ===== Zoom in/out =====
      if (key === '+' || key === '=') {
        state.setZoom(clamp(state.zoom + 0.1, 0.2, 5));
        return;
      }
      if (key === '-') {
        state.setZoom(clamp(state.zoom - 0.1, 0.2, 5));
        return;
      }
      if (key === '0') {
        state.setZoom(1);
        state.setPanOffset(0, 0);
        return;
      }

      // ===== Arrow key nudge =====
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        if (state.selectedTokenIds.length === 0) return;
        e.preventDefault();

        const nudgeMm = shift ? 5 : 1;
        const dx = key === 'ArrowLeft' ? -nudgeMm : key === 'ArrowRight' ? nudgeMm : 0;
        const dy = key === 'ArrowUp' ? -nudgeMm : key === 'ArrowDown' ? nudgeMm : 0;

        state.pushHistory();
        state.selectedTokenIds.forEach((id) => {
          const token = state.tokens.find((t) => t.id === id);
          if (token) {
            state.updateTokenPosition(id, token.position.x + dx, token.position.y + dy);
          }
        });
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
