/**
 * Module-level overlay asset store.
 * Stores user-uploaded overlay images in memory.
 * Used by OverlayPanel (UI), TokenGroup (canvas rendering),
 * and tokenRenderer (export rendering).
 */

import type { OverlayAsset } from '../types/index.ts';

let overlayAssets: OverlayAsset[] = [];
const listeners = new Set<() => void>();

export function getOverlays(): OverlayAsset[] {
  return overlayAssets;
}

export function getOverlayById(id: string): OverlayAsset | undefined {
  return overlayAssets.find((a) => a.id === id);
}

export function addOverlayAsset(asset: OverlayAsset): void {
  overlayAssets = [...overlayAssets, asset];
  notifyListeners();
}

export function removeOverlayAsset(id: string): void {
  overlayAssets = overlayAssets.filter((a) => a.id !== id);
  notifyListeners();
}

export function subscribeOverlays(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyListeners(): void {
  for (const cb of listeners) cb();
}
