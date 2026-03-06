// Utility functions extracted from the original HTML file
export const MMtoPX = 2.834645669;

export function mmToPxExact(mm: number, dpi: number = 600) {
    return (mm * dpi) / 25.4;
}

export function roundMm(mm: number) {
    return Math.round(mm * 100) / 100;
}

export function snapTo1mmGrid(mmValue: number) {
    const snapped = Math.round(mmValue);
    return Number(snapped.toFixed(2));
}

export function hexToRgb(hex: string | null) {
    if (!hex) return { r: 0, g: 0, b: 0 };
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(h => h + h).join('');
    }
    const num = parseInt(hex, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255
    };
}

export async function processOriginalImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target?.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Default square-to-circle crop when uploading token images initially
export async function createDefaultCroppedSrc(imgSrc: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            try {
                const shortSide = Math.max(1, Math.min(img.width, img.height));
                const srcX = Math.round((img.width - shortSide) / 2);
                const srcY = Math.round((img.height - shortSide) / 2);
                const srcSize = shortSide;

                const canvas = document.createElement('canvas');
                canvas.width = srcSize;
                canvas.height = srcSize;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error("No 2d context"));
                    return;
                }

                // Háttér letisztázása
                ctx.clearRect(0, 0, srcSize, srcSize);

                // Kör alakú clip az eredeti képrajzolás előtt!
                ctx.save();
                ctx.beginPath();
                ctx.arc(srcSize / 2, srcSize / 2, srcSize / 2, 0, Math.PI * 2);
                ctx.closePath();
                ctx.clip();

                // Kép berajzolása a körbe
                ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, srcSize, srcSize);
                ctx.restore();

                resolve(canvas.toDataURL('image/png'));
            } catch (e) {
                reject(e);
            }
        };
        img.onerror = () => reject(new Error("Image load error"));
        img.src = imgSrc;
    });
}

// Process frame images to fit within original dimensions
export async function processFrameImage(imgSrc: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            try {
                let finalSize = Math.max(1, Math.max(img.width, img.height));
                const canvas = document.createElement('canvas');
                canvas.width = finalSize;
                canvas.height = finalSize;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject("No context");

                ctx.clearRect(0, 0, finalSize, finalSize);
                const scale = Math.max(finalSize / img.width, finalSize / img.height);
                const drawW = img.width * scale;
                const drawH = img.height * scale;
                const dx = (finalSize - drawW) / 2;
                const dy = (finalSize - drawH) / 2;
                ctx.drawImage(img, dx, dy, drawW, drawH);

                resolve(canvas.toDataURL('image/png'));
            } catch (e) {
                reject(e);
            }
        };
        img.onerror = () => reject(new Error("Frame Image load error"));
        img.src = imgSrc;
    });
}

export async function applyHueSaturation(imgSrc: string, hueDeg: number, saturationPercent: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imgSrc;
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject("No context");

                ctx.filter = `saturate(${saturationPercent}%) hue-rotate(${hueDeg}deg)`;
                ctx.drawImage(img, 0, 0);

                resolve(canvas.toDataURL('image/png'));
            } catch (e) {
                reject(e);
            }
        };
        img.onerror = reject;
    });
}
