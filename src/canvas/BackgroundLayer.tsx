import React from 'react';
import { Rect, Line, Layer, Text } from 'react-konva';
import { useStore } from '../store/index.ts';
import { mmToPx } from '../utils/units.ts';
import { getPaperDimensions } from '../utils/paper.ts';

interface BackgroundLayerProps {
  zoom: number;
  panOffset: { x: number; y: number };
  pageCount?: number;
}

export function BackgroundLayer({ zoom, panOffset, pageCount = 1 }: BackgroundLayerProps) {
  const paperSize = useStore((s) => s.paperSize);
  const orientation = useStore((s) => s.orientation);
  const customPaperSize = useStore((s) => s.customPaperSize);
  const margins = useStore((s) => s.margins);
  const gridEnabled = useStore((s) => s.gridEnabled);
  const gridSizeMm = useStore((s) => s.gridSizeMm);
  const showCutMarks = useStore((s) => s.showCutMarks);

  const paper = getPaperDimensions(paperSize, orientation, customPaperSize);
  const paperW = mmToPx(paper.width);
  const paperH = mmToPx(paper.height);
  const marginPx = mmToPx(margins);
  const gridPx = mmToPx(gridSizeMm);
  const cutMarkLength = mmToPx(5);
  const pageGapPx = mmToPx(10); // 10mm gap between pages

  const pages = Array.from({ length: pageCount }, (_, i) => i);

  return (
    <Layer scaleX={zoom} scaleY={zoom} x={panOffset.x} y={panOffset.y}>
      {/* Canvas background (dark) */}
      <Rect x={-2000} y={-2000} width={6000} height={12000} fill="#0f172a" />

      {pages.map((pageIdx) => {
        const offsetY = pageIdx * (paperH + pageGapPx);

        const gridLines: { points: number[]; key: string }[] = [];
        const cutMarkLines: { points: number[]; key: string }[] = [];

        if (gridEnabled) {
          for (let x = marginPx; x <= paperW - marginPx; x += gridPx) {
            gridLines.push({
              key: `p${pageIdx}-gv-${x}`,
              points: [x, marginPx + offsetY, x, paperH - marginPx + offsetY],
            });
          }
          for (let y = marginPx; y <= paperH - marginPx; y += gridPx) {
            gridLines.push({
              key: `p${pageIdx}-gh-${y}`,
              points: [marginPx, y + offsetY, paperW - marginPx, y + offsetY],
            });
          }
        }

        if (showCutMarks) {
          const my = marginPx + offsetY;
          const by = paperH - marginPx + offsetY;

          cutMarkLines.push(
            { key: `p${pageIdx}-cm-tl-h`, points: [marginPx - cutMarkLength, my, marginPx, my] },
            { key: `p${pageIdx}-cm-tl-v`, points: [marginPx, my - cutMarkLength, marginPx, my] },
            { key: `p${pageIdx}-cm-tr-h`, points: [paperW - marginPx, my, paperW - marginPx + cutMarkLength, my] },
            { key: `p${pageIdx}-cm-tr-v`, points: [paperW - marginPx, my - cutMarkLength, paperW - marginPx, my] },
            { key: `p${pageIdx}-cm-bl-h`, points: [marginPx - cutMarkLength, by, marginPx, by] },
            { key: `p${pageIdx}-cm-bl-v`, points: [marginPx, by, marginPx, by + cutMarkLength] },
            { key: `p${pageIdx}-cm-br-h`, points: [paperW - marginPx, by, paperW - marginPx + cutMarkLength, by] },
            { key: `p${pageIdx}-cm-br-v`, points: [paperW - marginPx, by, paperW - marginPx, by + cutMarkLength] }
          );
        }

        return (
          <React.Fragment key={`page-${pageIdx}`}>
            {/* Paper shadow */}
            <Rect
              x={4}
              y={4 + offsetY}
              width={paperW}
              height={paperH}
              fill="rgba(0,0,0,0.3)"
              cornerRadius={2}
            />

            {/* Paper */}
            <Rect
              x={0}
              y={offsetY}
              width={paperW}
              height={paperH}
              fill="#ffffff"
              cornerRadius={1}
            />

            {/* Page label for multi-page */}
            {pageCount > 1 && (
              <Text
                x={paperW + 8}
                y={offsetY + 4}
                text={`${pageIdx + 1}/${pageCount}`}
                fontSize={12}
                fill="#94a3b8"
                fontFamily="Inter, sans-serif"
              />
            )}

            {/* Margin guides */}
            <Rect
              x={marginPx}
              y={marginPx + offsetY}
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

            {/* Cut marks */}
            {cutMarkLines.map(({ key, points }) => (
              <Line
                key={key}
                points={points}
                stroke="#94a3b8"
                strokeWidth={0.3}
                dash={[2, 2]}
              />
            ))}
          </React.Fragment>
        );
      })}
    </Layer>
  );
}
