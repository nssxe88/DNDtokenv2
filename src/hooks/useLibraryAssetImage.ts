import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import { loadAssetImage, getCachedAssetImage } from '../services/assetLoader.ts';

const subscribers = new Set<() => void>();
let assetCacheVersion = 0;

function notifyAssetSubscribers(): void {
  assetCacheVersion++;
  for (const cb of subscribers) cb();
}

/**
 * Hook to load a library asset image by its relative file path.
 * Returns the HTMLImageElement when loaded, null while loading.
 * Uses useSyncExternalStore to avoid setState-in-effect lint warnings.
 */
export function useLibraryAssetImage(filePath: string | null): HTMLImageElement | null {
  const subscribe = useCallback((callback: () => void): (() => void) => {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
  }, []);

  const version = useSyncExternalStore(subscribe, () => assetCacheVersion);

  useEffect(() => {
    if (!filePath) return;
    if (getCachedAssetImage(filePath)) return;

    let cancelled = false;
    loadAssetImage(filePath).then(
      () => { if (!cancelled) notifyAssetSubscribers(); },
      () => { if (!cancelled) notifyAssetSubscribers(); }
    );
    return () => { cancelled = true; };
  }, [filePath]);

  return useMemo(() => {
    if (!filePath) return null;
    // version triggers re-computation when asset cache updates
    void version;
    return getCachedAssetImage(filePath);
  }, [filePath, version]);
}
