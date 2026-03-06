/**
 * Hook that computes the print layout for all tokens.
 * Uses the MaxRects bin-packing layout engine.
 */

import { useMemo } from 'react';
import type { Token } from '../types/index.ts';
import { computeLayout, type LayoutPosition } from '../services/layoutEngine.ts';
import { getPaperDimensions } from '../utils/paper.ts';
import { useStore } from '../store/index.ts';

export interface PrintLayoutToken {
  token: Token;
  x: number; // mm from paper left (including margin)
  y: number; // mm from paper top (including margin)
  w: number; // mm total size including frame
  h: number; // mm total size including frame
  page: number;
  copyIndex: number;
}

export interface PrintLayoutResult {
  items: PrintLayoutToken[];
  pageCount: number;
  paperWidth: number;  // mm
  paperHeight: number; // mm
}

export function usePrintLayout(): PrintLayoutResult {
  const tokens = useStore((s) => s.tokens);
  const paperSize = useStore((s) => s.paperSize);
  const orientation = useStore((s) => s.orientation);
  const customPaperSize = useStore((s) => s.customPaperSize);
  const margins = useStore((s) => s.margins);
  const spacing = useStore((s) => s.spacing);

  return useMemo(() => {
    const paper = getPaperDimensions(paperSize, orientation, customPaperSize);
    const workW = paper.width - 2 * margins;
    const workH = paper.height - 2 * margins;

    // Expand tokens by count, tracking which token each copy belongs to
    const visibleTokens = tokens.filter((t) => t.visible);
    const expandedItems: { token: Token; copyIndex: number }[] = [];
    const layoutTokens: { itemIdx: number; w: number; h: number }[] = [];

    visibleTokens.forEach((token) => {
      const totalSize = token.sizeMm + (token.frame.enabled ? token.frame.thicknessMm * 2 : 0);
      for (let c = 0; c < token.count; c++) {
        const idx = expandedItems.length;
        expandedItems.push({ token, copyIndex: c });
        layoutTokens.push({ itemIdx: idx, w: totalSize, h: totalSize });
      }
    });

    if (layoutTokens.length === 0) {
      return {
        items: [],
        pageCount: 0,
        paperWidth: paper.width,
        paperHeight: paper.height,
      };
    }

    const layout = computeLayout(layoutTokens, workW, workH, spacing);

    const items: PrintLayoutToken[] = layout.positions.map((pos: LayoutPosition) => {
      const { token, copyIndex } = expandedItems[pos.itemIndex];
      return {
        token,
        x: margins + pos.x,
        y: margins + pos.y,
        w: pos.w,
        h: pos.h,
        page: pos.page,
        copyIndex,
      };
    });

    return {
      items,
      pageCount: layout.pageCount,
      paperWidth: paper.width,
      paperHeight: paper.height,
    };
  }, [tokens, paperSize, orientation, customPaperSize, margins, spacing]);
}
