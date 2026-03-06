import {
  Edit3,
  LayoutGrid,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Magnet,
} from 'lucide-react';
import { useStore } from '../../store/index.ts';
import { clamp } from '../../utils/math.ts';

export function CanvasToolbar() {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const zoom = useStore((s) => s.zoom);
  const setZoom = useStore((s) => s.setZoom);
  const gridEnabled = useStore((s) => s.gridEnabled);
  const toggleGrid = useStore((s) => s.toggleGrid);
  const snapToGrid = useStore((s) => s.snapToGrid);
  const toggleSnapToGrid = useStore((s) => s.toggleSnapToGrid);

  const handleZoomIn = () => setZoom(clamp(zoom + 0.1, 0.2, 5));
  const handleZoomOut = () => setZoom(clamp(zoom - 0.1, 0.2, 5));

  return (
    <div className="flex items-center gap-2 border-b border-slate-700 bg-slate-800 px-4 py-2">
      {/* Mode toggle */}
      <div className="flex rounded-lg bg-slate-700 p-0.5">
        <button
          onClick={() => setMode('edit')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === 'edit'
              ? 'bg-primary-600 text-white'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Edit3 size={14} />
          Edit
        </button>
        <button
          onClick={() => setMode('print-layout')}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === 'print-layout'
              ? 'bg-primary-600 text-white'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <LayoutGrid size={14} />
          Print Layout
        </button>
      </div>

      <div className="mx-2 h-5 w-px bg-slate-600" />

      {/* Grid & Snap */}
      <button
        onClick={toggleGrid}
        className={`rounded-md p-1.5 transition-colors ${
          gridEnabled
            ? 'bg-primary-600/20 text-primary-400'
            : 'text-slate-400 hover:text-white'
        }`}
        title="Toggle Grid"
      >
        <Grid3X3 size={16} />
      </button>
      <button
        onClick={toggleSnapToGrid}
        className={`rounded-md p-1.5 transition-colors ${
          snapToGrid
            ? 'bg-primary-600/20 text-primary-400'
            : 'text-slate-400 hover:text-white'
        }`}
        title="Snap to Grid"
      >
        <Magnet size={16} />
      </button>

      <div className="mx-2 h-5 w-px bg-slate-600" />

      {/* Zoom controls */}
      <button
        onClick={handleZoomOut}
        className="rounded-md p-1.5 text-slate-400 transition-colors hover:text-white"
        title="Zoom Out"
      >
        <ZoomOut size={16} />
      </button>
      <span className="min-w-[3rem] text-center text-xs text-slate-300">
        {Math.round(zoom * 100)}%
      </span>
      <button
        onClick={handleZoomIn}
        className="rounded-md p-1.5 text-slate-400 transition-colors hover:text-white"
        title="Zoom In"
      >
        <ZoomIn size={16} />
      </button>
    </div>
  );
}
