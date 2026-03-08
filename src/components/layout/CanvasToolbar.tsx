import {
  Edit3,
  LayoutGrid,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Magnet,
  Undo2,
  Redo2,
  FolderOpen,
  Save,
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

  const canUndo = useStore((s) => s.canUndo);
  const canRedo = useStore((s) => s.canRedo);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);

  const projectDirty = useStore((s) => s.projectDirty);
  const currentProjectName = useStore((s) => s.currentProjectName);
  const openProjectManager = useStore((s) => s.openProjectManager);
  const saveCurrentProject = useStore((s) => s.saveCurrentProject);

  const handleZoomIn = () => setZoom(clamp(zoom + 0.1, 0.2, 5));
  const handleZoomOut = () => setZoom(clamp(zoom - 0.1, 0.2, 5));

  return (
    <div className="flex items-center gap-2 border-b border-slate-700 bg-slate-800 px-4 py-2">
      {/* Project info */}
      <button
        onClick={openProjectManager}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-700"
        title="Projekt kezel\u0151"
      >
        <FolderOpen size={14} />
        <span className="max-w-[120px] truncate">{currentProjectName}</span>
        {projectDirty && <span className="text-amber-400">*</span>}
      </button>

      <button
        onClick={() => saveCurrentProject()}
        className="rounded-md p-1.5 text-slate-400 transition-colors hover:text-white"
        title="Ment\u00e9s (Ctrl+S)"
      >
        <Save size={14} />
      </button>

      <div className="mx-2 h-5 w-px bg-slate-600" />

      {/* Undo / Redo */}
      <button
        onClick={undo}
        disabled={!canUndo}
        className="rounded-md p-1.5 text-slate-400 transition-colors hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        title="Visszavon\u00e1s (Ctrl+Z)"
      >
        <Undo2 size={16} />
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        className="rounded-md p-1.5 text-slate-400 transition-colors hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        title="\u00dajra (Ctrl+Shift+Z)"
      >
        <Redo2 size={16} />
      </button>

      <div className="mx-2 h-5 w-px bg-slate-600" />

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
        title="R\u00e1cs (Ctrl+G)"
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
        title="Illeszt\u00e9s r\u00e1cshoz"
      >
        <Magnet size={16} />
      </button>

      <div className="mx-2 h-5 w-px bg-slate-600" />

      {/* Zoom controls */}
      <button
        onClick={handleZoomOut}
        className="rounded-md p-1.5 text-slate-400 transition-colors hover:text-white"
        title="Kicsiny\u00edt\u00e9s (-)"
      >
        <ZoomOut size={16} />
      </button>
      <span className="min-w-[3rem] text-center text-xs text-slate-300">
        {Math.round(zoom * 100)}%
      </span>
      <button
        onClick={handleZoomIn}
        className="rounded-md p-1.5 text-slate-400 transition-colors hover:text-white"
        title="Nagy\u00edt\u00e1s (+)"
      >
        <ZoomIn size={16} />
      </button>
    </div>
  );
}
