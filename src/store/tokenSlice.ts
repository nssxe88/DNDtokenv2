import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Token, TokenShape, DnDSizePreset, ImageCropTransform } from '../types/index.ts';
import {
  DEFAULT_TOKEN_SIZE_MM,
  DEFAULT_FRAME_THICKNESS_MM,
  DEFAULT_FRAME_COLOR,
} from '../utils/constants.ts';

export interface TokenSlice {
  tokens: Token[];

  addToken: (file: File, imageSrc: string) => Token;
  removeToken: (id: string) => void;
  removeTokens: (ids: string[]) => void;
  updateToken: (id: string, updates: Partial<Token>) => void;
  updateTokenPosition: (id: string, x: number, y: number) => void;
  updateTokenImageCrop: (id: string, crop: ImageCropTransform) => void;
  setTokenShape: (id: string, shape: TokenShape) => void;
  setTokenSize: (id: string, sizeMm: number, preset: DnDSizePreset | null) => void;
  duplicateToken: (id: string) => void;
  clearAllTokens: () => void;
  reorderToken: (id: string, newZIndex: number) => void;
}

export const createTokenSlice: StateCreator<TokenSlice> = (set) => ({
  tokens: [],

  addToken: (file, imageSrc) => {
    const token: Token = {
      id: uuidv4(),
      originalSrc: imageSrc,
      processedSrc: imageSrc,
      fileName: file.name,
      sizeMm: DEFAULT_TOKEN_SIZE_MM,
      sizePreset: 'medium',
      position: { x: 20, y: 20 },
      rotation: 0,
      scale: { x: 1, y: 1 },
      shape: 'circle',
      frame: {
        enabled: true,
        thicknessMm: DEFAULT_FRAME_THICKNESS_MM,
        color: DEFAULT_FRAME_COLOR,
        style: 'solid',
        libraryAssetId: null,
      },
      crop: {
        enabled: false,
        cutFrameMm: 0,
      },
      overlayId: null,
      overlayOpacity: 1,
      imageCrop: {
        offsetX: 0,
        offsetY: 0,
        scale: 1,
        rotation: 0,
      },
      filters: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        hue: 0,
        blur: 0,
        grayscale: false,
        sepia: false,
      },
      count: 1,
      locked: false,
      visible: true,
      zIndex: 0,
    };

    set((state) => ({
      tokens: [...state.tokens, { ...token, zIndex: state.tokens.length }],
    }));

    return token;
  },

  removeToken: (id) => {
    set((state) => ({
      tokens: state.tokens.filter((t) => t.id !== id),
    }));
  },

  removeTokens: (ids) => {
    set((state) => ({
      tokens: state.tokens.filter((t) => !ids.includes(t.id)),
    }));
  },

  updateToken: (id, updates) => {
    set((state) => ({
      tokens: state.tokens.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  updateTokenPosition: (id, x, y) => {
    set((state) => ({
      tokens: state.tokens.map((t) =>
        t.id === id ? { ...t, position: { x, y } } : t
      ),
    }));
  },

  updateTokenImageCrop: (id, crop) => {
    set((state) => ({
      tokens: state.tokens.map((t) =>
        t.id === id ? { ...t, imageCrop: crop } : t
      ),
    }));
  },

  setTokenShape: (id, shape) => {
    set((state) => ({
      tokens: state.tokens.map((t) => (t.id === id ? { ...t, shape } : t)),
    }));
  },

  setTokenSize: (id, sizeMm, preset) => {
    set((state) => ({
      tokens: state.tokens.map((t) =>
        t.id === id ? { ...t, sizeMm, sizePreset: preset } : t
      ),
    }));
  },

  duplicateToken: (id) => {
    set((state) => {
      const original = state.tokens.find((t) => t.id === id);
      if (!original) return state;

      const duplicate: Token = {
        ...original,
        id: uuidv4(),
        position: {
          x: original.position.x + 5,
          y: original.position.y + 5,
        },
        zIndex: state.tokens.length,
      };
      return { tokens: [...state.tokens, duplicate] };
    });
  },

  clearAllTokens: () => {
    set({ tokens: [] });
  },

  reorderToken: (id, newZIndex) => {
    set((state) => ({
      tokens: state.tokens.map((t) =>
        t.id === id ? { ...t, zIndex: newZIndex } : t
      ),
    }));
  },
});
