/**
 * Asset Loader — Handles loading and caching of library assets.
 *
 * Strategy:
 * 1. Manifest loaded at startup (small JSON)
 * 2. Thumbnails loaded lazily as user scrolls
 * 3. Full-resolution assets loaded on-demand when applied
 * 4. In-memory cache (Map<string, HTMLImageElement>)
 */

import type { LibraryManifest } from '../types/index.ts';

const ASSETS_BASE_URL = '/assets/';
const SUPPORTED_MANIFEST_VERSIONS = ['1.0'];
const MAX_CACHE_SIZE = 200;

const imageCache = new Map<string, HTMLImageElement>();
const pendingLoads = new Map<string, Promise<HTMLImageElement>>();

/** Sanitize asset path to prevent directory traversal and injection. */
export function sanitizeAssetPath(path: string): string {
  const clean = path.replace(/[^a-zA-Z0-9._/-]/g, '');
  if (clean.includes('..')) {
    throw new Error(`Invalid asset path: ${path}`);
  }
  return clean;
}

/** Load the library manifest from the public assets folder. */
export async function loadManifest(): Promise<LibraryManifest> {
  const response = await fetch(`${ASSETS_BASE_URL}library-manifest.json`);
  if (!response.ok) {
    throw new Error(`Failed to load library manifest: ${response.statusText}`);
  }
  const data: unknown = await response.json();

  if (
    typeof data !== 'object' || data === null ||
    !('version' in data) || !('assets' in data) ||
    !Array.isArray((data as LibraryManifest).assets)
  ) {
    throw new Error('Invalid manifest format');
  }

  const manifest = data as LibraryManifest;
  if (!SUPPORTED_MANIFEST_VERSIONS.includes(manifest.version)) {
    throw new Error(
      `Unsupported manifest version: ${manifest.version}. Supported: ${SUPPORTED_MANIFEST_VERSIONS.join(', ')}`
    );
  }

  return manifest;
}

/** Load a single image and cache it. Returns immediately if cached. */
export function loadAssetImage(relativePath: string): Promise<HTMLImageElement> {
  const safePath = sanitizeAssetPath(relativePath);
  const url = `${ASSETS_BASE_URL}${safePath}`;

  const cached = imageCache.get(url);
  if (cached) return Promise.resolve(cached);

  const pending = pendingLoads.get(url);
  if (pending) return pending;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (imageCache.size >= MAX_CACHE_SIZE) {
        const firstKey = imageCache.keys().next().value;
        if (firstKey) imageCache.delete(firstKey);
      }
      imageCache.set(url, img);
      pendingLoads.delete(url);
      resolve(img);
    };
    img.onerror = () => {
      pendingLoads.delete(url);
      reject(new Error(`Failed to load asset: ${relativePath}`));
    };
    img.src = url;
  });

  pendingLoads.set(url, promise);
  return promise;
}

/** Get a cached image synchronously (returns null if not yet loaded). */
export function getCachedAssetImage(relativePath: string): HTMLImageElement | null {
  return imageCache.get(`${ASSETS_BASE_URL}${relativePath}`) ?? null;
}

/** Preload an array of asset file paths. */
export async function preloadAssets(paths: string[]): Promise<void> {
  await Promise.allSettled(paths.map(loadAssetImage));
}

/** Clear the entire image cache. */
export function clearAssetCache(): void {
  imageCache.clear();
  pendingLoads.clear();
}
