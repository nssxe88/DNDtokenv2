/**
 * MaxRects Bin-Packing Layout Engine
 * Ported from v5.6 with strict TypeScript types.
 *
 * Arranges rectangular token items onto fixed-size pages (paper minus margins)
 * using a Best Area Fit heuristic. Tokens are sorted by area (largest first)
 * for optimal packing.
 */

export interface LayoutTokenItem {
  itemIdx: number;
  w: number; // width in mm
  h: number; // height in mm
}

export interface LayoutPosition {
  x: number; // mm from margin left
  y: number; // mm from margin top
  w: number; // mm
  h: number; // mm
  itemIndex: number;
  page: number;
}

export interface LayoutResult {
  positions: LayoutPosition[];
  pageCount: number;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

class MaxRectsBin {
  public width: number;
  public height: number;
  public freeRects: Rect[];

  constructor(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.freeRects = [{ x: 0, y: 0, w, h }];
  }

  public insert(w: number, h: number): Rect | undefined {
    let bestNode: Rect | undefined;
    let bestScore1 = Number.MAX_VALUE;
    let bestScore2 = Number.MAX_VALUE;

    // Best Area Fit heuristic
    for (let i = 0; i < this.freeRects.length; i++) {
      const freeRect = this.freeRects[i];
      if (freeRect.w >= w && freeRect.h >= h) {
        const areaFit = freeRect.w * freeRect.h - w * h;
        const shortSideFit = Math.min(freeRect.w - w, freeRect.h - h);
        if (
          areaFit < bestScore1 ||
          (areaFit === bestScore1 && shortSideFit < bestScore2)
        ) {
          bestNode = { x: freeRect.x, y: freeRect.y, w, h };
          bestScore1 = areaFit;
          bestScore2 = shortSideFit;
        }
      }
    }

    if (!bestNode) {
      return undefined;
    }

    // Split free rects based on the newly placed node
    let i = 0;
    while (i < this.freeRects.length) {
      if (this.splitFreeNode(this.freeRects[i], bestNode)) {
        this.freeRects.splice(i, 1);
      } else {
        i++;
      }
    }

    this.pruneFreeList();
    return bestNode;
  }

  private splitFreeNode(freeNode: Rect, usedNode: Rect): boolean {
    // Check for intersection
    if (
      usedNode.x >= freeNode.x + freeNode.w ||
      usedNode.x + usedNode.w <= freeNode.x ||
      usedNode.y >= freeNode.y + freeNode.h ||
      usedNode.y + usedNode.h <= freeNode.y
    ) {
      return false;
    }

    // New node at top
    if (usedNode.y > freeNode.y && usedNode.y < freeNode.y + freeNode.h) {
      const newNode = { ...freeNode };
      newNode.h = usedNode.y - newNode.y;
      this.freeRects.push(newNode);
    }

    // New node at bottom
    if (usedNode.y + usedNode.h < freeNode.y + freeNode.h) {
      const newNode = { ...freeNode };
      newNode.y = usedNode.y + usedNode.h;
      newNode.h = freeNode.y + freeNode.h - (usedNode.y + usedNode.h);
      this.freeRects.push(newNode);
    }

    // New node at left
    if (usedNode.x > freeNode.x && usedNode.x < freeNode.x + freeNode.w) {
      const newNode = { ...freeNode };
      newNode.w = usedNode.x - newNode.x;
      this.freeRects.push(newNode);
    }

    // New node at right
    if (usedNode.x + usedNode.w < freeNode.x + freeNode.w) {
      const newNode = { ...freeNode };
      newNode.x = usedNode.x + usedNode.w;
      newNode.w = freeNode.x + freeNode.w - (usedNode.x + usedNode.w);
      this.freeRects.push(newNode);
    }

    return true;
  }

  private pruneFreeList(): void {
    for (let i = 0; i < this.freeRects.length; i++) {
      for (let j = i + 1; j < this.freeRects.length; j++) {
        if (this.isContainedIn(this.freeRects[i], this.freeRects[j])) {
          this.freeRects.splice(i, 1);
          i--;
          break;
        }
        if (this.isContainedIn(this.freeRects[j], this.freeRects[i])) {
          this.freeRects.splice(j, 1);
          j--;
        }
      }
    }
  }

  private isContainedIn(a: Rect, b: Rect): boolean {
    return (
      a.x >= b.x &&
      a.y >= b.y &&
      a.x + a.w <= b.x + b.w &&
      a.y + a.h <= b.y + b.h
    );
  }
}

/**
 * Compute optimal layout for tokens on paper pages.
 *
 * @param tokens   Array of token items with size in mm
 * @param workW    Printable area width (paper width - 2 * margin) in mm
 * @param workH    Printable area height (paper height - 2 * margin) in mm
 * @param spacing  Gap between tokens in mm
 * @returns        Positions for all tokens and total page count
 */
export function computeLayout(
  tokens: LayoutTokenItem[],
  workW: number,
  workH: number,
  spacing: number
): LayoutResult {
  if (tokens.length === 0) {
    return { positions: [], pageCount: 0 };
  }

  // Sort by area descending for better packing
  const sorted = [...tokens].sort((a, b) => b.w * b.h - (a.w * a.h));

  const positions: LayoutPosition[] = [];

  // Use integer precision to avoid floating-point epsilon errors
  const precision = 1000;

  // Spacing trick: expand the bin and item sizes by spacing amount
  // so tokens naturally keep distance without explicit gap tracking.
  // First row/col aligns to margin edge.
  const binW = Math.round((workW + spacing) * precision);
  const binH = Math.round((workH + spacing) * precision);
  const bins: MaxRectsBin[] = [new MaxRectsBin(binW, binH)];

  for (const token of sorted) {
    if (token.w <= 0 || token.h <= 0) continue;

    let placed = false;
    const requiredW = Math.round((token.w + spacing) * precision);
    const requiredH = Math.round((token.h + spacing) * precision);

    // Try to place in existing pages first
    for (let i = 0; i < bins.length; i++) {
      const rect = bins[i].insert(requiredW, requiredH);
      if (rect) {
        positions.push({
          x: rect.x / precision,
          y: rect.y / precision,
          w: token.w,
          h: token.h,
          itemIndex: token.itemIdx,
          page: i,
        });
        placed = true;
        break;
      }
    }

    // No space on existing pages — create a new one
    if (!placed) {
      const newBin = new MaxRectsBin(binW, binH);
      bins.push(newBin);
      const rect = newBin.insert(requiredW, requiredH);
      if (rect) {
        positions.push({
          x: rect.x / precision,
          y: rect.y / precision,
          w: token.w,
          h: token.h,
          itemIndex: token.itemIdx,
          page: bins.length - 1,
        });
      } else {
        // Token is larger than paper — force it on page
        positions.push({
          x: 0,
          y: 0,
          w: token.w,
          h: token.h,
          itemIndex: token.itemIdx,
          page: bins.length - 1,
        });
      }
    }
  }

  return { positions, pageCount: bins.length };
}
