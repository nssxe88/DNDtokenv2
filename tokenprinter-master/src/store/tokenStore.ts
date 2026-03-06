import { create } from 'zustand';

export interface ImageItem {
    id: string;
    originalSrc: string;
    src: string;
    name: string;
    preset: string; // The selected preset key
    manualSizeMm: number | null; // If not null, overrides preset
    count: number;
    selected: boolean;
    // Local overrides (if true, overrides global behaviour for this token)
    cropEnabled: boolean;
    frameEnabled: boolean;
    colorEnabled: boolean;
    frameColor: string | null;
    overlayEnabled: boolean;
}

export interface FrameItem {
    id: string;
    src: string;
    processedSrc: string;
    saturatedSrc: string;
    saturation: number;
    hue: number;
    name: string;
    useForAll: boolean;
    checked: boolean;
}

export interface PrintSettings {
    paperSize: 'a4' | 'letter' | 'a3' | 'a5';
    margins: number; // in mm
    spacing: number; // in mm
    frameShape: 'circle' | 'square';
    frameMm: number; // Thickness for Frame boundary
    cutFrameMm: number; // Inward crop amount
    frameColor: string;
    unit: 'mm' | 'inch';

    // Global Modules
    globalCropEnabled: boolean;
    globalFrameEnabled: boolean;
}

export const PRESETS_BASE = {
    tiny: 12,
    small: 20,
    medium: 20,
    large: 40,
    huge: 65,
    gargantua: 90
}; // base values in mm

interface TokenStore {
    images: ImageItem[];
    frames: FrameItem[];
    settings: PrintSettings;
    presets: Record<string, number>;

    // Actions
    addImages: (newImages: ImageItem[]) => void;
    removeImage: (id: string) => void;
    updateImage: (id: string, updates: Partial<ImageItem>) => void;
    duplicateImage: (id: string) => void;
    clearImages: () => void;
    setAllCropEnabled: (enabled: boolean) => void;
    setAllFrameEnabled: (enabled: boolean) => void;
    setAllOverlayEnabled: (enabled: boolean) => void;

    addFrames: (newFrames: FrameItem[]) => void;
    removeFrame: (id: string) => void;
    updateFrame: (id: string, updates: Partial<FrameItem>) => void;
    duplicateFrame: (id: string) => void;

    updateSettings: (updates: Partial<PrintSettings>) => void;
    updatePreset: (presetName: string, valueMm: number) => void;
}

const DEFAULT_SETTINGS: PrintSettings = {
    paperSize: 'a4',
    margins: 5,
    spacing: 1,
    frameShape: 'circle',
    frameMm: 2, // Default explicit thickness
    cutFrameMm: 2, // Default crop depth
    frameColor: '#000000',
    unit: 'mm',
    globalCropEnabled: false,
    globalFrameEnabled: false
};

export const useTokenStore = create<TokenStore>((set) => ({
    images: [],
    frames: [],
    settings: DEFAULT_SETTINGS,
    presets: { ...PRESETS_BASE },

    addImages: (newImages) => set((state) => ({ images: [...state.images, ...newImages] })),
    removeImage: (id) => set((state) => ({ images: state.images.filter((img) => img.id !== id) })),
    updateImage: (id, updates) => set((state) => ({
        images: state.images.map((img) => img.id === id ? { ...img, ...updates } : img)
    })),
    duplicateImage: (id) => set((state) => {
        const imgToClone = state.images.find(img => img.id === id);
        if (!imgToClone) return state;
        const newImg = { ...imgToClone, id: crypto.randomUUID() };
        const index = state.images.findIndex(img => img.id === id);
        const newImages = [...state.images];
        newImages.splice(index + 1, 0, newImg);
        return { images: newImages };
    }),
    clearImages: () => set({ images: [] }),
    setAllCropEnabled: (enabled) => set((state) => ({ images: state.images.map(img => ({ ...img, cropEnabled: enabled })) })),
    setAllFrameEnabled: (enabled) => set((state) => ({ images: state.images.map(img => ({ ...img, frameEnabled: enabled })) })),
    setAllOverlayEnabled: (enabled) => set((state) => ({ images: state.images.map(img => ({ ...img, overlayEnabled: enabled })) })),

    addFrames: (newFrames) => set((state) => ({ frames: [...state.frames, ...newFrames] })),
    removeFrame: (id) => set((state) => ({ frames: state.frames.filter((f) => f.id !== id) })),
    updateFrame: (id, updates) => set((state) => ({
        frames: state.frames.map((f) => f.id === id ? { ...f, ...updates } : f)
    })),
    duplicateFrame: (id) => set((state) => {
        const frameToClone = state.frames.find(f => f.id === id);
        if (!frameToClone) return state;
        const newFrame = { ...frameToClone, id: crypto.randomUUID() };
        const index = state.frames.findIndex(f => f.id === id);
        const newFrames = [...state.frames];
        newFrames.splice(index + 1, 0, newFrame);
        return { frames: newFrames };
    }),

    updateSettings: (updates) => set((state) => ({ settings: { ...state.settings, ...updates } })),
    updatePreset: (presetName, valueMm) => set((state) => ({
        presets: { ...state.presets, [presetName]: valueMm }
    }))
}));
