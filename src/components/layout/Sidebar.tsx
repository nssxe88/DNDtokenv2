import { useState } from 'react';
import { ImagePlus, CircleUser, Layers, Printer, Globe } from 'lucide-react';
import { UploadPanel } from '../panels/UploadPanel.tsx';
import { TokenListPanel } from '../panels/TokenListPanel.tsx';
import { OverlayPanel } from '../panels/OverlayPanel.tsx';
import { PrintSettingsPanel } from '../panels/PrintSettingsPanel.tsx';
import { GalleryPanel } from '../panels/GalleryPanel.tsx';
import { AdSlot } from '../ads/AdSlot.tsx';
import { AD_CONFIG } from '../ads/adConfig.ts';
import { useTranslation } from '../../i18n/useTranslation.ts';

type SidebarTab = 'upload' | 'tokens' | 'gallery' | 'overlays' | 'print';

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('upload');
  const { t } = useTranslation();

  const TABS: { id: SidebarTab; labelKey: string; icon: typeof ImagePlus }[] = [
    { id: 'upload', labelKey: 'sidebar.upload', icon: ImagePlus },
    { id: 'tokens', labelKey: 'sidebar.tokens', icon: CircleUser },
    { id: 'gallery', labelKey: 'sidebar.gallery', icon: Globe },
    { id: 'overlays', labelKey: 'sidebar.overlays', icon: Layers },
    { id: 'print', labelKey: 'sidebar.print', icon: Printer },
  ];

  return (
    <aside className="flex h-full w-80 flex-shrink-0 flex-col border-r border-slate-700 bg-slate-800">
      {/* Tab bar */}
      <div className="flex border-b border-slate-700">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 flex-col items-center gap-1 px-1.5 py-3 text-xs transition-colors ${
                isActive
                  ? 'border-b-2 border-primary-400 bg-slate-700/50 text-primary-400'
                  : 'text-slate-400 hover:bg-slate-700/30 hover:text-slate-200'
              }`}
            >
              <Icon size={16} />
              {t(tab.labelKey)}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'upload' && <UploadPanel />}
        {activeTab === 'tokens' && <TokenListPanel />}
        {activeTab === 'gallery' && <GalleryPanel />}
        {activeTab === 'overlays' && <OverlayPanel />}
        {activeTab === 'print' && <PrintSettingsPanel />}
      </div>

      {/* Sidebar ad slot */}
      <AdSlot
        slotId={AD_CONFIG.slots.sidebar}
        format="display"
        layout="fixed"
        width={300}
        height={250}
        className="flex-shrink-0 border-t border-slate-700 p-2"
      />
    </aside>
  );
}
