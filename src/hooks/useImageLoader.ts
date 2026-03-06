import { useEffect, useState } from 'react';

const imageCache = new Map<string, HTMLImageElement>();

export function useImageLoader(src: string | null): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(() => {
    if (!src) return null;
    return imageCache.get(src) ?? null;
  });

  useEffect(() => {
    if (!src) {
      setImage(null);
      return;
    }

    const cached = imageCache.get(src);
    if (cached) {
      setImage(cached);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      setImage(img);
    };
    img.onerror = () => {
      setImage(null);
    };
    img.src = src;
  }, [src]);

  return image;
}
