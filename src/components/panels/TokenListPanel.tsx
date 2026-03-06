import { Trash2, Copy, Eye, EyeOff, Crop, Circle, Square, Hexagon } from 'lucide-react';
import { useStore } from '../../store/index.ts';
import type { DnDSizePreset, TokenShape } from '../../types/index.ts';
import { DND_SIZE_PRESETS, DND_SIZE_LABELS } from '../../utils/constants.ts';

const PRESETS = Object.entries(DND_SIZE_PRESETS) as [DnDSizePreset, number][];

const SHAPE_ICONS: Record<TokenShape, typeof Circle> = {
  circle: Circle,
  square: Square,
  hexagon: Hexagon,
};

const SHAPE_OPTIONS: { value: TokenShape; label: string }[] = [
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
  { value: 'hexagon', label: 'Hexagon' },
];

export function TokenListPanel() {
  const tokens = useStore((s) => s.tokens);
  const selectedTokenIds = useStore((s) => s.selectedTokenIds);
  const selectToken = useStore((s) => s.selectToken);
  const removeToken = useStore((s) => s.removeToken);
  const removeTokens = useStore((s) => s.removeTokens);
  const duplicateToken = useStore((s) => s.duplicateToken);
  const updateToken = useStore((s) => s.updateToken);
  const setTokenSize = useStore((s) => s.setTokenSize);
  const setTokenShape = useStore((s) => s.setTokenShape);
  const openCropModal = useStore((s) => s.openCropModal);
  const clearAllTokens = useStore((s) => s.clearAllTokens);

  if (tokens.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-500">
        No tokens yet. Upload images to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">
          Tokens ({tokens.length})
        </h3>
        <div className="flex gap-1">
          {selectedTokenIds.length > 1 && (
            <button
              onClick={() => removeTokens(selectedTokenIds)}
              className="rounded px-2 py-1 text-xs text-red-400 transition-colors hover:bg-red-400/10"
            >
              Delete Selected ({selectedTokenIds.length})
            </button>
          )}
          <button
            onClick={clearAllTokens}
            className="rounded px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-700 hover:text-slate-300"
          >
            Clear All
          </button>
        </div>
      </div>

      {tokens.map((token) => {
        const isSelected = selectedTokenIds.includes(token.id);
        const ShapeIcon = SHAPE_ICONS[token.shape];
        return (
          <div
            key={token.id}
            onClick={() => selectToken(token.id)}
            className={`cursor-pointer rounded-lg border p-3 transition-colors ${
              isSelected
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-slate-700 bg-slate-700/30 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Thumbnail */}
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md">
                <img
                  src={token.processedSrc}
                  alt={token.fileName}
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-0 right-0 rounded-tl bg-slate-800/80 p-0.5">
                  <ShapeIcon size={10} className="text-slate-300" />
                </div>
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-200">
                  {token.fileName}
                </p>
                <p className="text-xs text-slate-500">
                  {token.sizeMm}mm &middot; {token.shape} &middot; x{token.count}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openCropModal(token.id);
                  }}
                  className="rounded p-1 text-slate-400 hover:text-primary-400"
                  title="Position Image"
                >
                  <Crop size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateToken(token.id, { visible: !token.visible });
                  }}
                  className="rounded p-1 text-slate-400 hover:text-slate-200"
                  title={token.visible ? 'Hide' : 'Show'}
                >
                  {token.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateToken(token.id);
                  }}
                  className="rounded p-1 text-slate-400 hover:text-slate-200"
                  title="Duplicate"
                >
                  <Copy size={14} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToken(token.id);
                  }}
                  className="rounded p-1 text-slate-400 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Expanded settings when selected */}
            {isSelected && (
              <div className="mt-3 space-y-3 border-t border-slate-600 pt-3">
                {/* Shape selector */}
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Shape</label>
                  <div className="flex rounded-lg bg-slate-700 p-0.5">
                    {SHAPE_OPTIONS.map((opt) => {
                      const Icon = SHAPE_ICONS[opt.value];
                      return (
                        <button
                          key={opt.value}
                          onClick={(e) => {
                            e.stopPropagation();
                            setTokenShape(token.id, opt.value);
                          }}
                          className={`flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs transition-colors ${
                            token.shape === opt.value
                              ? 'bg-primary-600 text-white'
                              : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          <Icon size={12} />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Size preset */}
                <div>
                  <label className="mb-1 block text-xs text-slate-400">Size Preset</label>
                  <select
                    value={token.sizePreset ?? 'custom'}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'custom') return;
                      const preset = val as DnDSizePreset;
                      setTokenSize(token.id, DND_SIZE_PRESETS[preset], preset);
                    }}
                    className="w-full rounded-md border border-slate-600 bg-slate-700 px-2 py-1.5 text-xs text-slate-200"
                  >
                    {PRESETS.map(([key]) => (
                      <option key={key} value={key}>
                        {DND_SIZE_LABELS[key]}
                      </option>
                    ))}
                    {token.sizePreset === null && (
                      <option value="custom">Custom ({token.sizeMm}mm)</option>
                    )}
                  </select>
                </div>

                {/* Frame */}
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-xs text-slate-400">Frame</label>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateToken(token.id, {
                          frame: { ...token.frame, enabled: !token.frame.enabled },
                        });
                      }}
                      className={`rounded px-2 py-0.5 text-xs transition-colors ${
                        token.frame.enabled
                          ? 'bg-primary-600/20 text-primary-400'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {token.frame.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  {token.frame.enabled && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={token.frame.color}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateToken(token.id, {
                              frame: { ...token.frame, color: e.target.value },
                            });
                          }}
                          className="h-7 w-7 cursor-pointer rounded border border-slate-600 bg-transparent"
                        />
                        <div className="flex-1">
                          <label className="flex items-center justify-between text-xs text-slate-500">
                            <span>Thickness</span>
                            <span>{token.frame.thicknessMm}mm</span>
                          </label>
                          <input
                            type="range"
                            min={0.5}
                            max={5}
                            step={0.5}
                            value={token.frame.thicknessMm}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateToken(token.id, {
                                frame: {
                                  ...token.frame,
                                  thicknessMm: Number(e.target.value),
                                },
                              });
                            }}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Count */}
                <div>
                  <label className="mb-1 flex items-center justify-between text-xs text-slate-400">
                    <span>Print Count</span>
                    <span>x{token.count}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={token.count}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateToken(token.id, { count: parseInt(e.target.value) || 1 });
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
