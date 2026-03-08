import { useState } from 'react';
import { ImagePlus, CircleUser, Layers, Printer, BookOpen, Globe } from 'lucide-react';
import { UploadPanel } from '../panels/UploadPanel.tsx';
import { TokenListPanel } from '../panels/TokenListPanel.tsx';
import { OverlayPanel } from '../panels/OverlayPanel.tsx';
import { PrintSettingsPanel } from '../panels/PrintSettingsPanel.tsx';
import { AssetLibraryPanel } from '../panels/AssetLibraryPanel.tsx';
import { GalleryPanel } from '../panels/GalleryPanel.tsx';

type SidebarTab = 'upload' | 'tokens' | 'library' | 'gallery' | 'overlays' | 'print';

const TABS: { id: SidebarTab; label: string; icon: typeof ImagePlus }[] = [
  { id: 'upload', label: 'Upload', icon: ImagePlus },
  { id: 'tokens', label: 'Tokens', icon: CircleUser },
  { id: 'library', label: 'Library', icon: BookOpen },
  { id: 'gallery', label: 'Gallery', icon: Globe },
  { id: 'overlays', label: 'Overlays', icon: Layers },
  { id: 'print', label: 'Print', icon: Printer },
];

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('upload');

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
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'upload' && <UploadPanel />}
        {activeTab === 'tokens' && <TokenListPanel />}
        {activeTab === 'library' && <AssetLibraryPanel />}
        {activeTab === 'gallery' && <GalleryPanel />}
        {activeTab === 'overlays' && <OverlayPanel />}
        {activeTab === 'print' && <PrintSettingsPanel />}
      </div>
    </aside>
  );
}
