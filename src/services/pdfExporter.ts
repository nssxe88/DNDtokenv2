/**
 * PDF Exporter — generates a print-ready PDF with tokens.
 *
 * Uses jsPDF for mm-accurate PDF generation.
 * Token rendering goes through the single renderTokenToCanvas() path.
 */

import { jsPDF } from 'jspdf';
import type { Token, PrintSettings, PaperSize } from '../types/index.ts';
import { computeLayout } from './layoutEngine.ts';
import type { LayoutTokenItem } from './layoutEngine.ts';
import { renderTokenToCanvas } from './tokenRenderer.ts';
import { getPaperDimensions } from '../utils/paper.ts';
import { mmToPrintPx } from '../utils/units.ts';

export interface PDFExportOptions {
  tokens: Token[];
  printSettings: PrintSettings;
  onProgress?: (current: number, total: number) => void;
}

/**
 * Get jsPDF-compatible format string.
 * jsPDF expects specific format names.
 */
function getJsPDFFormat(paperSize: PaperSize): string | [number, number] {
  switch (paperSize) {
    case 'a3': return 'a3';
    case 'a4': return 'a4';
    case 'a5': return 'a5';
    case 'letter': return 'letter';
    case 'legal': return 'legal';
    case 'tabloid': return 'tabloid';
    case 'custom': return 'a4'; // fallback — overridden by format dimensions
  }
}

/**
 * Draw cut marks around a token position on the PDF.
 */
function drawCutMarks(
  pdf: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  shape: Token['shape']
): void {
  const markLength = 3; // mm
  const markOffset = 1; // mm offset from token edge

  pdf.setDrawColor(128, 128, 128);
  pdf.setLineWidth(0.1);

  if (shape === 'circle') {
    // For circles: marks at N, S, E, W
    const cx = x + w / 2;
    const cy = y + h / 2;

    // Top
    pdf.line(cx, y - markOffset - markLength, cx, y - markOffset);
    // Bottom
    pdf.line(cx, y + h + markOffset, cx, y + h + markOffset + markLength);
    // Left
    pdf.line(x - markOffset - markLength, cy, x - markOffset, cy);
    // Right
    pdf.line(x + w + markOffset, cy, x + w + markOffset + markLength, cy);
  } else {
    // For square/hexagon: corner marks
    // Top-left
    pdf.line(x - markOffset - markLength, y, x - markOffset, y);
    pdf.line(x, y - markOffset - markLength, x, y - markOffset);
    // Top-right
    pdf.line(x + w + markOffset, y, x + w + markOffset + markLength, y);
    pdf.line(x + w, y - markOffset - markLength, x + w, y - markOffset);
    // Bottom-left
    pdf.line(x - markOffset - markLength, y + h, x - markOffset, y + h);
    pdf.line(x, y + h + markOffset, x, y + h + markOffset + markLength);
    // Bottom-right
    pdf.line(x + w + markOffset, y + h, x + w + markOffset + markLength, y + h);
    pdf.line(x + w, y + h + markOffset, x + w, y + h + markOffset + markLength);
  }
}

/**
 * Generate a PDF with all tokens arranged using bin-packing.
 */
export async function generatePDF({
  tokens,
  printSettings,
  onProgress,
}: PDFExportOptions): Promise<void> {
  if (tokens.length === 0) {
    throw new Error('No tokens to export');
  }

  const paper = getPaperDimensions(
    printSettings.paperSize,
    printSettings.orientation,
    printSettings.customPaperSize
  );

  const margins = printSettings.margins;
  const spacing = printSettings.spacing;
  const workW = paper.width - 2 * margins;
  const workH = paper.height - 2 * margins;

  // Expand tokens by count (each copy is a separate layout item)
  const layoutItems: LayoutTokenItem[] = [];
  const tokenMap: Token[] = []; // maps itemIdx → Token

  tokens.forEach((token, idx) => {
    if (!token.visible) return;
    const totalSize = token.sizeMm + (token.frame.enabled ? token.frame.thicknessMm * 2 : 0);
    for (let n = 0; n < token.count; n++) {
      layoutItems.push({
        itemIdx: idx,
        w: totalSize,
        h: totalSize,
      });
    }
    tokenMap[idx] = token;
  });

  if (layoutItems.length === 0) {
    throw new Error('No visible tokens to export');
  }

  const layout = computeLayout(layoutItems, workW, workH, spacing);

  // Create PDF
  const format = getJsPDFFormat(printSettings.paperSize);
  const pdf = new jsPDF({
    unit: 'mm',
    format: printSettings.paperSize === 'custom'
      ? [paper.width, paper.height]
      : format,
    orientation: printSettings.orientation === 'landscape' ? 'landscape' : 'portrait',
  });

  // Ensure we have enough pages
  for (let p = 1; p < layout.pageCount; p++) {
    pdf.addPage();
  }

  // Render and place each token
  const total = layout.positions.length;

  for (let i = 0; i < total; i++) {
    const pos = layout.positions[i];
    const token = tokenMap[pos.itemIndex];
    if (!token) continue;

    onProgress?.(i + 1, total);

    // Render token at print DPI
    const tokenInnerSizePx = mmToPrintPx(token.sizeMm);
    const canvas = await renderTokenToCanvas(token, tokenInnerSizePx);

    // Position on page (margins + layout position)
    const drawX = margins + pos.x;
    const drawY = margins + pos.y;

    // Set the correct page
    pdf.setPage(pos.page + 1);

    // Add rendered token image to PDF
    const dataUrl = canvas.toDataURL('image/png');
    pdf.addImage(dataUrl, 'PNG', drawX, drawY, pos.w, pos.h);

    // Draw cut marks if enabled
    if (printSettings.cutMarks) {
      drawCutMarks(pdf, drawX, drawY, pos.w, pos.h, token.shape);
    }
  }

  pdf.save('tokens.pdf');
}
