import type { DnDSizePreset, PaperSize, TokenShape } from '../types/index.ts';

// DnD size presets in mm (based on standard miniature base sizes)
export const DND_SIZE_PRESETS: Record<DnDSizePreset, number> = {
  tiny: 12,
  small: 20,
  medium: 25,
  large: 50,
  huge: 75,
  gargantuan: 100,
};

export const DND_SIZE_LABELS: Record<DnDSizePreset, string> = {
  tiny: 'Tiny (12mm)',
  small: 'Small (20mm)',
  medium: 'Medium (25mm)',
  large: 'Large (50mm)',
  huge: 'Huge (75mm)',
  gargantuan: 'Gargantuan (100mm)',
};

// Paper sizes in mm (width x height in portrait)
export const PAPER_SIZES: Record<Exclude<PaperSize, 'custom'>, { width: number; height: number; label: string }> = {
  a5: { width: 148, height: 210, label: 'A5' },
  a4: { width: 210, height: 297, label: 'A4' },
  a3: { width: 297, height: 420, label: 'A3' },
  letter: { width: 216, height: 279, label: 'US Letter' },
  legal: { width: 216, height: 356, label: 'US Legal' },
  tabloid: { width: 279, height: 432, label: 'Tabloid' },
};

export const TOKEN_SHAPES: { value: TokenShape; label: string }[] = [
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
  { value: 'hexagon', label: 'Hexagon' },
];

// Default values
export const DEFAULT_TOKEN_SIZE_MM = 25;
export const DEFAULT_FRAME_THICKNESS_MM = 1;
export const DEFAULT_FRAME_COLOR = '#c0a060';
export const DEFAULT_PAPER_MARGINS_MM = 5;
export const DEFAULT_TOKEN_SPACING_MM = 2;
export const DEFAULT_GRID_SIZE_MM = 5;

// Canvas rendering
export const CANVAS_DPI = 96;
export const PRINT_DPI = 300;
export const MAX_IMAGE_DIMENSION = 2048;
