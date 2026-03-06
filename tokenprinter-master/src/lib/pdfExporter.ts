import { jsPDF } from 'jspdf';
import type { PrintSettings, ImageItem, FrameItem } from '../store/tokenStore';
import { PRESETS_BASE } from '../store/tokenStore';
import { computeLayout } from './layoutEngine';
import type { TokenItem } from './layoutEngine';
import { snapTo1mmGrid, roundMm, hexToRgb } from './imageProcessor';

const paperSizes = {
    a4: { width: 210, height: 297 },
    letter: { width: 216, height: 279 },
    a3: { width: 297, height: 420 },
    a5: { width: 148, height: 210 }
};

export async function generatePDF(
    images: ImageItem[],
    frames: FrameItem[],
    settings: PrintSettings,
    presets: Record<string, number>
) {
    if (images.length === 0) {
        throw new Error('Please upload at least one image!');
    }

    const paperSize = paperSizes[settings.paperSize];
    const pdf = new jsPDF({
        unit: 'mm',
        format: settings.paperSize,
    });

    const margins = settings.margins;
    const spacing = settings.spacing;
    const workWidth = paperSize.width - 2 * margins;
    const workHeight = paperSize.height - 2 * margins;

    const tokens: TokenItem[] = [];
    const allFrame = frames.find(f => f.useForAll || f.checked);

    images.forEach((item, itemIdx) => {
        const sizeMm = item.manualSizeMm !== null ? item.manualSizeMm : (presets[item.preset] || PRESETS_BASE.medium);
        for (let n = 0; n < item.count; n++) {
            tokens.push({ itemIdx, w: sizeMm, h: sizeMm });
        }
    });

    tokens.sort((a, b) => b.h - a.h);

    // grid=1 for exact mm calculation
    const layout = computeLayout(tokens, workWidth, workHeight, spacing);

    const promises = layout.positions.map(pos => {
        return new Promise<void>(resolve => {
            const item = images[pos.itemIndex];
            const img = new Image();

            img.onload = function () {
                while (pdf.getNumberOfPages() <= pos.page) {
                    pdf.addPage();
                }
                pdf.setPage(pos.page + 1);

                const itemSizeMm = item.manualSizeMm !== null ? item.manualSizeMm : presets[item.preset];
                const targetSizeMm = roundMm(itemSizeMm || 20);

                const drawXmm = snapTo1mmGrid(margins + pos.x);
                const drawYmm = snapTo1mmGrid(margins + pos.y);

                const rCrop = item.cropEnabled || settings.globalCropEnabled;
                const rFrame = item.frameEnabled || settings.globalFrameEnabled;
                const frameMm = settings.frameMm || 0;
                const cutFrameMm = settings.cutFrameMm || 0;

                const safeFrameMm = Math.min(frameMm, targetSizeMm / 2.1);
                const safeCutFrameMm = Math.min(cutFrameMm, targetSizeMm / 2.1);

                const innerCropSizeMm = Math.max(0, targetSizeMm - 2 * safeCutFrameMm);
                const innerFrameSizeMm = Math.max(0, targetSizeMm - 2 * safeFrameMm);

                let finalImgSrc: string | HTMLImageElement = img;

                if (rCrop && safeCutFrameMm > 0) {
                    const canvas = document.createElement('canvas');
                    const scaleInner = innerCropSizeMm / targetSizeMm;
                    const sw = img.width * scaleInner;
                    const sh = img.height * scaleInner;
                    const sx = (img.width - sw) / 2;
                    const sy = (img.height - sh) / 2;

                    canvas.width = targetSizeMm * 10; // high res crop
                    canvas.height = targetSizeMm * 10;
                    const cctx = canvas.getContext('2d');
                    if (cctx) {
                        if (settings.frameShape === 'circle') {
                            cctx.beginPath();
                            cctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
                            cctx.clip();
                        }
                        cctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
                        finalImgSrc = canvas.toDataURL('image/png');
                    }
                }

                let dx = drawXmm, dy = drawYmm, dw = targetSizeMm, dh = targetSizeMm;
                if (rFrame && safeFrameMm > 0) {
                    dw = innerFrameSizeMm;
                    dh = innerFrameSizeMm;
                    dx = drawXmm + safeFrameMm;
                    dy = drawYmm + safeFrameMm;
                }

                pdf.addImage(finalImgSrc, 'PNG', dx, dy, dw, dh);

                if (rFrame && safeFrameMm > 0) {
                    const frameColor = item.colorEnabled && item.frameColor ? item.frameColor : settings.frameColor;
                    const rgb = hexToRgb(frameColor);
                    pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
                    pdf.setLineWidth(safeFrameMm);

                    if (settings.frameShape === 'square') {
                        pdf.rect(drawXmm + safeFrameMm / 2, drawYmm + safeFrameMm / 2, targetSizeMm - safeFrameMm, targetSizeMm - safeFrameMm);
                    } else {
                        const cx = drawXmm + targetSizeMm / 2;
                        const cy = drawYmm + targetSizeMm / 2;
                        const radius = Math.max(0, targetSizeMm / 2 - safeFrameMm / 2);
                        pdf.circle(cx, cy, radius);
                    }
                }

                // Overlay handling
                if (allFrame && (allFrame.saturatedSrc || allFrame.processedSrc)) {
                    let showOverlay = false;
                    if (allFrame.useForAll) showOverlay = true;
                    else if (allFrame.checked && item.overlayEnabled) showOverlay = true;

                    if (showOverlay) {
                        pdf.addImage(allFrame.saturatedSrc || allFrame.processedSrc, 'PNG', drawXmm, drawYmm, targetSizeMm, targetSizeMm);
                    }
                }
                resolve();
            };

            img.onerror = () => {
                console.warn(`Failed to load image for token ${item.name}`);
                resolve();
            };
            img.src = item.src;
        });
    });

    await Promise.all(promises);
    pdf.save('tokens.pdf');
}
