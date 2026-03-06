import { useEffect, useMemo, useCallback } from 'react';
import { Search, BookOpen, Sparkles, X } from 'lucide-react';
import { useStore } from '../../store/index.ts';
import { sanitizeAssetPath } from '../../services/assetLoader.ts';
import type { LibraryAsset, LibraryCategory } from '../../types/index.ts';

const CATEGORY_TABS: { id: LibraryCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'frame', label: 'Frames' },
  { id: 'border', label: 'Borders' },
  { id: 'texture', label: 'Textures' },
  { id: 'icon', label: 'Icons' },
  { id: 'ring', label: 'Rings' },
];

function AssetThumbnail({ asset, isApplied, onApply }: {
  asset: LibraryAsset;
  isApplied: boolean;
  onApply: (assetId: string) => void;
}) {
  const thumbnailUrl = `/assets/${sanitizeAssetPath(asset.thumbnail)}`;

  return (
    <button
      onClick={() => onApply(asset.id)}
      className={`group relative flex flex-col items-center overflow-hidden rounded-lg border transition-all ${
        isApplied
          ? 'border-primary-500 ring-1 ring-primary-500/50 bg-primary-500/10'
          : 'border-slate-600 hover:border-slate-400 bg-slate-700/30 hover:bg-slate-700/60'
      }`}
      title={asset.name}
    >
      <div className="flex aspect-square w-full items-center justify-center p-1.5">
        <img
          src={thumbnailUrl}
          alt={asset.name}
          className="h-full w-full object-contain"
          loading="lazy"
        />
      </div>
      <span className="w-full truncate px-1 pb-1 text-center text-[10px] text-slate-400 group-hover:text-slate-200">
        {asset.name}
      </span>
    </button>
  );
}

export function AssetLibraryPanel() {
  const loadLibrary = useStore((s) => s.loadLibrary);
  const libraryLoaded = useStore((s) => s.libraryLoaded);
  const libraryLoading = useStore((s) => s.libraryLoading);
  const libraryError = useStore((s) => s.libraryError);
  const librarySearchQuery = useStore((s) => s.librarySearchQuery);
  const libraryActiveCategory = useStore((s) => s.libraryActiveCategory);
  const setLibrarySearchQuery = useStore((s) => s.setLibrarySearchQuery);
  const setLibraryActiveCategory = useStore((s) => s.setLibraryActiveCategory);
  const getFilteredAssets = useStore((s) => s.getFilteredAssets);
  const selectedTokenIds = useStore((s) => s.selectedTokenIds);
  const tokens = useStore((s) => s.tokens);
  const updateToken = useStore((s) => s.updateToken);
  const preloadAssetById = useStore((s) => s.preloadAssetById);

  const selectedToken = useMemo(
    () => tokens.find((t) => selectedTokenIds.includes(t.id)),
    [tokens, selectedTokenIds]
  );

  // getFilteredAssets internally reads librarySearchQuery and libraryActiveCategory
  // from the store, so the deps below ensure recalculation when they change
  const libraryAssets = useStore((s) => s.libraryAssets);
  const filteredAssets = useMemo(
    () => getFilteredAssets(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [libraryAssets, librarySearchQuery, libraryActiveCategory]
  );

  useEffect(() => {
    if (!libraryLoaded && !libraryLoading) {
      loadLibrary();
    }
  }, [libraryLoaded, libraryLoading, loadLibrary]);

  const handleApplyAsset = useCallback(
    (assetId: string) => {
      if (!selectedToken) return;

      // Toggle: if same asset is already applied, remove it
      if (selectedToken.frame.libraryAssetId === assetId) {
        updateToken(selectedToken.id, {
          frame: { ...selectedToken.frame, libraryAssetId: null },
        });
        return;
      }

      preloadAssetById(assetId);
      updateToken(selectedToken.id, {
        frame: { ...selectedToken.frame, libraryAssetId: assetId },
      });
    },
    [selectedToken, updateToken, preloadAssetById]
  );

  const handleRemoveAsset = useCallback(() => {
    if (!selectedToken) return;
    updateToken(selectedToken.id, {
      frame: { ...selectedToken.frame, libraryAssetId: null },
    });
  }, [selectedToken, updateToken]);

  if (libraryLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-500 border-t-primary-400" />
        <p className="text-xs text-slate-400">Loading asset library...</p>
      </div>
    );
  }

  if (libraryError) {
    return (
      <div className="space-y-3 py-8 text-center">
        <p className="text-xs text-red-400">{libraryError}</p>
        <button
          onClick={() => loadLibrary()}
          className="rounded bg-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <BookOpen size={16} className="text-primary-400" />
        <h3 className="text-sm font-semibold text-slate-200">Asset Library</h3>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search assets..."
          value={librarySearchQuery}
          onChange={(e) => setLibrarySearchQuery(e.target.value)}
          className="w-full rounded-lg border border-slate-600 bg-slate-700/50 py-1.5 pl-8 pr-8 text-xs text-slate-200 placeholder:text-slate-500 focus:border-primary-500 focus:outline-none"
        />
        {librarySearchQuery && (
          <button
            onClick={() => setLibrarySearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setLibraryActiveCategory(tab.id)}
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium transition-colors ${
              libraryActiveCategory === tab.id
                ? 'bg-primary-500/20 text-primary-400'
                : 'bg-slate-700/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Selected token info */}
      {!selectedToken && (
        <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-700/20 p-2.5">
          <Sparkles size={14} className="text-slate-500" />
          <p className="text-[11px] text-slate-400">
            Select a token to apply assets
          </p>
        </div>
      )}

      {/* Applied asset indicator */}
      {selectedToken?.frame.libraryAssetId && (
        <div className="flex items-center justify-between rounded-lg border border-primary-500/30 bg-primary-500/10 px-2.5 py-1.5">
          <span className="text-[11px] text-primary-300">
            Asset applied: {filteredAssets.find((a) => a.id === selectedToken.frame.libraryAssetId)?.name ?? selectedToken.frame.libraryAssetId}
          </span>
          <button
            onClick={handleRemoveAsset}
            className="text-primary-400 hover:text-primary-300"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Asset grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {filteredAssets.map((asset) => (
          <AssetThumbnail
            key={asset.id}
            asset={asset}
            isApplied={selectedToken?.frame.libraryAssetId === asset.id}
            onApply={handleApplyAsset}
          />
        ))}
      </div>

      {filteredAssets.length === 0 && libraryLoaded && (
        <p className="py-6 text-center text-xs text-slate-500">
          {librarySearchQuery ? 'No assets match your search' : 'No assets in this category'}
        </p>
      )}

      {/* Stats */}
      {libraryLoaded && (
        <p className="text-center text-[10px] text-slate-600">
          {filteredAssets.length} asset{filteredAssets.length !== 1 ? 's' : ''}
          {libraryActiveCategory !== 'all' && ` in ${libraryActiveCategory}`}
        </p>
      )}
    </div>
  );
}
