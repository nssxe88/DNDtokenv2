export type TokenShape = 'circle' | 'square' | 'hexagon';

export type DnDSizePreset = 'tiny' | 'small' | 'medium' | 'large' | 'huge' | 'gargantuan';

export interface ImageCropTransform {
  offsetX: number;
  offsetY: number;
  scale: number;
  rotation: number;
}

export interface TokenFrameConfig {
  enabled: boolean;
  thicknessMm: number;
  color: string;
  style: 'solid' | 'dashed' | 'double' | 'ornate';
  libraryAssetId: string | null;
}

export interface TokenCropConfig {
  enabled: boolean;
  cutFrameMm: number;
}

export interface TokenFilterConfig {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  grayscale: boolean;
  sepia: boolean;
}

export interface Token {
  id: string;

  // Image data
  originalSrc: string;
  processedSrc: string;
  fileName: string;

  // Dimensions & positioning
  sizeMm: number;
  sizePreset: DnDSizePreset | null;
  position: { x: number; y: number };
  rotation: number;
  scale: { x: number; y: number };

  // Shape & frame
  shape: TokenShape;
  frame: TokenFrameConfig;
  crop: TokenCropConfig;

  // Overlays
  overlayId: string | null;
  overlayOpacity: number;

  // Image positioning (from cropping popup)
  imageCrop: ImageCropTransform;

  // Filters
  filters: TokenFilterConfig;

  // Metadata
  count: number;
  locked: boolean;
  visible: boolean;
  zIndex: number;
}
