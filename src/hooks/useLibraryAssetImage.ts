import { useEffect, useState } from 'react';
import { loadAssetImage, getCachedAssetImage } from '../services/assetLoader.ts';

/**
 * Hook to load a library asset image by its relative file path.
 * Returns the HTMLImageElement when loaded, null while loading.
 */
export function useLibraryAssetImage(filePath: string | null): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(() => {
    if (!filePath) return null;
    return getCachedAssetImage(filePath);
  });

  useEffect(() => {
    if (!filePath) return;

    const cached = getCachedAssetImage(filePath);
    if (cached) {
      setImage(cached);
      return;
    }

    let cancelled = false;
    loadAssetImage(filePath).then(
      (img) => { if (!cancelled) setImage(img); },
      () => { if (!cancelled) setImage(null); }
    );
    return () => { cancelled = true; };
  }, [filePath]);

  // Return null when no filePath, otherwise return current cached/loaded image
  return filePath ? image : null;
}
