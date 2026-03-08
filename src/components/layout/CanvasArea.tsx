import { useRef } from 'react';
import { Menu } from 'lucide-react';
import { CanvasToolbar } from './CanvasToolbar.tsx';
import { KonvaCanvas } from '../../canvas/KonvaCanvas.tsx';
import { useCanvasSize } from '../../hooks/useCanvasSize.ts';
import { useStore } from '../../store/index.ts';
import { useTranslation } from '../../i18n/useTranslation.ts';

export function CanvasArea() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useCanvasSize(containerRef);
  const tokenCount = useStore((s) => s.tokens.length);
  const zoom = useStore((s) => s.zoom);
  const mode = useStore((s) => s.mode);
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const toggleSidebar = useStore((s) => s.toggleSidebar);

  return (
    <div className="flex flex-1 flex-col min-w-0">
      <div className="flex items-center border-b border-slate-700 bg-slate-800">
        {/* Mobile hamburger — only when sidebar is closed */}
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="flex-shrink-0 p-2 text-slate-400 hover:text-white lg:hidden"
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <CanvasToolbar />
        </div>
      </div>

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
        <span>{mode === 'edit' ? t('toolbar.edit') : t('toolbar.printLayout')}</span>
        <span>{Math.round(zoom * 100)}%</span>
      </div>
    </div>
  );
}
