import { useState, useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Circle, Line } from 'react-konva';
import type Konva from 'konva';
import { X, RotateCcw } from 'lucide-react';
import { useStore } from '../../store/index.ts';
import { useImageLoader } from '../../hooks/useImageLoader.ts';
import type { ImageCropTransform, TokenShape } from '../../types/index.ts';
import { drawShapePath } from '../../utils/shapes.ts';

const PREVIEW_SIZE = 320;

function autoFitImage(imageWidth: number, imageHeight: number, tokenSize: number): ImageCropTransform {
  const scale = Math.max(tokenSize / imageWidth, tokenSize / imageHeight);
  return {
    offsetX: 0,
    offsetY: 0,
    scale,
    rotation: 0,
  };
}

interface DimOverlayProps {
  shape: TokenShape;
  size: number;
}

/** Semi-transparent overlay outside the token shape for visual clarity */
function DimOverlay({ shape, size }: DimOverlayProps) {
  const sceneFunc = useCallback(
    (context: Konva.Context, konvaShape: Konva.Shape) => {
      const ctx = context._context;
      // Fill entire canvas with semi-transparent dark
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, size, size);

      // Cut out the token shape using composite operation
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'white';

      drawShapePath(ctx, shape, size);
      ctx.fill();
      ctx.restore();

      konvaShape.fillEnabled(false);
      konvaShape.strokeEnabled(false);
    },
    [shape, size]
  );

  return (
    <Rect
      x={0}
      y={0}
      width={size}
      height={size}
      sceneFunc={sceneFunc}
      listening={false}
    />
  );
}

/** Shape outline border */
function ShapeOutline({ shape, size }: DimOverlayProps) {
  if (shape === 'circle') {
    return (
      <Circle
        x={size / 2}
        y={size / 2}
        radius={size / 2}
        stroke="#818cf8"
        strokeWidth={2}
        listening={false}
      />
    );
  }
  if (shape === 'square') {
    return (
      <Rect
        x={0}
        y={0}
        width={size}
        height={size}
        stroke="#818cf8"
        strokeWidth={2}
        listening={false}
      />
    );
  }
  // Hexagon
  const points: number[] = [];
  const half = size / 2;
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    points.push(half + half * Math.cos(angle), half + half * Math.sin(angle));
  }
  return (
    <Line
      points={points}
      closed={true}
      stroke="#818cf8"
      strokeWidth={2}
      listening={false}
    />
  );
}

export function ImagePositionModal() {
  const cropModalTokenId = useStore((s) => s.cropModalTokenId);
  const closeCropModal = useStore((s) => s.closeCropModal);
  const tokens = useStore((s) => s.tokens);
  const updateTokenImageCrop = useStore((s) => s.updateTokenImageCrop);

  const token = tokens.find((t) => t.id === cropModalTokenId);
  const image = useImageLoader(token?.originalSrc ?? null);

  const [localCrop, setLocalCrop] = useState<ImageCropTransform>({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    rotation: 0,
  });

  const imageRef = useRef<Konva.Image>(null);

  // Initialize crop from token when modal opens
  useEffect(() => {
    if (token && image) {
      if (token.imageCrop.scale === 1 && token.imageCrop.offsetX === 0 && token.imageCrop.offsetY === 0) {
        // Auto-fit for new tokens
        const fit = autoFitImage(image.width, image.height, PREVIEW_SIZE);
        setLocalCrop(fit);
      } else {
        // Use existing crop, scaled to preview size
        setLocalCrop({ ...token.imageCrop });
      }
    }
  }, [token, image]);

  if (!cropModalTokenId || !token) return null;

  const shape = token.shape;

  const imgWidth = image ? image.width * localCrop.scale : PREVIEW_SIZE;
  const imgHeight = image ? image.height * localCrop.scale : PREVIEW_SIZE;
  const imgX = (PREVIEW_SIZE - imgWidth) / 2 + localCrop.offsetX;
  const imgY = (PREVIEW_SIZE - imgHeight) / 2 + localCrop.offsetY;

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const centerOffsetX = node.x() - (PREVIEW_SIZE - imgWidth) / 2;
    const centerOffsetY = node.y() - (PREVIEW_SIZE - imgHeight) / 2;
    setLocalCrop((prev) => ({
      ...prev,
      offsetX: centerOffsetX,
      offsetY: centerOffsetY,
    }));
  };

  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const newScale = e.evt.deltaY < 0
      ? localCrop.scale * scaleBy
      : localCrop.scale / scaleBy;
    setLocalCrop((prev) => ({
      ...prev,
      scale: Math.max(0.1, Math.min(10, newScale)),
    }));
  };

  const handleReset = () => {
    if (image) {
      setLocalCrop(autoFitImage(image.width, image.height, PREVIEW_SIZE));
    }
  };

  const handleApply = () => {
    // Convert preview-space crop back to token-relative values
    if (image) {
      const tokenSizePx = PREVIEW_SIZE;
      const baseScale = Math.max(tokenSizePx / image.width, tokenSizePx / image.height);
      updateTokenImageCrop(token.id, {
        offsetX: localCrop.offsetX,
        offsetY: localCrop.offsetY,
        scale: localCrop.scale / baseScale,
        rotation: localCrop.rotation,
      });
    }
    closeCropModal();
  };

  const handleCancel = () => {
    closeCropModal();
  };

  const zoomPercent = image
    ? Math.round((localCrop.scale / Math.max(PREVIEW_SIZE / image.width, PREVIEW_SIZE / image.height)) * 100)
    : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[440px] rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-200">
            Position Image Within Token
          </h2>
          <button
            onClick={handleCancel}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Canvas preview */}
        <div className="flex justify-center p-6">
          <div className="overflow-hidden rounded-xl border border-slate-600 bg-slate-900">
            <Stage
              width={PREVIEW_SIZE}
              height={PREVIEW_SIZE}
              onWheel={handleWheel}
            >
              <Layer>
                {/* Background */}
                <Rect x={0} y={0} width={PREVIEW_SIZE} height={PREVIEW_SIZE} fill="#1e293b" />

                {/* Draggable image */}
                {image && (
                  <KonvaImage
                    ref={imageRef}
                    image={image}
                    x={imgX}
                    y={imgY}
                    width={imgWidth}
                    height={imgHeight}
                    draggable={true}
                    onDragEnd={handleDragEnd}
                  />
                )}

                {/* Dim overlay outside shape */}
                <DimOverlay shape={shape} size={PREVIEW_SIZE} />

                {/* Shape outline */}
                <ShapeOutline shape={shape} size={PREVIEW_SIZE} />
              </Layer>
            </Stage>
          </div>
        </div>

        {/* Zoom slider + Reset */}
        <div className="flex items-center gap-4 px-6 pb-2">
          <span className="text-xs text-slate-400">Zoom:</span>
          <input
            type="range"
            min={10}
            max={500}
            value={zoomPercent}
            onChange={(e) => {
              if (!image) return;
              const baseScale = Math.max(PREVIEW_SIZE / image.width, PREVIEW_SIZE / image.height);
              setLocalCrop((prev) => ({
                ...prev,
                scale: (Number(e.target.value) / 100) * baseScale,
              }));
            }}
            className="flex-1"
          />
          <span className="min-w-[3rem] text-right text-xs text-slate-300">{zoomPercent}%</span>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-slate-700 hover:text-white"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>

        <p className="px-6 pb-4 text-xs text-slate-500">
          Drag image to reposition. Scroll to zoom.
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-slate-700 px-6 py-4">
          <button
            onClick={handleCancel}
            className="rounded-lg px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
