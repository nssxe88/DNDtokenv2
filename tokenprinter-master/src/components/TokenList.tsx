import { useTokenStore } from '../store/tokenStore';
import { Copy, Trash2, Scissors, Square, Palette, Layers } from 'lucide-react';
import { roundMm } from '../lib/imageProcessor';

export const TokenList = () => {
    const { images, duplicateImage, removeImage, updateImage, presets, settings } = useTokenStore();

    if (images.length === 0) {
        return (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
                <p>No uploaded tokens.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {images.map((item) => (
                <div key={item.id} style={{
                    display: 'flex',
                    padding: '0.5rem',
                    background: '#f8fafc',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    gap: '0.5rem',
                    alignItems: 'center'
                }}>
                    <img
                        src={item.src}
                        alt={item.name}
                        style={{ width: '40px', height: '40px', objectFit: 'contain', border: '1px solid #cbd5e0', borderRadius: '4px', background: 'white', flexShrink: 0 }}
                    />

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                            {item.name}
                        </div>

                        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexWrap: 'nowrap' }}>
                            <button
                                className="btn-icon"
                                title="Crop (Local)"
                                onClick={() => updateImage(item.id, { cropEnabled: !item.cropEnabled })}
                                style={{ color: item.cropEnabled ? '#eab308' : 'inherit', padding: '0.25rem' }}>
                                <Scissors size={14} />
                            </button>
                            <button
                                className="btn-icon"
                                title="Frame (Local)"
                                onClick={() => updateImage(item.id, { frameEnabled: !item.frameEnabled })}
                                style={{ color: item.frameEnabled ? '#eab308' : 'inherit', padding: '0.25rem' }}>
                                <Square size={14} />
                            </button>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <button
                                    className="btn-icon"
                                    title="Custom Frame Color"
                                    onClick={() => updateImage(item.id, { colorEnabled: !item.colorEnabled })}
                                    style={{ color: item.colorEnabled ? '#eab308' : 'inherit', padding: '0.25rem' }}>
                                    <Palette size={14} />
                                </button>
                                {item.colorEnabled && (
                                    <input
                                        title="Select Color"
                                        type="color"
                                        value={item.frameColor || settings.frameColor || '#000000'}
                                        onChange={(e) => updateImage(item.id, { frameColor: e.target.value })}
                                        style={{ width: '14px', height: '14px', padding: 0, border: 'none', cursor: 'pointer', borderRadius: '2px' }}
                                    />
                                )}
                            </div>

                            <button
                                className="btn-icon"
                                title="Custom Overlay"
                                onClick={() => updateImage(item.id, { overlayEnabled: !item.overlayEnabled })}
                                style={{ color: item.overlayEnabled ? '#eab308' : 'inherit', padding: '0.25rem' }}>
                                <Layers size={14} />
                            </button>

                            <div style={{ width: '1px', background: 'var(--color-border)', height: '14px', margin: '0 0.25rem' }} />

                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <input
                                    type="number"
                                    className="form-input"
                                    style={{ padding: '0.15rem', width: '50px', fontSize: '0.7rem' }}
                                    min={0.1}
                                    step={settings.unit === 'inch' ? 0.1 : 1}
                                    value={
                                        settings.unit === 'inch'
                                            ? Number(((item.manualSizeMm !== null ? item.manualSizeMm : presets['medium']) / 25.4).toFixed(2))
                                            : roundMm(item.manualSizeMm !== null ? item.manualSizeMm : presets['medium'])
                                    }
                                    onChange={(e) => {
                                        const val = Math.max(0.1, Number(e.target.value) || 0.1);
                                        const mmVal = settings.unit === 'inch' ? val * 25.4 : val;
                                        updateImage(item.id, { manualSizeMm: mmVal });
                                    }}
                                />
                                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>{settings.unit}</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                <input
                                    type="number"
                                    className="form-input"
                                    style={{ padding: '0.15rem', width: '40px', fontSize: '0.7rem' }}
                                    min={1}
                                    max={999}
                                    value={item.count}
                                    onChange={(e) => updateImage(item.id, { count: Math.max(1, parseInt(e.target.value) || 1) })}
                                />
                                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>pcs</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.2rem', flexShrink: 0 }}>
                        <button className="btn-icon" onClick={() => duplicateImage(item.id)} style={{ color: 'var(--color-success)', padding: '0.25rem' }} title="Duplicate">
                            <Copy size={16} />
                        </button>
                        <button className="btn-icon" onClick={() => removeImage(item.id)} style={{ color: 'var(--color-danger)', padding: '0.25rem' }} title="Delete">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
