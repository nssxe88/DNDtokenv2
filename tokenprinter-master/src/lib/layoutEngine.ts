
export interface TokenItem {
    itemIdx: number;
    w: number;
    h: number;
}

export interface Position {
    x: number;
    y: number;
    w: number;
    h: number;
    itemIndex: number;
    page: number;
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
        this.freeRects = [{ x: 0, y: 0, w: w, h: h }];
    }

    public insert(w: number, h: number): Rect | undefined {
        let bestNode: Rect | undefined;
        let bestScore1 = Number.MAX_VALUE;
        let bestScore2 = Number.MAX_VALUE;

        // Best Area Fit
        for (let i = 0; i < this.freeRects.length; i++) {
            const freeRect = this.freeRects[i];
            if (freeRect.w >= w && freeRect.h >= h) {
                const areaFit = freeRect.w * freeRect.h - w * h;
                const shortSideFit = Math.min(freeRect.w - w, freeRect.h - h);
                if (areaFit < bestScore1 || (areaFit === bestScore1 && shortSideFit < bestScore2)) {
                    bestNode = { x: freeRect.x, y: freeRect.y, w: w, h: h };
                    bestScore1 = areaFit;
                    bestScore2 = shortSideFit;
                }
            }
        }

        if (!bestNode) {
            return undefined;
        }

        // Split the free rects based on the newly placed node
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
        if (usedNode.x >= freeNode.x + freeNode.w || usedNode.x + usedNode.w <= freeNode.x ||
            usedNode.y >= freeNode.y + freeNode.h || usedNode.y + usedNode.h <= freeNode.y) {
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

    private pruneFreeList() {
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
        return a.x >= b.x && a.y >= b.y &&
            a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h;
    }
}

export function computeLayout(tokens: TokenItem[], workW: number, workH: number, spacing: number) {
    if (tokens.length === 0) {
        return { positions: [], pageCount: 0 };
    }

    // A felhasználói kritérium: "Nagyságrend szerint csökkenő sorrendbe rendezd."
    tokens.sort((a, b) => (b.w * b.h) - (a.w * a.h));

    const positions: Position[] = [];
    const precision = 1000;

    // Térköz matematikai trükk: A vászont és a keresett tokenméretet is megnagyobbítjuk 
    // a térközzel jobb és alsó irányban, így sosem kerülnek közelebb egymáshoz, mint kellene, 
    // de az első sor tökéletesen rátapad a margóra.
    // Epsilon hibák elkerülésére (infinite loop) felnagyítjuk egész számokra (Integers)
    const binW = Math.round((workW + spacing) * precision);
    const binH = Math.round((workH + spacing) * precision);
    const bins: MaxRectsBin[] = [new MaxRectsBin(binW, binH)];

    for (const token of tokens) {
        let placed = false;
        const requiredW = Math.round((token.w + spacing) * precision);
        const requiredH = Math.round((token.h + spacing) * precision);

        // "Minden új oldalnyitásnál nézd át az össze korábbi oldalt"
        for (let i = 0; i < bins.length; i++) {
            const rect = bins[i].insert(requiredW, requiredH);
            if (rect) {
                positions.push({
                    x: rect.x / precision,
                    y: rect.y / precision,
                    w: token.w,
                    h: token.h,
                    itemIndex: token.itemIdx,
                    page: i
                });
                placed = true;
                break;
            }
        }

        // Ha semegyik létező oldalon sincs hely, nyitunk egy újat
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
                    page: bins.length - 1
                });
            } else {
                // Ha a token eleve nagyobb mint az A4 papír... forszírozzuk rá
                positions.push({
                    x: 0,
                    y: 0,
                    w: token.w,
                    h: token.h,
                    itemIndex: token.itemIdx,
                    page: bins.length - 1
                });
            }
        }
    }

    return { positions, pageCount: bins.length };
}
