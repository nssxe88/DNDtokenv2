import { useState, useRef, useCallback } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Circle, Line } from 'react-konva';
import type Konva from 'konva';
import { X, RotateCcw } from 'lucide-react';
import { useStore } from '../../store/index.ts';
import { useImageLoader } from '../../hooks/useImageLoader.ts';
import type { ImageCropTransform, TokenShape } from '../../types/index.ts';
import { useTranslation } from '../../i18n/useTranslation.ts';

const PREVIEW_SIZE = 320;

/** Local crop state used inside the preview (absolute pixel values at PREVIEW_SIZE). */
interface PreviewCrop {
  offsetX: number;
  offsetY: number;
  scale: number;
  rotation: number;
}

function autoFitPreview(imageWidth: number, imageHeight: number): PreviewCrop {
  const scale = Math.max(PREVIEW_SIZE / imageWidth, PREVIEW_SIZE / imageHeight);
  return { offsetX: 0, offsetY: 0, scale, rotation: 0 };
}

/**
 * Convert stored (normalized) crop to preview-space crop.
 * Stored offsets are fractions of token size; scale is relative (1 = auto-fit).
 */
function storedCropToPreview(
  stored: ImageCropTransform,
  imageWidth: number,
  imageHeight: number
): PreviewCrop {
  const baseScale = Math.max(PREVIEW_SIZE / imageWidth, PREVIEW_SIZE / imageHeight);
  return {
    offsetX: stored.offsetX * PREVIEW_SIZE,
    offsetY: stored.offsetY * PREVIEW_SIZE,
    scale: stored.scale * baseScale,
    rotation: stored.rotation,
  };
}

/**
 * Convert preview-space crop back to normalized stored format.
 */
function previewCropToStored(
  preview: PreviewCrop,
  imageWidth: number,
  imageHeight: number
): ImageCropTransform {
  const baseScale = Math.max(PREVIEW_SIZE / imageWidth, PREVIEW_SIZE / imageHeight);
  return {
    offsetX: preview.offsetX / PREVIEW_SIZE,
    offsetY: preview.offsetY / PREVIEW_SIZE,
    scale: preview.scale / baseScale,
    rotation: preview.rotation,
  };
}

interface DimOverlayProps {
  shape: TokenShape;
  size: number;
}

/** Semi-transparent overlay outside the token shape for visual clarity. */
function DimOverlay({ shape, size }: DimOverlayProps) {
  const sceneFunc = useCallback(
    (context: Konva.Context, konvaShape: Konva.Shape) => {
      const ctx = context._context;
      ctx.save();

      ctx.beginPath();
      ctx.rect(0, 0, size, size);

      const half = size / 2;
      switch (shape) {
        case 'circle':
          ctx.arc(half, half, half, 0, Math.PI * 2);
          break;
        case 'square':
          ctx.rect(0.5, 0.5, size - 1, size - 1);
          break;
        case 'hexagon':
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

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fill('evenodd');

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
  const { t } = useTranslation();
  const cropModalTokenId = useStore((s) => s.cropModalTokenId);
  const closeCropModal = useStore((s) => s.closeCropModal);
  const tokens = useStore((s) => s.tokens);
  const updateTokenImageCrop = useStore((s) => s.updateTokenImageCrop);

  const token = tokens.find((tk) => tk.id === cropModalTokenId);
  const image = useImageLoader(token?.originalSrc ?? null);

  const [localCrop, setLocalCrop] = useState<PreviewCrop>({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
    rotation: 0,
  });

  const imageRef = useRef<Konva.Image>(null);

  const [prevInitKey, setPrevInitKey] = useState<string | null>(null);
  const initKey = token && image ? `${token.id}:${image.src}` : null;
  if (initKey && initKey !== prevInitKey && token && image) {
    setPrevInitKey(initKey);
    if (token.imageCrop.scale === 1 && token.imageCrop.offsetX === 0 && token.imageCrop.offsetY === 0) {
      setLocalCrop(autoFitPreview(image.width, image.height));
    } else {
      setLocalCrop(storedCropToPreview(token.imageCrop, image.width, image.height));
    }
  }

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
      setLocalCrop(autoFitPreview(image.width, image.height));
    }
  };

  const handleApply = () => {
    if (image) {
      updateTokenImageCrop(token.id, previewCropToStored(localCrop, image.width, image.height));
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
            {t('imagePosition.title')}
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
          <span className="text-xs text-slate-400">{t('imagePosition.zoom')}</span>
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
            {t('imagePosition.reset')}
          </button>
        </div>

        <p className="px-6 pb-4 text-xs text-slate-500">
          {t('imagePosition.instructions')}
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-slate-700 px-6 py-4">
          <button
            onClick={handleCancel}
            className="rounded-lg px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700"
          >
            {t('imagePosition.cancel')}
          </button>
          <button
            onClick={handleApply}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            {t('imagePosition.apply')}
          </button>
        </div>
      </div>
    </div>
  );
}
