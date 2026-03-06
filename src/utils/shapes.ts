import type { TokenShape } from '../types/index.ts';

interface ShapeContext {
  beginPath: () => void;
  arc: (x: number, y: number, radius: number, startAngle: number, endAngle: number) => void;
  rect: (x: number, y: number, w: number, h: number) => void;
  moveTo: (x: number, y: number) => void;
  lineTo: (x: number, y: number) => void;
  closePath: () => void;
}

/** Draw a token shape path on a canvas context (does NOT call fill/stroke/clip) */
export function drawShapePath(ctx: ShapeContext, shape: TokenShape, size: number) {
  const half = size / 2;
  ctx.beginPath();

  switch (shape) {
    case 'circle':
      ctx.arc(half, half, half, 0, Math.PI * 2);
      break;
    case 'square':
      ctx.rect(0, 0, size, size);
      break;
    case 'hexagon': {
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const hx = half + half * Math.cos(angle);
        const hy = half + half * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      break;
    }
  }
}

/** Draw a shape path at an offset position (for frames) */
export function drawShapePathAt(
  ctx: ShapeContext,
  shape: TokenShape,
  size: number,
  offsetX: number,
  offsetY: number
) {
  const half = size / 2;
  ctx.beginPath();

  switch (shape) {
    case 'circle':
      ctx.arc(half + offsetX, half + offsetY, half, 0, Math.PI * 2);
      break;
    case 'square':
      ctx.rect(offsetX, offsetY, size, size);
      break;
    case 'hexagon': {
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const hx = half + half * Math.cos(angle) + offsetX;
        const hy = half + half * Math.sin(angle) + offsetY;
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      break;
    }
  }
}
