import { CANVAS_DPI, PRINT_DPI } from './constants.ts';

// 1 inch = 25.4 mm
const MM_PER_INCH = 25.4;

/** Convert mm to canvas pixels at screen DPI */
export function mmToPx(mm: number, dpi: number = CANVAS_DPI): number {
  return (mm / MM_PER_INCH) * dpi;
}

/** Convert canvas pixels to mm at screen DPI */
export function pxToMm(px: number, dpi: number = CANVAS_DPI): number {
  return (px / dpi) * MM_PER_INCH;
}

/** Convert mm to print pixels at print DPI */
export function mmToPrintPx(mm: number): number {
  return mmToPx(mm, PRINT_DPI);
}

/** Convert mm to inches */
export function mmToInch(mm: number): number {
  return mm / MM_PER_INCH;
}

/** Convert inches to mm */
export function inchToMm(inch: number): number {
  return inch * MM_PER_INCH;
}

/** Snap a value to the nearest grid increment */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}
