import { AssetLibraryPanel } from '../panels/AssetLibraryPanel.tsx';
import { AdSlot } from '../ads/AdSlot.tsx';
import { AD_CONFIG } from '../ads/adConfig.ts';
import { useTranslation } from '../../i18n/useTranslation.ts';

export function AssetLibraryDrawer() {
  const { t } = useTranslation();

  return (
    <aside className="flex h-full w-72 flex-shrink-0 flex-col border-l border-slate-700 bg-slate-800">
      {/* Header */}
      <div className="flex items-center border-b border-slate-700 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-200">{t('assetLibrary.title')}</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AssetLibraryPanel />
      </div>

      {/* Ad slot */}
      <AdSlot
        slotId={AD_CONFIG.slots.sidebar}
        format="display"
        layout="fixed"
        width={280}
        height={250}
        className="flex-shrink-0 border-t border-slate-700 p-2"
      />
    </aside>
  );
}
