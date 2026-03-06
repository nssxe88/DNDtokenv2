import { useRef } from 'react';
import { CanvasToolbar } from './CanvasToolbar.tsx';
import { KonvaCanvas } from '../../canvas/KonvaCanvas.tsx';
import { useCanvasSize } from '../../hooks/useCanvasSize.ts';
import { useStore } from '../../store/index.ts';

export function CanvasArea() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useCanvasSize(containerRef);
  const tokenCount = useStore((s) => s.tokens.length);
  const zoom = useStore((s) => s.zoom);
  const mode = useStore((s) => s.mode);

  return (
    <div className="flex flex-1 flex-col">
      <CanvasToolbar />

      <div
        ref={containerRef}
        className="relative flex-1 overflow-hidden bg-slate-950"
      >
        <KonvaCanvas width={width} height={height} />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between border-t border-slate-700 bg-slate-800 px-4 py-1.5 text-xs text-slate-400">
        <span>
          {tokenCount} token{tokenCount !== 1 ? 's' : ''}
        </span>
        <span>{mode === 'edit' ? 'Edit Mode' : 'Print Layout'}</span>
        <span>{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
}
