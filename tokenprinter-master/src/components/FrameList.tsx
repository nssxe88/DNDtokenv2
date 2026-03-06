import { useTokenStore } from '../store/tokenStore';
import { Copy, Trash2, Paintbrush } from 'lucide-react';
import { applyHueSaturation } from '../lib/imageProcessor';
import { useRef, useState } from 'react';

export const FrameList = () => {
    const { images, frames, duplicateFrame, removeFrame, updateFrame, setAllOverlayEnabled } = useTokenStore();
    const timeoutRefs = useRef<Record<string, number>>({});
    const [openSliders, setOpenSliders] = useState<Record<string, boolean>>({});

    const isAllOverlayEnabled = images.length > 0 && images.every(img => img.overlayEnabled);

    if (frames.length === 0) {
        return (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
                <p>No uploaded overlays.</p>
            </div>
        );
    }

    const handleSliderChange = (id: string, src: string, hue: number, saturation: number) => {
        // Immediate local state update for sliders
        updateFrame(id, { hue, saturation });

        // Debounce expensive image processing
        if (timeoutRefs.current[id]) {
            window.clearTimeout(timeoutRefs.current[id]);
        }

        timeoutRefs.current[id] = window.setTimeout(async () => {
            try {
                const newSaturatedSrc = await applyHueSaturation(src, hue, saturation);
                updateFrame(id, { saturatedSrc: newSaturatedSrc });
            } catch (e) {
                console.error("Filter apply error", e);
            }
        }, 300); // 300ms debounce
    };

    const handleAllToggle = (id: string) => {
        const isThisFrameActive = frames.find(f => f.id === id)?.checked;

        // Make this frame active
        frames.forEach(f => {
            if (f.id !== id && f.checked) updateFrame(f.id, { checked: false });
        });
        updateFrame(id, { checked: true });

        // Toggle global overlay only if it's already the active frame, otherwise turn on for all
        if (isThisFrameActive) {
            setAllOverlayEnabled(!isAllOverlayEnabled);
        } else {
            setAllOverlayEnabled(true);
        }
    };

    const handleOverlayToggle = (id: string) => {
        frames.forEach(f => {
            if (f.id !== id && f.checked) updateFrame(f.id, { checked: false });
        });
        updateFrame(id, { checked: true });
    };

    const toggleSliders = (id: string) => {
        setOpenSliders(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {frames.map((item) => (
                <div key={item.id} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0.5rem',
                    background: '#f8fafc',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    gap: '0.5rem',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img
                            src={item.saturatedSrc || item.processedSrc}
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
                                    title="Color Settings (Hue/Sat)"
                                    onClick={() => toggleSliders(item.id)}
                                    style={{ color: openSliders[item.id] ? '#eab308' : 'inherit', padding: '0.25rem' }}>
                                    <Paintbrush size={14} />
                                </button>

                                <div style={{ width: '1px', background: 'var(--color-border)', height: '14px', margin: '0 0.25rem' }} />

                                <button
                                    className="btn"
                                    title="Apply to all tokens"
                                    onClick={() => handleAllToggle(item.id)}
                                    style={{ flex: 1, padding: '0.25rem 0.5rem', backgroundColor: (item.checked && isAllOverlayEnabled) ? '#eab308' : 'white', border: '1px solid var(--color-border)', color: (item.checked && isAllOverlayEnabled) ? 'white' : 'var(--color-text-main)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                    Overlay ALL
                                </button>
                                <button
                                    className="btn"
                                    title="Activate as selectable overlay"
                                    onClick={() => handleOverlayToggle(item.id)}
                                    style={{ flex: 1, padding: '0.25rem 0.5rem', backgroundColor: (item.checked && !isAllOverlayEnabled) ? '#eab308' : 'white', border: '1px solid var(--color-border)', color: (item.checked && !isAllOverlayEnabled) ? 'white' : 'var(--color-text-main)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                    Overlay
                                </button>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.2rem', flexShrink: 0 }}>
                            <button className="btn-icon" onClick={() => duplicateFrame(item.id)} style={{ color: 'var(--color-success)', padding: '0.25rem' }} title="Duplicate">
                                <Copy size={16} />
                            </button>
                            <button className="btn-icon" onClick={() => removeFrame(item.id)} style={{ color: 'var(--color-danger)', padding: '0.25rem' }} title="Delete">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    {openSliders[item.id] && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', background: 'white', padding: '0.5rem', borderRadius: '4px', border: '1px solid #e2e8f0', marginTop: '0.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '25px', color: 'var(--color-text-muted)' }}>Hue</span>
                                <input
                                    type="range"
                                    min="-180"
                                    max="180"
                                    value={item.hue || 0}
                                    onChange={(e) => handleSliderChange(item.id, item.processedSrc, Number(e.target.value), item.saturation || 100)}
                                    style={{ flex: 1 }}
                                />
                                <span style={{ width: '35px', textAlign: 'right', color: 'var(--color-text-muted)' }}>{item.hue || 0}°</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ width: '25px', color: 'var(--color-text-muted)' }}>Sat</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="200"
                                    value={item.saturation || 100}
                                    onChange={(e) => handleSliderChange(item.id, item.processedSrc, item.hue || 0, Number(e.target.value))}
                                    style={{ flex: 1 }}
                                />
                                <span style={{ width: '35px', textAlign: 'right', color: 'var(--color-text-muted)' }}>{item.saturation || 100}%</span>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
