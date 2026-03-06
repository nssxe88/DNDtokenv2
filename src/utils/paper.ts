import type { PaperSize } from '../types/index.ts';
import { PAPER_SIZES } from './constants.ts';

export function getPaperDimensions(
  paperSize: PaperSize,
  orientation: 'portrait' | 'landscape',
  customSize?: { width: number; height: number } | null
): { width: number; height: number } {
  let w: number;
  let h: number;

  if (paperSize === 'custom' && customSize) {
    w = customSize.width;
    h = customSize.height;
  } else if (paperSize !== 'custom') {
    const size = PAPER_SIZES[paperSize];
    w = size.width;
    h = size.height;
  } else {
    w = 210;
    h = 297;
  }

  if (orientation === 'landscape') {
    return { width: Math.max(w, h), height: Math.min(w, h) };
  }
  return { width: Math.min(w, h), height: Math.max(w, h) };
}
