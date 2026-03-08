import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { CanvasArea } from './components/layout/CanvasArea.tsx';
import { ImagePositionModal } from './components/modals/ImagePositionModal.tsx';
import { ExportModal } from './components/modals/ExportModal.tsx';
import { GalleryUploadModal } from './components/modals/GalleryUploadModal.tsx';
import { AdminPanel } from './components/admin/AdminPanel.tsx';

function EditorPage() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <CanvasArea />
      <ImagePositionModal />
      <ExportModal />
      <GalleryUploadModal />
    </div>
  );
}

export default function App() {
  return (
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
    </BrowserRouter>
  );
}
