import { useRef, useState, useEffect } from 'react';
import { useTokenStore } from '../store/tokenStore';
import { computeLayout } from '../lib/layoutEngine';
import { MMtoPX, snapTo1mmGrid, roundMm } from '../lib/imageProcessor';

// A simple Canvas layer to quickly preview the layout without React-Konva complexity at first.
export const PrintPreview = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [pageCount, setPageCount] = useState(0);
    const [tokenCount, setTokenCount] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [minZoom, setMinZoom] = useState(0.2);
    const [renderTick, setRenderTick] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Keep track of loaded image cache to avoid infinite loops
    const loadedImages = useRef<Record<string, HTMLImageElement>>({});

    const { images, frames, settings, presets } = useTokenStore();

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                const paperSizes: Record<string, { width: number, height: number }> = {
                    a4: { width: 210, height: 297 },
                    letter: { width: 216, height: 279 },
                    a3: { width: 297, height: 420 },
                    a5: { width: 148, height: 210 }
                };
                const pSize = paperSizes[settings.paperSize as keyof typeof paperSizes] || paperSizes.a4;
                const docW = pSize.width * MMtoPX;
                const docH = pSize.height * MMtoPX;

                const fitScale = Math.min((width - 40) / docW, (height - 40) / docH);
                const newMinZoom = Math.min(1, Math.max(0.1, fitScale));

                setMinZoom(newMinZoom);
                setZoom(prev => {
                    if (prev < newMinZoom || prev === 1) return newMinZoom;
                    return prev;
                });
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [settings.paperSize]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Use constant paper sizes
        const paperSizes = {
            a4: { width: 210, height: 297 },
            letter: { width: 216, height: 279 },
            a3: { width: 297, height: 420 },
            a5: { width: 148, height: 210 }
        };

        const pSize = paperSizes[settings.paperSize as keyof typeof paperSizes] || paperSizes.a4;
        const margins = settings.margins;
        const spacing = settings.spacing;

        // Layout calculations ALWAYS use scale = 1 to map to real physical mm
        const layoutScale = 1;
        const workWidth = (pSize.width - 2 * margins) * MMtoPX * layoutScale;
        const workHeight = (pSize.height - 2 * margins) * MMtoPX * layoutScale;
        const spacingPx = spacing * MMtoPX * layoutScale;
        const marginPx = margins * MMtoPX * layoutScale;
        const pageHeightPx = pSize.height * MMtoPX * layoutScale;
        const pageWidthPx = pSize.width * MMtoPX * layoutScale;

        const tokens: any[] = [];
        images.forEach((item, itemIdx) => {
            const sizeMm = item.manualSizeMm !== null ? item.manualSizeMm : presets[item.preset];
            const size = (sizeMm || 20) * MMtoPX * layoutScale;
            for (let n = 0; n < item.count; n++) {
                tokens.push({ itemIdx, w: size, h: size });
            }
        });

        tokens.sort((a, b) => b.h - a.h);
        setTokenCount(tokens.length);

        const layout = computeLayout(tokens, workWidth, workHeight, spacingPx);
        const totalPages = Math.max(1, layout.pageCount);
        setPageCount(totalPages);

        // Drawing uses the zoom scalar
        canvas.width = pageWidthPx * zoom;
        canvas.height = totalPages * pageHeightPx * zoom;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
            const pageOffsetY = pageIdx * pageHeightPx * zoom;

            // Draw paper edge
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1;
            ctx.strokeRect(0.5, pageOffsetY + 0.5, (pageWidthPx * zoom) - 1, (pageHeightPx * zoom) - 1);

            // Draw margins
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(marginPx * zoom, pageOffsetY + marginPx * zoom, (pageWidthPx - 2 * marginPx) * zoom, (pageHeightPx - 2 * marginPx) * zoom);
            ctx.setLineDash([]);
        }

        // Draw layout
        const allFrame = frames.find(f => f.checked || f.useForAll);

        layout.positions.forEach((pos: any) => {
            const item = images[pos.itemIndex];

            let img = loadedImages.current[item.src];
            if (!img) {
                img = new Image();
                img.src = item.src;
                if (img.complete && img.naturalWidth > 0) {
                    loadedImages.current[item.src] = img;
                } else {
                    img.onload = () => {
                        loadedImages.current[item.src] = img;
                        setRenderTick(t => t + 1); // Trigger re-render when image loaded
                    };
                    return; // skip drawing this frame until it's loaded
                }
            }

            if (!img.complete || img.naturalWidth === 0) return;

            const posXmm = (pos.x) / (MMtoPX * layoutScale);
            const posYmm = (pos.page * pageHeightPx + pos.y - (pos.page * pageHeightPx)) / (MMtoPX * layoutScale);
            const drawXmm = snapTo1mmGrid(margins + posXmm);
            const drawYmm = snapTo1mmGrid(margins + posYmm);
            const itemSizeMm = item.manualSizeMm !== null ? item.manualSizeMm : presets[item.preset];
            const targetSizeMm = roundMm(itemSizeMm || 20);

            const drawX = drawXmm * MMtoPX * zoom;
            const drawY = (pos.page * pageHeightPx * zoom) + drawYmm * MMtoPX * zoom;
            const targetSizePx = targetSizeMm * MMtoPX * zoom;

            // Frame and Crop calculations
            const rCrop = item.cropEnabled || settings.globalCropEnabled;
            const rFrame = item.frameEnabled || settings.globalFrameEnabled;
            const framePx = (settings.frameMm || 0) * MMtoPX * zoom;
            const cutFramePx = (settings.cutFrameMm || 0) * MMtoPX * zoom;

            // Ha a keret vastagabb, mint a token fele, akkor limitáljuk, különben negatívba csap át vagy eltűnik.
            const safeFramePx = Math.min(framePx, targetSizePx / 2.1);
            const safeCutFramePx = Math.min(cutFramePx, targetSizePx / 2.1);
            const innerCropSizePx = Math.max(0, targetSizePx - 2 * safeCutFramePx);
            const innerFrameSizePx = Math.max(0, targetSizePx - 2 * safeFramePx);

            let sx = 0, sy = 0, sw = img.width, sh = img.height;
            if (rCrop) {
                sw = img.width * (innerCropSizePx / targetSizePx);
                sh = img.height * (innerCropSizePx / targetSizePx);
                sx = (img.width - sw) / 2;
                sy = (img.height - sh) / 2;
            }

            let dx = drawX, dy = drawY, dw = targetSizePx, dh = targetSizePx;
            if (rFrame) {
                dw = innerFrameSizePx;
                dh = innerFrameSizePx;
                dx = drawX + safeFramePx;
                dy = drawY + safeFramePx;
            }

            ctx.save();
            if (settings.frameShape === 'circle') {
                ctx.beginPath();
                ctx.arc(dx + dw / 2, dy + dh / 2, dw / 2, 0, Math.PI * 2);
                ctx.clip();
            }
            ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
            ctx.restore();

            if (rFrame && safeFramePx > 0) {
                ctx.save();
                const col = item.colorEnabled && item.frameColor ? item.frameColor : settings.frameColor;
                ctx.strokeStyle = col;
                ctx.lineWidth = safeFramePx;

                if (settings.frameShape === 'square') {
                    ctx.strokeRect(drawX + safeFramePx / 2, drawY + safeFramePx / 2, targetSizePx - safeFramePx, targetSizePx - safeFramePx);
                } else {
                    ctx.beginPath();
                    const radius = Math.max(0, targetSizePx / 2 - safeFramePx / 2);
                    ctx.arc(drawX + targetSizePx / 2, drawY + targetSizePx / 2, radius, 0, Math.PI * 2);
                    ctx.stroke();
                }
                ctx.restore();
            }

            // Opcionális Overlay keret fájlból
            if (allFrame && allFrame.saturatedSrc) {
                let showOverlay = false;
                if (allFrame.useForAll) showOverlay = true;
                else if (allFrame.checked && item.overlayEnabled) showOverlay = true;

                if (showOverlay) {
                    let overlayImg = loadedImages.current[allFrame.saturatedSrc];
                    if (!overlayImg) {
                        overlayImg = new Image();
                        overlayImg.src = allFrame.saturatedSrc;
                        overlayImg.onload = () => {
                            loadedImages.current[allFrame.saturatedSrc] = overlayImg;
                            setRenderTick(t => t + 1);
                        };
                    } else if (overlayImg.complete && overlayImg.naturalWidth > 0) {
                        ctx.drawImage(overlayImg, drawX, drawY, targetSizePx, targetSizePx);
                    }
                }
            }

            // Halvány vágóvonal körbehúzva (hogy látszódjon a csempe széle vágáskor)
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(drawX, drawY, targetSizePx, targetSizePx);
        });

    }, [images, frames, settings, presets, zoom, renderTick]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', alignItems: 'center' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexShrink: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                <span style={{ marginLeft: '10px' }}>{tokenCount} tokens ready for print</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginRight: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem' }}>Zoom: {Math.round(zoom * 100)}%</span>
                        <input
                            type="range"
                            min={minZoom}
                            max={2}
                            step={0.01}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            style={{ width: '100px', cursor: 'pointer' }}
                        />
                    </div>
                    <span>{settings.paperSize.toUpperCase()} | {pageCount} page(s)</span>
                </div>
            </div>

            <div
                ref={containerRef}
                style={{
                    flex: 1,
                    width: '100%',
                    minHeight: 0,
                    overflow: 'auto',
                    backgroundColor: '#e2e8f0',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <div style={{
                    minWidth: 'max-content',
                    minHeight: 'max-content',
                    padding: '1.5rem',
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{
                        boxShadow: 'var(--shadow-md)',
                        overflow: 'hidden',
                        backgroundColor: 'white',
                    }}>
                        <canvas ref={canvasRef} style={{ display: 'block', backgroundColor: 'transparent' }} />
                    </div>
                </div>
            </div>
        </div >
    );
};
