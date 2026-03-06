export interface OverlayAsset {
  id: string;
  src: string;
  processedSrc: string;
  name: string;
  category: 'frame' | 'border' | 'texture' | 'icon' | 'ring';
  source: 'library' | 'user-upload';

  hue: number;
  saturation: number;
  opacity: number;
}
