import { Sidebar } from './components/layout/Sidebar.tsx';
import { CanvasArea } from './components/layout/CanvasArea.tsx';
import { ImagePositionModal } from './components/modals/ImagePositionModal.tsx';

export default function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar />
      <CanvasArea />
      <ImagePositionModal />
    </div>
  );
}
