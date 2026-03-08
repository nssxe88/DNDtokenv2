import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';

const imageCache = new Map<string, HTMLImageElement>();
const loadingSet = new Set<string>();
const subscribers = new Set<() => void>();

let cacheVersion = 0;

function notifySubscribers(): void {
  cacheVersion++;
  for (const cb of subscribers) cb();
}

/**
 * Hook to load an image by URL.
 * Uses useSyncExternalStore to avoid setState-in-effect lint warnings.
 */
export function useImageLoader(src: string | null): HTMLImageElement | null {
  const subscribe = useCallback((callback: () => void): (() => void) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  }, []);

  const version = useSyncExternalStore(subscribe, () => cacheVersion);

  useEffect(() => {
    if (!src) return;
    if (imageCache.has(src)) return;
    if (loadingSet.has(src)) return;

    loadingSet.add(src);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      loadingSet.delete(src);
      imageCache.set(src, img);
      notifySubscribers();
    };
    img.onerror = () => {
      loadingSet.delete(src);
      notifySubscribers();
    };
    img.src = src;
  }, [src]);

  return useMemo(() => {
    if (!src) return null;
    // version triggers re-computation when cache updates
    void version;
    return imageCache.get(src) ?? null;
  }, [src, version]);
}
