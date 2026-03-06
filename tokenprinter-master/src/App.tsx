import { useState } from 'react';
import './App.css';
import { useTokenStore } from './store/tokenStore';
import { UploadPanel } from './components/UploadPanel';
import { TokenList } from './components/TokenList';
import { PrintPreview } from './components/PrintPreview';
import { generatePDF } from './lib/pdfExporter';
import { FrameList } from './components/FrameList';
import { Printer, Download, Scissors, Square, Layers, Image as ImageIcon } from 'lucide-react';
import { TokenSaveModal } from './components/TokenSaveModal';
import logoUrl from '../public/jbkr2.png';

function App() {
  const { images, frames, settings, presets, updateSettings, setAllCropEnabled, setAllFrameEnabled } = useTokenStore();
  const [activeTab, setActiveTab] = useState<'tokens' | 'frames' | 'settings'>('tokens');
  const [showSaveModal, setShowSaveModal] = useState(false);

  const isAllCropEnabled = images.length > 0 && images.every(img => img.cropEnabled);
  const isAllFrameEnabled = images.length > 0 && images.every(img => img.frameEnabled);

  const handlePrintPDF = async () => {
    try {
      await generatePDF(images, frames, settings, presets);
    } catch (err: any) {
      alert(err.message || "Error generating PDF!");
    }
  };

  return (
    <div className="app-container">
      {/* Left Sidebar - Controls */}
      <div className="glass-panel sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRadius: 'var(--radius-lg) 0 0 var(--radius-lg)', borderRight: 'none', width: '520px', flexShrink: 0 }}>

        {/* Fixed Top Section */}
        <div style={{ padding: '1.5rem', flex: 'none', display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--color-border)', paddingBottom: '0' }}>

          <div style={{ marginBottom: '20px' }}>
            <UploadPanel />
          </div>

          {/* Global Modules */}
          <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', marginBottom: '10px' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <button
                className="btn"
                title="Crop All"
                onClick={() => setAllCropEnabled(!isAllCropEnabled)}
                style={{ flex: 1, padding: '0.4rem', backgroundColor: isAllCropEnabled ? '#eab308' : 'white', border: '1px solid var(--color-border)', color: isAllCropEnabled ? 'white' : 'var(--color-text-main)' }}>
                <Scissors size={18} />
              </button>
              <button
                className="btn"
                title="Frame All"
                onClick={() => setAllFrameEnabled(!isAllFrameEnabled)}
                style={{ flex: 1, padding: '0.4rem', backgroundColor: isAllFrameEnabled ? '#eab308' : 'white', border: '1px solid var(--color-border)', color: isAllFrameEnabled ? 'white' : 'var(--color-text-main)' }}>
                <Square size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.65rem', marginBottom: '0.2rem' }}>Shape</label>
                <select className="form-input" style={{ padding: '0.25rem 0.4rem', fontSize: '0.75rem' }} value={settings.frameShape} onChange={(e) => updateSettings({ frameShape: e.target.value as 'circle' | 'square' })}>
                  <option value="circle">Circle</option>
                  <option value="square">Square</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.65rem', marginBottom: '0.2rem', whiteSpace: 'nowrap' }}>CUT frame (mm)</label>
                <input type="number" min="0" className="form-input" style={{ padding: '0.25rem 0.4rem', fontSize: '0.75rem' }} value={settings.cutFrameMm} onChange={(e) => updateSettings({ cutFrameMm: Math.max(0, Number(e.target.value)) })} step="0.5" />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.65rem', marginBottom: '0.2rem', whiteSpace: 'nowrap' }}>Frame (mm)</label>
                <input type="number" min="0" className="form-input" style={{ padding: '0.25rem 0.4rem', fontSize: '0.75rem' }} value={settings.frameMm} onChange={(e) => updateSettings({ frameMm: Math.max(0, Number(e.target.value)) })} step="0.5" />
              </div>
              <div className="form-group" style={{ flex: 0.8, marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.65rem', marginBottom: '0.2rem' }}>Color</label>
                <input type="color" className="form-input" style={{ padding: '0', height: '26px', width: '100%', cursor: 'pointer' }} value={settings.frameColor} onChange={(e) => updateSettings({ frameColor: e.target.value })} />
              </div>
              <div className="form-group" style={{ flex: 0.8, marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.65rem', marginBottom: '0.2rem', whiteSpace: 'nowrap' }}>Token Size</label>
                <select className="form-input" style={{ padding: '0.25rem 0.4rem', fontSize: '0.75rem' }} value={settings.unit} onChange={(e) => updateSettings({ unit: e.target.value as any })}>
                  <option value="mm">mm</option>
                  <option value="inch">inch</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '-1px' }}>
            <button onClick={() => setActiveTab('tokens')} style={{ flex: 1, padding: '0.75rem 0', background: activeTab === 'tokens' ? 'white' : '#f1f5f9', border: '1px solid var(--color-border)', borderBottom: activeTab === 'tokens' ? '2px solid white' : '1px solid var(--color-border)', borderRadius: '6px 6px 0 0', cursor: 'pointer', fontWeight: activeTab === 'tokens' ? 'bold' : 'normal' }}>
              <ImageIcon size={14} style={{ display: 'inline', marginRight: 4, position: 'relative', top: '2px' }} /> Tokens
            </button>
            <button onClick={() => setActiveTab('frames')} style={{ flex: 1, padding: '0.75rem 0', background: activeTab === 'frames' ? 'white' : '#f1f5f9', border: '1px solid var(--color-border)', borderBottom: activeTab === 'frames' ? '2px solid white' : '1px solid var(--color-border)', borderRadius: '6px 6px 0 0', cursor: 'pointer', fontWeight: activeTab === 'frames' ? 'bold' : 'normal' }}>
              <Layers size={14} style={{ display: 'inline', marginRight: 4, position: 'relative', top: '2px' }} /> Overlays
            </button>
            <button onClick={() => setActiveTab('settings')} style={{ flex: 1, padding: '0.75rem 0', background: activeTab === 'settings' ? 'white' : '#f1f5f9', border: '1px solid var(--color-border)', borderBottom: activeTab === 'settings' ? '2px solid white' : '1px solid var(--color-border)', borderRadius: '6px 6px 0 0', cursor: 'pointer', fontWeight: activeTab === 'settings' ? 'bold' : 'normal' }}>
              <Printer size={14} style={{ display: 'inline', marginRight: 4, position: 'relative', top: '2px' }} /> Print Settings
            </button>
          </div>
        </div>

        {/* Scrollable List Section */}
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '10px 1.5rem 1.5rem 1.5rem', background: 'white' }}>
          {activeTab === 'tokens' && <TokenList />}
          {activeTab === 'frames' && <FrameList />}
          {activeTab === 'settings' && (
            <div style={{ padding: '1.25rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <h2 style={{ fontSize: '1rem', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Printer size={18} /> Print Constraints
              </h2>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Paper Size</label>
                  <select
                    className="form-input"
                    value={settings.paperSize}
                    onChange={(e) => updateSettings({ paperSize: e.target.value as any })}
                  >
                    <option value="a4">A4 (210×297 mm)</option>
                    <option value="letter">US Letter (216×279 mm)</option>
                    <option value="a3">A3 (297×420 mm)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Gap between tokens</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="number" min="0" className="form-input" value={settings.spacing} onChange={(e) => updateSettings({ spacing: Math.max(0, Number(e.target.value)) })} step="0.5" />
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>mm</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Page Margin (mm)</label>
                  <input type="number" min="0" className="form-input" value={settings.margins} onChange={(e) => updateSettings({ margins: Math.max(0, Number(e.target.value)) })} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Content - Preview */}
      <div className="glass-panel main-content" style={{ borderRadius: '0 var(--radius-lg) var(--radius-lg) 0', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-primary)', flexShrink: 0 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 1 }}>
            <img src={logoUrl} alt="Fantasy Token Printer Logo" style={{ maxHeight: '120px', maxWidth: '100%', objectFit: 'contain' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'white', backgroundColor: 'rgba(0,0,0,0.2)', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>v5.6</span>
          </div>



          <div style={{ display: 'flex', gap: '0.75rem', zIndex: 1 }}>
            <button className="btn" onClick={() => setShowSaveModal(true)} style={{ backgroundColor: '#10b981', color: 'white', border: '1px solid #059669', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <Download size={18} />
              Save PNGs
            </button>
            <button className="btn btn-success" onClick={handlePrintPDF} style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <Printer size={18} />
              Print PDF
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <PrintPreview />
        </div>
      </div>

      {showSaveModal && <TokenSaveModal onClose={() => setShowSaveModal(false)} />}
    </div>
  );
}

export default App;
