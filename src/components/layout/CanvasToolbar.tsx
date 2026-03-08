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
  Globe,
} from 'lucide-react';
import { useStore } from '../../store/index.ts';
import { clamp } from '../../utils/math.ts';
import { useTranslation } from '../../i18n/useTranslation.ts';
import type { Language } from '../../i18n/index.ts';

export function CanvasToolbar() {
  const { t, language } = useTranslation();
  const setLanguage = useStore((s) => s.setLanguage);

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

  const toggleLanguage = () => {
    const next: Language = language === 'en' ? 'hu' : 'en';
    setLanguage(next);
  };

  return (
    <div className="flex items-center gap-1 overflow-x-auto px-2 py-2 sm:gap-2 sm:px-4">
      {/* Project info */}
      <button
        onClick={openProjectManager}
        className="flex flex-shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-700"
        title={t('toolbar.projectManager')}
      >
        <FolderOpen size={14} />
        <span className="hidden max-w-[120px] truncate sm:inline">{currentProjectName}</span>
        {projectDirty && <span className="text-amber-400">*</span>}
      </button>

      <button
        onClick={() => saveCurrentProject()}
        className="flex-shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:text-white"
        title={t('toolbar.save')}
      >
        <Save size={14} />
      </button>

      <div className="mx-1 h-5 w-px flex-shrink-0 bg-slate-600 sm:mx-2" />

      {/* Undo / Redo */}
      <button
        onClick={undo}
        disabled={!canUndo}
        className="flex-shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        title={t('toolbar.undo')}
      >
        <Undo2 size={16} />
      </button>
      <button
        onClick={redo}
        disabled={!canRedo}
        className="flex-shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        title={t('toolbar.redo')}
      >
        <Redo2 size={16} />
      </button>

      <div className="mx-1 h-5 w-px flex-shrink-0 bg-slate-600 sm:mx-2" />

      {/* Mode toggle */}
      <div className="flex flex-shrink-0 rounded-lg bg-slate-700 p-0.5">
        <button
          onClick={() => setMode('edit')}
          className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:gap-1.5 sm:px-3 ${
            mode === 'edit'
              ? 'bg-primary-600 text-white'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Edit3 size={14} />
          <span className="hidden sm:inline">{t('toolbar.edit')}</span>
        </button>
        <button
          onClick={() => setMode('print-layout')}
          className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:gap-1.5 sm:px-3 ${
            mode === 'print-layout'
              ? 'bg-primary-600 text-white'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <LayoutGrid size={14} />
          <span className="hidden sm:inline">{t('toolbar.printLayout')}</span>
        </button>
      </div>

      <div className="mx-1 h-5 w-px flex-shrink-0 bg-slate-600 sm:mx-2" />

      {/* Grid & Snap */}
      <button
        onClick={toggleGrid}
        className={`flex-shrink-0 rounded-md p-1.5 transition-colors ${
          gridEnabled
            ? 'bg-primary-600/20 text-primary-400'
            : 'text-slate-400 hover:text-white'
        }`}
        title={t('toolbar.grid')}
      >
        <Grid3X3 size={16} />
      </button>
      <button
        onClick={toggleSnapToGrid}
        className={`flex-shrink-0 rounded-md p-1.5 transition-colors ${
          snapToGrid
            ? 'bg-primary-600/20 text-primary-400'
            : 'text-slate-400 hover:text-white'
        }`}
        title={t('toolbar.snapToGrid')}
      >
        <Magnet size={16} />
      </button>

      <div className="mx-1 h-5 w-px flex-shrink-0 bg-slate-600 sm:mx-2" />

      {/* Zoom controls */}
      <button
        onClick={handleZoomOut}
        className="flex-shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:text-white"
        title={t('toolbar.zoomOut')}
      >
        <ZoomOut size={16} />
      </button>
      <span className="min-w-[3rem] flex-shrink-0 text-center text-xs text-slate-300">
        {Math.round(zoom * 100)}%
      </span>
      <button
        onClick={handleZoomIn}
        className="flex-shrink-0 rounded-md p-1.5 text-slate-400 transition-colors hover:text-white"
        title={t('toolbar.zoomIn')}
      >
        <ZoomIn size={16} />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Language switcher */}
      <button
        onClick={toggleLanguage}
        className="flex flex-shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-slate-300 transition-colors hover:bg-slate-700"
        title={t('toolbar.language')}
      >
        <Globe size={14} />
        <span className="uppercase font-medium">{language}</span>
      </button>
    </div>
  );
}
