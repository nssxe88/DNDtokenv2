import { Toaster } from 'react-hot-toast';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { CanvasArea } from './components/layout/CanvasArea.tsx';
import { ImagePositionModal } from './components/modals/ImagePositionModal.tsx';
import { ExportModal } from './components/modals/ExportModal.tsx';

export default function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <CanvasArea />
      <ImagePositionModal />
      <ExportModal />
      <Toaster
        position="bottom-right"
        toastOptions={{
          className: 'bg-slate-800 text-slate-200',
          duration: 3000,
        }}
      />
    </div>
  );
}
