import type { StateCreator } from 'zustand';
import type { LibraryAsset, LibraryCategory, LibraryManifest } from '../types/index.ts';
import { loadManifest, loadAssetImage } from '../services/assetLoader.ts';

export interface LibrarySlice {
  // State
  libraryAssets: LibraryAsset[];
  libraryLoaded: boolean;
  libraryLoading: boolean;
  libraryError: string | null;
  librarySearchQuery: string;
  libraryActiveCategory: LibraryCategory | 'all';
  librarySelectedAssetId: string | null;

  // Actions
  loadLibrary: () => Promise<void>;
  setLibrarySearchQuery: (query: string) => void;
  setLibraryActiveCategory: (category: LibraryCategory | 'all') => void;
  selectLibraryAsset: (assetId: string | null) => void;
  preloadAssetById: (assetId: string) => void;
  getFilteredAssets: () => LibraryAsset[];
}

export const createLibrarySlice: StateCreator<LibrarySlice> = (set, get) => ({
  libraryAssets: [],
  libraryLoaded: false,
  libraryLoading: false,
  libraryError: null,
  librarySearchQuery: '',
  libraryActiveCategory: 'all',
  librarySelectedAssetId: null,

  loadLibrary: async () => {
    if (get().libraryLoaded || get().libraryLoading) return;

    set({ libraryLoading: true, libraryError: null });

    try {
      const manifest: LibraryManifest = await loadManifest();
      set({
        libraryAssets: manifest.assets,
        libraryLoaded: true,
        libraryLoading: false,
      });
    } catch (err) {
      set({
        libraryError: err instanceof Error ? err.message : 'Failed to load library',
        libraryLoading: false,
      });
    }
  },

  setLibrarySearchQuery: (query) => set({ librarySearchQuery: query }),

  setLibraryActiveCategory: (category) => set({ libraryActiveCategory: category }),

  selectLibraryAsset: (assetId) => {
    set({ librarySelectedAssetId: assetId });
  },

  preloadAssetById: (assetId) => {
    const asset = get().libraryAssets.find((a) => a.id === assetId);
    if (asset) {
      loadAssetImage(asset.file).catch((error) => {
        console.error(`Failed to preload asset ${assetId}:`, error);
      });
    }
  },

  getFilteredAssets: () => {
    const { libraryAssets, librarySearchQuery, libraryActiveCategory } = get();
    let filtered = libraryAssets;

    if (libraryActiveCategory !== 'all') {
      filtered = filtered.filter((a) => a.category === libraryActiveCategory);
    }

    if (librarySearchQuery.trim()) {
      const q = librarySearchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.tags.some((tag) => tag.includes(q)) ||
          a.category.includes(q)
      );
    }

    return filtered;
  },
});
