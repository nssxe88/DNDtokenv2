import { useRef, useEffect } from 'react';
import { Group, Circle, Rect, Line, Image as KonvaImage } from 'react-konva';
import type Konva from 'konva';
import type { Token } from '../types/index.ts';
import { useImageLoader } from '../hooks/useImageLoader.ts';
import { mmToPx } from '../utils/units.ts';
import { drawShapePath } from '../utils/shapes.ts';

interface TokenGroupProps {
  token: Token;
  isSelected: boolean;
  draggable: boolean;
  onSelect: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  onTransformEnd: (id: string, node: Konva.Node) => void;
  onDblClick?: (id: string) => void;
}

export function TokenGroup({
  token,
  isSelected,
  draggable,
  onSelect,
  onDragEnd,
  onTransformEnd,
  onDblClick,
}: TokenGroupProps) {
  const groupRef = useRef<Konva.Group>(null);
  const image = useImageLoader(token.processedSrc);

  const sizePx = mmToPx(token.sizeMm);
  const x = mmToPx(token.position.x);
  const y = mmToPx(token.position.y);

  // Frame
  const frameThicknessPx = token.frame.enabled
    ? mmToPx(token.frame.thicknessMm)
    : 0;
  const totalSizePx = sizePx + frameThicknessPx * 2;

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.setAttr('tokenId', token.id);
    }
  }, [token.id]);

  if (!token.visible) return null;

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    onSelect(token.id);
  };

  const handleDblClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    onDblClick?.(token.id);
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onDragEnd(token.id, e.target.x(), e.target.y());
  };

  const handleTransformEnd = () => {
    if (groupRef.current) {
      onTransformEnd(token.id, groupRef.current);
    }
  };

  // Clip function for shape masking
  const clipFunc = (ctx: Parameters<Exclude<Konva.GroupConfig['clipFunc'], undefined>>[0]) => {
    drawShapePath(ctx, token.shape, sizePx);
    ctx.clip();
  };

  // Image positioning within the token
  const imgScale = image
    ? Math.max(sizePx / image.width, sizePx / image.height) * token.imageCrop.scale
    : 1;
  const imgWidth = image ? image.width * imgScale : sizePx;
  const imgHeight = image ? image.height * imgScale : sizePx;
  const imgX = (sizePx - imgWidth) / 2 + token.imageCrop.offsetX;
  const imgY = (sizePx - imgHeight) / 2 + token.imageCrop.offsetY;

  // Build hexagon points for frame & selection
  const hexFramePoints: number[] = [];
  const hexSelectionPoints: number[] = [];
  if (token.shape === 'hexagon') {
    const frameHalf = totalSizePx / 2;
    const selHalf = totalSizePx / 2 + 2;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      hexFramePoints.push(
        frameHalf + frameHalf * Math.cos(angle),
        frameHalf + frameHalf * Math.sin(angle)
      );
      hexSelectionPoints.push(
        sizePx / 2 + selHalf * Math.cos(angle),
        sizePx / 2 + selHalf * Math.sin(angle)
      );
    }
  }

  return (
    <Group
      ref={groupRef}
      id={token.id}
      x={x}
      y={y}
      rotation={token.rotation}
      draggable={draggable && !token.locked}
      onClick={handleClick}
      onTap={handleClick}
      onDblClick={handleDblClick}
      onDblTap={handleDblClick}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
    >
      {/* Frame background (behind the image) */}
      {token.frame.enabled && token.shape === 'circle' && (
        <Circle
          x={sizePx / 2}
          y={sizePx / 2}
          radius={totalSizePx / 2}
          fill={token.frame.color}
        />
      )}
      {token.frame.enabled && token.shape === 'square' && (
        <Rect
          x={-frameThicknessPx}
          y={-frameThicknessPx}
          width={totalSizePx}
          height={totalSizePx}
          fill={token.frame.color}
          cornerRadius={1}
        />
      )}
      {token.frame.enabled && token.shape === 'hexagon' && (
        <Line
          points={hexFramePoints}
          closed={true}
          fill={token.frame.color}
          x={-frameThicknessPx}
          y={-frameThicknessPx}
        />
      )}

      {/* Clipped token image */}
      <Group clipFunc={clipFunc}>
        {image && (
          <KonvaImage
            image={image}
            x={imgX}
            y={imgY}
            width={imgWidth}
            height={imgHeight}
          />
        )}
      </Group>

      {/* Selection indicator */}
      {isSelected && token.shape === 'circle' && (
        <Circle
          x={sizePx / 2}
          y={sizePx / 2}
          radius={totalSizePx / 2 + 2}
          stroke="#818cf8"
          strokeWidth={2}
          dash={[6, 3]}
        />
      )}
      {isSelected && token.shape === 'square' && (
        <Rect
          x={-frameThicknessPx - 2}
          y={-frameThicknessPx - 2}
          width={totalSizePx + 4}
          height={totalSizePx + 4}
          stroke="#818cf8"
          strokeWidth={2}
          dash={[6, 3]}
        />
      )}
      {isSelected && token.shape === 'hexagon' && (
        <Line
          points={hexSelectionPoints}
          closed={true}
          stroke="#818cf8"
          strokeWidth={2}
          dash={[6, 3]}
        />
      )}
    </Group>
  );
}
