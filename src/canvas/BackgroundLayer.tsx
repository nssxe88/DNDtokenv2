import { Rect, Line, Layer } from 'react-konva';
import { useStore } from '../store/index.ts';
import { mmToPx } from '../utils/units.ts';
import { getPaperDimensions } from '../utils/paper.ts';

interface BackgroundLayerProps {
  zoom: number;
  panOffset: { x: number; y: number };
}

export function BackgroundLayer({ zoom, panOffset }: BackgroundLayerProps) {
  const paperSize = useStore((s) => s.paperSize);
  const orientation = useStore((s) => s.orientation);
  const customPaperSize = useStore((s) => s.customPaperSize);
  const margins = useStore((s) => s.margins);
  const gridEnabled = useStore((s) => s.gridEnabled);
  const gridSizeMm = useStore((s) => s.gridSizeMm);

  const paper = getPaperDimensions(paperSize, orientation, customPaperSize);
  const paperW = mmToPx(paper.width);
  const paperH = mmToPx(paper.height);
  const marginPx = mmToPx(margins);
  const gridPx = mmToPx(gridSizeMm);

  const gridLines: { points: number[]; key: string }[] = [];

  if (gridEnabled) {
    // Vertical grid lines
    for (let x = marginPx; x <= paperW - marginPx; x += gridPx) {
      gridLines.push({
        key: `gv-${x}`,
        points: [x, marginPx, x, paperH - marginPx],
      });
    }
    // Horizontal grid lines
    for (let y = marginPx; y <= paperH - marginPx; y += gridPx) {
      gridLines.push({
        key: `gh-${y}`,
        points: [marginPx, y, paperW - marginPx, y],
      });
    }
  }

  return (
    <Layer scaleX={zoom} scaleY={zoom} x={panOffset.x} y={panOffset.y}>
      {/* Canvas background (dark) */}
      <Rect x={-2000} y={-2000} width={6000} height={6000} fill="#0f172a" />

      {/* Paper shadow */}
      <Rect
        x={4}
        y={4}
        width={paperW}
        height={paperH}
        fill="rgba(0,0,0,0.3)"
        cornerRadius={2}
      />

      {/* Paper */}
      <Rect
        x={0}
        y={0}
        width={paperW}
        height={paperH}
        fill="#ffffff"
        cornerRadius={1}
      />

      {/* Margin guides */}
      <Rect
        x={marginPx}
        y={marginPx}
        width={paperW - marginPx * 2}
        height={paperH - marginPx * 2}
        stroke="#93c5fd"
        strokeWidth={0.5}
        dash={[4, 4]}
      />

      {/* Grid lines */}
      {gridLines.map(({ key, points }) => (
        <Line
          key={key}
          points={points}
          stroke="#e2e8f0"
          strokeWidth={0.3}
          opacity={0.3}
        />
      ))}
    </Layer>
  );
}
