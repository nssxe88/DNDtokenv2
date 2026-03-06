/**
 * PNG Exporter — exports tokens as PNG images, individually or as ZIP.
 *
 * Uses JSZip + file-saver for batch export.
 * Token rendering goes through the single renderTokenToCanvas() path.
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { Token, LibraryAsset } from '../types/index.ts';
import { renderTokenToCanvas } from './tokenRenderer.ts';

export type PNGResolution = 256 | 512 | 1024 | 2048;

export interface PNGExportOptions {
  tokens: Token[];
  resolution: PNGResolution;
  transparent: boolean;
  libraryAssets?: LibraryAsset[];
  onProgress?: (current: number, total: number) => void;
}

/**
 * Convert a canvas to a Blob (PNG format).
 */
function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to convert canvas to blob'));
      },
      'image/png'
    );
  });
}

/**
 * Generate a unique filename from token data.
 * Uses a global file index to prevent collisions in the ZIP.
 */
function getTokenFileName(token: Token, index: number, copyIndex?: number): string {
  const baseName = token.fileName
    .replace(/\.[^.]+$/, '') // remove extension
    .replace(/[^a-zA-Z0-9_-]/g, '_'); // sanitize
  const copyPart = copyIndex !== undefined ? `_${copyIndex + 1}` : '';
  return `token_${String(index + 1).padStart(3, '0')}_${baseName}${copyPart}.png`;
}

/**
 * Fill a canvas with a white background (for non-transparent export).
 */
function addWhiteBackground(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const bgCanvas = document.createElement('canvas');
  bgCanvas.width = canvas.width;
  bgCanvas.height = canvas.height;
  const ctx = bgCanvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
  ctx.drawImage(canvas, 0, 0);
  return bgCanvas;
}

/**
 * Export all visible tokens as a ZIP archive of PNG files.
 */
export async function exportTokensAsZip({
  tokens,
  resolution,
  transparent,
  libraryAssets = [],
  onProgress,
}: PNGExportOptions): Promise<void> {
  const visibleTokens = tokens.filter((t) => t.visible);

  if (visibleTokens.length === 0) {
    throw new Error('No visible tokens to export');
  }

  const zip = new JSZip();
  let fileIndex = 0;

  for (let i = 0; i < visibleTokens.length; i++) {
    const token = visibleTokens[i];

    for (let copy = 0; copy < token.count; copy++) {
      onProgress?.(fileIndex + 1, getTotalCount(visibleTokens));

      let canvas = await renderTokenToCanvas(token, resolution, libraryAssets);

      if (!transparent) {
        canvas = addWhiteBackground(canvas);
      }

      const blob = await canvasToBlob(canvas);
      const fileName = token.count > 1
        ? getTokenFileName(token, fileIndex, copy)
        : getTokenFileName(token, fileIndex);

      zip.file(fileName, blob);
      fileIndex++;
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, 'tokens.zip');
}

/**
 * Export a single token as a PNG download.
 */
export async function exportSingleTokenPNG(
  token: Token,
  resolution: PNGResolution,
  transparent: boolean,
  libraryAssets: LibraryAsset[] = []
): Promise<void> {
  let canvas = await renderTokenToCanvas(token, resolution, libraryAssets);

  if (!transparent) {
    canvas = addWhiteBackground(canvas);
  }

  const blob = await canvasToBlob(canvas);
  const fileName = getTokenFileName(token, 0);
  saveAs(blob, fileName);
}

/** Total number of PNG files that will be exported */
function getTotalCount(tokens: Token[]): number {
  return tokens.reduce((sum, t) => sum + t.count, 0);
}
