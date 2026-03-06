import { useStore } from '../../store/index.ts';
import { PAPER_SIZES } from '../../utils/constants.ts';
import type { PaperSize } from '../../types/index.ts';

const PAPER_OPTIONS = Object.entries(PAPER_SIZES) as [Exclude<PaperSize, 'custom'>, { label: string }][];

export function PrintSettingsPanel() {
  const paperSize = useStore((s) => s.paperSize);
  const orientation = useStore((s) => s.orientation);
  const margins = useStore((s) => s.margins);
  const spacing = useStore((s) => s.spacing);
  const setPaperSize = useStore((s) => s.setPaperSize);
  const setOrientation = useStore((s) => s.setOrientation);
  const setMargins = useStore((s) => s.setMargins);
  const setSpacing = useStore((s) => s.setSpacing);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-200">Print Settings</h3>

      {/* Paper size */}
      <div>
        <label className="mb-1 block text-xs text-slate-400">Paper Size</label>
        <select
          value={paperSize}
          onChange={(e) => setPaperSize(e.target.value as PaperSize)}
          className="w-full rounded-md border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-slate-200"
        >
          {PAPER_OPTIONS.map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Orientation */}
      <div>
        <label className="mb-1 block text-xs text-slate-400">Orientation</label>
        <div className="flex rounded-lg bg-slate-700 p-0.5">
          <button
            onClick={() => setOrientation('portrait')}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              orientation === 'portrait'
                ? 'bg-primary-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Portrait
          </button>
          <button
            onClick={() => setOrientation('landscape')}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              orientation === 'landscape'
                ? 'bg-primary-600 text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Landscape
          </button>
        </div>
      </div>

      {/* Margins */}
      <div>
        <label className="mb-1 flex items-center justify-between text-xs text-slate-400">
          <span>Margins</span>
          <span>{margins} mm</span>
        </label>
        <input
          type="range"
          min={0}
          max={30}
          step={1}
          value={margins}
          onChange={(e) => setMargins(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Spacing */}
      <div>
        <label className="mb-1 flex items-center justify-between text-xs text-slate-400">
          <span>Token Spacing</span>
          <span>{spacing} mm</span>
        </label>
        <input
          type="range"
          min={0}
          max={20}
          step={0.5}
          value={spacing}
          onChange={(e) => setSpacing(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
