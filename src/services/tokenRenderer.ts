/**
 * Token Renderer — Single rendering path for all exports.
 *
 * Renders a token to an offscreen HTML Canvas at any resolution.
 * Used by both PDF and PNG exporters. This is the ONLY place
 * where token visual rendering happens outside of the Konva canvas.
 * It mirrors the TokenGroup component logic exactly.
 */

import type { Token } from '../types/index.ts';
import type { LibraryAsset } from '../types/index.ts';
import { loadAssetImage } from './assetLoader.ts';
import { getOverlayById } from './overlayStore.ts';

/** Load an image from a src URL, returning an HTMLImageElement */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src.slice(0, 100)}`));
    img.src = src;
  });
}

/** Try to load the library asset overlay image for a token. */
async function loadLibraryOverlay(
  token: Token,
  libraryAssets: LibraryAsset[]
): Promise<HTMLImageElement | null> {
  if (!token.frame.libraryAssetId) return null;
  const asset = libraryAssets.find((a) => a.id === token.frame.libraryAssetId);
  if (!asset) return null;
  try {
    return await loadAssetImage(asset.file);
  } catch {
    return null;
  }
}

/** Try to load the user-uploaded overlay image for a token. */
async function loadUserOverlay(token: Token): Promise<HTMLImageElement | null> {
  if (!token.overlayId) return null;
  const overlay = getOverlayById(token.overlayId);
  if (!overlay) return null;
  try {
    return await loadImage(overlay.src);
  } catch {
    return null;
  }
}

/**
 * Render a single token to an offscreen canvas.
 *
 * @param token          The token data to render
 * @param sizePx         Output size in pixels (width = height, image area only, without frame)
 * @param libraryAssets  Optional library assets array for resolving library frame overlays
 * @returns              HTMLCanvasElement with the rendered token
 */
export async function renderTokenToCanvas(
  token: Token,
  sizePx: number,
  libraryAssets: LibraryAsset[] = []
): Promise<HTMLCanvasElement> {
  const image = await loadImage(token.processedSrc);

  if (image.width === 0 || image.height === 0) {
    throw new Error(`Invalid image dimensions: ${image.width}x${image.height}`);
  }

  const frameThicknessPx = token.frame.enabled
    ? (token.frame.thicknessMm / token.sizeMm) * sizePx
    : 0;
  const totalSizePx = sizePx + frameThicknessPx * 2;

  const canvas = document.createElement('canvas');
  canvas.width = totalSizePx;
  canvas.height = totalSizePx;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot create 2d context');

  // 1. Draw frame background (behind the image)
  if (token.frame.enabled) {
    ctx.fillStyle = token.frame.color;
    drawShape(ctx, token.shape, totalSizePx);
    ctx.fill();
  }

  // 2. Draw clipped image
  ctx.save();

  // Translate to center the image area within the frame
  ctx.translate(frameThicknessPx, frameThicknessPx);

  // Apply shape clip mask
  drawShape(ctx, token.shape, sizePx);
  ctx.clip();

  // Calculate image position (matching TokenGroup logic exactly)
  // Offsets are stored as normalized fractions of token size.
  const imgScale =
    Math.max(sizePx / image.width, sizePx / image.height) * token.imageCrop.scale;
  const imgWidth = image.width * imgScale;
  const imgHeight = image.height * imgScale;
  const imgX = (sizePx - imgWidth) / 2 + token.imageCrop.offsetX * sizePx;
  const imgY = (sizePx - imgHeight) / 2 + token.imageCrop.offsetY * sizePx;

  ctx.drawImage(image, imgX, imgY, imgWidth, imgHeight);

  ctx.restore();

  // 3. Draw library asset overlay (on top of everything)
  const overlayImage = await loadLibraryOverlay(token, libraryAssets);
  if (overlayImage) {
    ctx.drawImage(overlayImage, 0, 0, totalSizePx, totalSizePx);
  }

  // 4. Draw user-uploaded overlay (on top, with opacity)
  const userOverlayImage = await loadUserOverlay(token);
  if (userOverlayImage) {
    ctx.save();
    ctx.globalAlpha = token.overlayOpacity;
    ctx.drawImage(userOverlayImage, 0, 0, totalSizePx, totalSizePx);
    ctx.restore();
  }

  return canvas;
}

/** Draw a shape path at position (0,0) on a 2D context */
function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: Token['shape'],
  size: number
): void {
  const half = size / 2;
  ctx.beginPath();
  switch (shape) {
    case 'circle':
      ctx.arc(half, half, half, 0, Math.PI * 2);
      break;
    case 'square':
      ctx.rect(0, 0, size, size);
      break;
    case 'hexagon': {
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const hx = half + half * Math.cos(angle);
        const hy = half + half * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      break;
    }
  }
}

/**
 * Render a token to a data URL (PNG).
 */
export async function renderTokenToDataURL(
  token: Token,
  sizePx: number,
  libraryAssets: LibraryAsset[] = []
): Promise<string> {
  const canvas = await renderTokenToCanvas(token, sizePx, libraryAssets);
  return canvas.toDataURL('image/png');
}
