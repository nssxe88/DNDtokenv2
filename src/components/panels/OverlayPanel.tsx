import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, Trash2, ImagePlus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../../store/index.ts';
import type { OverlayAsset } from '../../types/index.ts';
import {
  getOverlays,
  addOverlayAsset,
  removeOverlayAsset,
  subscribeOverlays,
} from '../../services/overlayStore.ts';
import { useTranslation } from '../../i18n/useTranslation.ts';

function useOverlayAssets() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    return subscribeOverlays(() => forceUpdate((n) => n + 1));
  }, []);

  return {
    overlays: getOverlays(),
    addOverlay: addOverlayAsset,
    removeOverlay: removeOverlayAsset,
  };
}

export function OverlayPanel() {
  const { t } = useTranslation();
  const updateToken = useStore((s) => s.updateToken);
  const selectedTokenIds = useStore((s) => s.selectedTokenIds);
  const tokens = useStore((s) => s.tokens);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { overlays, addOverlay, removeOverlay } = useOverlayAssets();

  const selectedToken = tokens.find((tk) => selectedTokenIds.includes(tk.id));

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        if (src) {
          const overlay: OverlayAsset = {
            id: uuidv4(),
            src,
            processedSrc: src,
            name: file.name,
            category: 'frame',
            source: 'user-upload',
            hue: 0,
            saturation: 100,
            opacity: 1,
          };
          addOverlay(overlay);
        }
      };
      reader.readAsDataURL(file);
    },
    [addOverlay]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(processFile);
      e.target.value = '';
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) {
        Array.from(e.dataTransfer.files).forEach(processFile);
      }
    },
    [processFile]
  );

  const applyOverlay = (overlayId: string) => {
    if (selectedToken) {
      updateToken(selectedToken.id, { overlayId });
    }
  };

  const removeOverlayFromToken = () => {
    if (selectedToken) {
      updateToken(selectedToken.id, { overlayId: null });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-200">{t('overlay.title')}</h3>

      {/* Upload overlay zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-4 transition-colors ${
          isDragging
            ? 'border-primary-400 bg-primary-400/10'
            : 'border-slate-600 hover:border-slate-500'
        }`}
      >
        {isDragging ? (
          <Upload size={20} className="text-primary-400" />
        ) : (
          <ImagePlus size={20} className="text-slate-400" />
        )}
        <p className="text-xs text-slate-400">{t('overlay.uploadOverlay')}</p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Current token overlay info */}
      {selectedToken && (
        <div className="rounded-lg border border-slate-700 bg-slate-700/30 p-3">
          <p className="text-xs text-slate-400">
            {t('overlay.selected', { name: selectedToken.fileName })}
          </p>
          {selectedToken.overlayId && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">{t('overlay.overlayApplied')}</span>
                <button
                  onClick={removeOverlayFromToken}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  {t('overlay.remove')}
                </button>
              </div>
              <div>
                <label className="flex items-center justify-between text-xs text-slate-500">
                  <span>{t('overlay.opacity')}</span>
                  <span>{Math.round(selectedToken.overlayOpacity * 100)}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(selectedToken.overlayOpacity * 100)}
                  onChange={(e) =>
                    updateToken(selectedToken.id, {
                      overlayOpacity: Number(e.target.value) / 100,
                    })
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overlay grid */}
      {overlays.length > 0 && (
        <div>
          <p className="mb-2 text-xs text-slate-400">
            {t('overlay.clickToApply')}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {overlays.map((overlay) => (
              <div
                key={overlay.id}
                onClick={() => applyOverlay(overlay.id)}
                className={`group relative cursor-pointer overflow-hidden rounded-lg border transition-colors ${
                  selectedToken?.overlayId === overlay.id
                    ? 'border-primary-500'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
              >
                <img
                  src={overlay.src}
                  alt={overlay.name}
                  className="aspect-square w-full object-contain bg-slate-700/50 p-1"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOverlay(overlay.id);
                  }}
                  className="absolute right-1 top-1 hidden rounded bg-red-500/80 p-0.5 group-hover:block"
                >
                  <Trash2 size={10} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {overlays.length === 0 && (
        <p className="text-xs text-slate-500">
          {t('overlay.noOverlays')}
        </p>
      )}
    </div>
  );
}
