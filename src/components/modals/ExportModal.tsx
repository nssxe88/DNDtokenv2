import { useState } from 'react';
import { X, FileText, Image, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/index.ts';
import { generatePDF } from '../../services/pdfExporter.ts';
import { exportTokensAsZip, type PNGResolution } from '../../services/pngExporter.ts';
import type { PrintSettings } from '../../types/index.ts';
import { AdSlot } from '../ads/AdSlot.tsx';
import { AD_CONFIG } from '../ads/adConfig.ts';

type TabType = 'pdf' | 'png';

interface ExportProgress {
  current: number;
  total: number;
}

export function ExportModal() {
  const exportModalOpen = useStore((state) => state.exportModalOpen);
  const closeExportModal = useStore((state) => state.closeExportModal);
  const tokens = useStore((state) => state.tokens);
  const libraryAssets = useStore((state) => state.libraryAssets);

  // Print settings from store
  const paperSize = useStore((state) => state.paperSize);
  const customPaperSize = useStore((state) => state.customPaperSize);
  const orientation = useStore((state) => state.orientation);
  const margins = useStore((state) => state.margins);
  const spacing = useStore((state) => state.spacing);
  const unit = useStore((state) => state.unit);
  const cutMarks = useStore((state) => state.cutMarks);
  const bleed = useStore((state) => state.bleed);

  const toggleCutMarks = useStore((state) => state.toggleCutMarks);
  const setBleed = useStore((state) => state.setBleed);

  const [activeTab, setActiveTab] = useState<TabType>('pdf');
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);

  // PNG export settings
  const [pngResolution, setPngResolution] = useState<PNGResolution>(1024);
  const [transparentBg, setTransparentBg] = useState(true);

  if (!exportModalOpen) return null;

  const printSettings: PrintSettings = {
    paperSize,
    customPaperSize,
    orientation,
    margins,
    spacing,
    unit,
    cutMarks,
    bleed,
  };

  const visibleTokenCount = tokens.filter((t) => t.visible).length;
  const totalTokenCopies = tokens
    .filter((t) => t.visible)
    .reduce((sum, t) => sum + t.count, 0);

  const handlePDFExport = async () => {
    if (visibleTokenCount === 0) {
      toast.error('Nincsenek látható tokenek az exportáláshoz');
      return;
    }

    setExporting(true);
    setProgress({ current: 0, total: totalTokenCopies });

    try {
      await generatePDF({
        tokens,
        printSettings,
        libraryAssets,
        onProgress: (current, total) => {
          setProgress({ current, total });
        },
      });

      toast.success('PDF sikeresen létrehozva!');
      closeExportModal();
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Hiba történt a PDF létrehozása során'
      );
    } finally {
      setExporting(false);
      setProgress(null);
    }
  };

  const handlePNGExport = async () => {
    if (visibleTokenCount === 0) {
      toast.error('Nincsenek látható tokenek az exportáláshoz');
      return;
    }

    setExporting(true);
    setProgress({ current: 0, total: totalTokenCopies });

    try {
      await exportTokensAsZip({
        tokens,
        resolution: pngResolution,
        transparent: transparentBg,
        libraryAssets,
        onProgress: (current, total) => {
          setProgress({ current, total });
        },
      });

      toast.success('ZIP fájl sikeresen letöltve!');
      closeExportModal();
    } catch (error) {
      console.error('PNG export error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Hiba történt a PNG exportálás során'
      );
    } finally {
      setExporting(false);
      setProgress(null);
    }
  };

  const getPaperSizeLabel = (): string => {
    if (paperSize === 'custom' && customPaperSize) {
      return `Egyedi (${customPaperSize.width} x ${customPaperSize.height} mm)`;
    }
    return paperSize.toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-lg w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-slate-200">Exportálás</h2>
          <button
            onClick={closeExportModal}
            disabled={exporting}
            className="text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Bezárás"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('pdf')}
            disabled={exporting}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
              activeTab === 'pdf'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              <span>PDF Nyomtatás</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('png')}
            disabled={exporting}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
              activeTab === 'png'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Image className="w-4 h-4" />
              <span>PNG Képek</span>
            </div>
          </button>
        </div>

        {/* Tab Content */}
        <div className="px-6 py-4">
          {activeTab === 'pdf' ? (
            <div className="space-y-4">
              {/* Print Settings Summary */}
              <div className="bg-slate-700 rounded-md p-4 space-y-2">
                <h3 className="text-sm font-medium text-slate-300 mb-2">
                  Nyomtatási beállítások
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-slate-400">Papír méret:</div>
                  <div className="text-slate-200">{getPaperSizeLabel()}</div>

                  <div className="text-slate-400">Tájolás:</div>
                  <div className="text-slate-200">
                    {orientation === 'portrait' ? 'Álló' : 'Fekvő'}
                  </div>

                  <div className="text-slate-400">Margók:</div>
                  <div className="text-slate-200">{margins} mm</div>

                  <div className="text-slate-400">Távolság:</div>
                  <div className="text-slate-200">{spacing} mm</div>
                </div>
              </div>

              {/* Cut Marks Toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cutMarks}
                  onChange={toggleCutMarks}
                  disabled={exporting}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-sm text-slate-300">
                  Vágójelek megjelenítése
                </span>
              </label>

              {/* Bleed Input */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Margó túlnyúlás (bleed)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={bleed}
                    onChange={(e) => setBleed(Number(e.target.value))}
                    disabled={exporting}
                    min={0}
                    max={10}
                    step={0.5}
                    className="w-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm text-slate-400">mm</span>
                </div>
              </div>

              {/* Token Count Info */}
              <div className="text-sm text-slate-400">
                Tokenek száma: {visibleTokenCount} ({totalTokenCopies} példány)
              </div>

              {/* Progress */}
              {exporting && progress && (
                <div className="bg-slate-700 rounded-md p-3">
                  <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      Token renderelése: {progress.current} / {progress.total}
                    </span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(progress.current / progress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Resolution Selector */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Felbontás (px)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {([256, 512, 1024, 2048] as const).map((res) => (
                    <button
                      key={res}
                      onClick={() => setPngResolution(res)}
                      disabled={exporting}
                      className={`px-3 py-2 text-sm rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        pngResolution === res
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      {res}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transparent Background Toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={transparentBg}
                  onChange={(e) => setTransparentBg(e.target.checked)}
                  disabled={exporting}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <span className="text-sm text-slate-300">
                  Átlátszó háttér
                </span>
              </label>

              {/* Token Count Info */}
              <div className="text-sm text-slate-400">
                Tokenek száma: {visibleTokenCount} ({totalTokenCopies} fájl)
              </div>

              {/* File Size Estimate (PNG compression ~80-90% reduction) */}
              <div className="bg-slate-700 rounded-md p-3 text-sm text-slate-400">
                Becsült fájlméret: ~{Math.max(1, Math.ceil((totalTokenCopies * pngResolution * pngResolution) / 1024 / 1024 / 2))} MB
              </div>

              {/* Progress */}
              {exporting && progress && (
                <div className="bg-slate-700 rounded-md p-3">
                  <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      Token exportálása: {progress.current} / {progress.total}
                    </span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(progress.current / progress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ad banner */}
        <AdSlot
          slotId={AD_CONFIG.slots.export}
          format="display"
          layout="fixed"
          width={728}
          height={90}
          className="flex justify-center px-6 py-2"
        />

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700">
          <button
            onClick={closeExportModal}
            disabled={exporting}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mégse
          </button>
          <button
            onClick={activeTab === 'pdf' ? handlePDFExport : handlePNGExport}
            disabled={exporting || visibleTokenCount === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {exporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Exportálás...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>
                  {activeTab === 'pdf' ? 'PDF Generálás' : 'ZIP Letöltés'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
