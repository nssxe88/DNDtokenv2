import { useState } from 'react';
import { useTokenStore } from '../store/tokenStore';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { X, Download } from 'lucide-react';

export const TokenSaveModal = ({ onClose }: { onClose: () => void }) => {
    const [size, setSize] = useState<number>(512);
    const [isExporting, setIsExporting] = useState(false);
    const { images, frames, settings } = useTokenStore();

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const zip = new JSZip();
            const allFrame = frames.find(f => f.useForAll || f.checked);

            if (images.length === 0) {
                alert("Nothing to save!");
                setIsExporting(false);
                onClose();
                return;
            }

            for (let i = 0; i < images.length; i++) {
                const item = images[i];

                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                if (!ctx) continue;

                const targetSizePx = size;
                const rCrop = item.cropEnabled || settings.globalCropEnabled;
                const rFrame = item.frameEnabled || settings.globalFrameEnabled;

                const targetSizeMm = item.manualSizeMm || 20;
                const frameMm = settings.frameMm || 0;
                const framePx = (frameMm / targetSizeMm) * targetSizePx;

                const cutFrameMm = settings.cutFrameMm || 0;
                const cutFramePx = (cutFrameMm / targetSizeMm) * targetSizePx;

                const safeFramePx = Math.min(framePx, targetSizePx / 2.1);
                const safeCutFramePx = Math.min(cutFramePx, targetSizePx / 2.1);

                const innerCropSizePx = Math.max(0, targetSizePx - 2 * safeCutFramePx);
                const innerFrameSizePx = Math.max(0, targetSizePx - 2 * safeFramePx);

                const img = new Image();
                img.src = item.src;
                await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
                if (!img.complete || img.naturalWidth === 0) continue;

                let sx = 0, sy = 0, sw = img.width, sh = img.height;
                if (rCrop) {
                    sw = img.width * (innerCropSizePx / targetSizePx);
                    sh = img.height * (innerCropSizePx / targetSizePx);
                    sx = (img.width - sw) / 2;
                    sy = (img.height - sh) / 2;
                }

                let dx = 0, dy = 0, dw = targetSizePx, dh = targetSizePx;
                if (rFrame) {
                    dw = innerFrameSizePx;
                    dh = innerFrameSizePx;
                    dx = safeFramePx;
                    dy = safeFramePx;
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
                    const frameColor = item.colorEnabled && item.frameColor ? item.frameColor : settings.frameColor;
                    ctx.strokeStyle = frameColor || '#000000';
                    ctx.lineWidth = safeFramePx;

                    if (settings.frameShape === 'square') {
                        ctx.strokeRect(safeFramePx / 2, safeFramePx / 2, targetSizePx - safeFramePx, targetSizePx - safeFramePx);
                    } else {
                        ctx.beginPath();
                        const radius = Math.max(0, targetSizePx / 2 - safeFramePx / 2);
                        ctx.arc(targetSizePx / 2, targetSizePx / 2, radius, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                    ctx.restore();
                }

                let showOverlay = false;
                if (allFrame) {
                    if (allFrame.useForAll) showOverlay = true;
                    else if (allFrame.checked && item.overlayEnabled) showOverlay = true;
                }

                if (showOverlay && allFrame?.saturatedSrc) {
                    const overlayImg = new Image();
                    overlayImg.src = allFrame.saturatedSrc;
                    await new Promise((resolve) => { overlayImg.onload = resolve; overlayImg.onerror = resolve; });
                    if (overlayImg.complete && overlayImg.naturalWidth > 0) {
                        ctx.drawImage(overlayImg, 0, 0, targetSizePx, targetSizePx);
                    }
                }

                if (settings.frameShape !== 'square') {
                    ctx.globalCompositeOperation = 'destination-in';
                    ctx.beginPath();
                    ctx.arc(targetSizePx / 2, targetSizePx / 2, targetSizePx / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalCompositeOperation = 'source-over';
                }

                const dataUrl = canvas.toDataURL('image/png');
                const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
                const nameWithoutExt = item.name.replace(/\.[^/.]+$/, "");
                const safeName = nameWithoutExt.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                zip.file(`token_${i + 1}_${safeName}.png`, base64Data, { base64: true });
            }

            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, 'fantasy_tokens.zip');
            onClose();
        } catch (e) {
            console.error(e);
            alert("Error during save!");
        }
        setIsExporting(false);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '400px', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={20} /> Save as Image (PNG)
                    </h2>
                    <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="form-group">
                    <label className="form-label">Image Resolution</label>
                    <select className="form-input" value={size} onChange={(e) => setSize(Number(e.target.value))}>
                        <option value={256}>256 x 256 px</option>
                        <option value={512}>512 x 512 px</option>
                        <option value={1024}>1024 x 1024 px</option>
                        <option value={2048}>2048 x 2048 px</option>
                    </select>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    Each uploaded token is saved as a separate file with a transparent background (.png), and the result can be downloaded as a ZIP file.
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button className="btn" onClick={onClose} disabled={isExporting}>Cancel</button>
                    <button className="btn" style={{ backgroundColor: '#10b981', color: 'white' }} onClick={handleExport} disabled={isExporting}>
                        {isExporting ? 'Saving...' : 'Start Saving'}
                    </button>
                </div>
            </div>
        </div>
    );
};
