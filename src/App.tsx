import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { CanvasArea } from './components/layout/CanvasArea.tsx';
import { ImagePositionModal } from './components/modals/ImagePositionModal.tsx';
import { ExportModal } from './components/modals/ExportModal.tsx';
import { GalleryUploadModal } from './components/modals/GalleryUploadModal.tsx';
import { ProjectManagerModal } from './components/modals/ProjectManagerModal.tsx';
import { AdminPanel } from './components/admin/AdminPanel.tsx';
import { AdSenseProvider } from './components/ads/AdSenseProvider.tsx';
import { CookieConsentBanner } from './components/ads/CookieConsentBanner.tsx';
import { AssetLibraryDrawer } from './components/library/AssetLibraryDrawer.tsx';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts.ts';
import { useStore } from './store/index.ts';

function EditorPage() {
  useKeyboardShortcuts();

  // Mark project dirty when tokens change
  useEffect(() => {
    let prevTokens = useStore.getState().tokens;
    const unsub = useStore.subscribe((state) => {
      if (state.tokens !== prevTokens) {
        prevTokens = state.tokens;
        if (state.currentProjectId && !state.projectDirty) {
          state.markDirty();
        }
      }
    });
    return unsub;
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <CanvasArea />
      <AssetLibraryDrawer />
      <ImagePositionModal />
      <ExportModal />
      <GalleryUploadModal />
      <ProjectManagerModal />
    </div>
  );
}

export default function App() {
  return (
    <AdSenseProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<EditorPage />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'bg-slate-800 text-slate-200',
            duration: 3000,
          }}
        />
        <CookieConsentBanner />
      </BrowserRouter>
    </AdSenseProvider>
  );
}
