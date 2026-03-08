import type { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  GalleryImage,
  GalleryCategory,
  GalleryUploadRequest,
} from '../types/index.ts';
import { galleryApi } from '../api/galleryApi.ts';
import type { TokenSlice } from './tokenSlice.ts';

const UPLOADER_ID_KEY = 'gallery_uploader_id';

function getOrCreateUploaderId(): string {
  let id = localStorage.getItem(UPLOADER_ID_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(UPLOADER_ID_KEY, id);
  }
  return id;
}

export interface GallerySlice {
  galleryImages: GalleryImage[];
  galleryTotal: number;
  galleryPage: number;
  galleryTotalPages: number;
  galleryLoading: boolean;
  galleryError: string | null;
  gallerySearchQuery: string;
  galleryActiveCategory: GalleryCategory | null;
  gallerySort: 'newest' | 'popular';
  gallerySelectedImageId: string | null;

  myUploads: GalleryImage[];
  myUploadsLoading: boolean;
  uploaderId: string;

  galleryUploadModalOpen: boolean;

  fetchGalleryImages: () => Promise<void>;
  setGallerySearchQuery: (query: string) => void;
  setGalleryActiveCategory: (category: GalleryCategory | null) => void;
  setGallerySort: (sort: 'newest' | 'popular') => void;
  setGalleryPage: (page: number) => void;
  selectGalleryImage: (id: string | null) => void;
  uploadToGallery: (data: Omit<GalleryUploadRequest, 'uploaderName'>) => Promise<void>;
  fetchMyUploads: () => Promise<void>;
  deleteMyUpload: (id: string) => Promise<void>;
  setGalleryUploadModalOpen: (open: boolean) => void;
  useGalleryImage: (image: GalleryImage) => void;
}

export const createGallerySlice: StateCreator<
  GallerySlice & TokenSlice,
  [],
  [],
  GallerySlice
> = (set, get) => ({
  galleryImages: [],
  galleryTotal: 0,
  galleryPage: 1,
  galleryTotalPages: 0,
  galleryLoading: false,
  galleryError: null,
  gallerySearchQuery: '',
  galleryActiveCategory: null,
  gallerySort: 'newest',
  gallerySelectedImageId: null,

  myUploads: [],
  myUploadsLoading: false,
  uploaderId: getOrCreateUploaderId(),

  galleryUploadModalOpen: false,

  fetchGalleryImages: async () => {
    const state = get();
    set({ galleryLoading: true, galleryError: null });

    try {
      const response = await galleryApi.listImages({
        category: state.galleryActiveCategory ?? undefined,
        search: state.gallerySearchQuery || undefined,
        sort: state.gallerySort,
        page: state.galleryPage,
        limit: 20,
      });

      set({
        galleryImages: response.images,
        galleryTotal: response.total,
        galleryTotalPages: response.totalPages,
        galleryLoading: false,
      });
    } catch (err) {
      set({
        galleryError: err instanceof Error ? err.message : 'Failed to load gallery',
        galleryLoading: false,
      });
    }
  },

  setGallerySearchQuery: (query) => {
    set({ gallerySearchQuery: query, galleryPage: 1 });
  },

  setGalleryActiveCategory: (category) => {
    set({ galleryActiveCategory: category, galleryPage: 1 });
  },

  setGallerySort: (sort) => {
    set({ gallerySort: sort, galleryPage: 1 });
  },

  setGalleryPage: (page) => {
    set({ galleryPage: page });
  },

  selectGalleryImage: (id) => {
    set({ gallerySelectedImageId: id });
  },

  uploadToGallery: async (data) => {
    const uploaderId = get().uploaderId;

    await galleryApi.uploadImage({
      ...data,
      uploaderName: uploaderId,
    });

    set({ galleryUploadModalOpen: false });
    // Fire and forget — refresh my uploads
    get().fetchMyUploads();
  },

  fetchMyUploads: async () => {
    const uploaderId = get().uploaderId;
    set({ myUploadsLoading: true });

    try {
      const uploads = await galleryApi.getMyUploads(uploaderId);
      set({ myUploads: uploads, myUploadsLoading: false });
    } catch {
      set({ myUploadsLoading: false });
    }
  },

  deleteMyUpload: async (id) => {
    const uploaderId = get().uploaderId;
    await galleryApi.deleteMyUpload(id, uploaderId);
    set((state) => ({
      myUploads: state.myUploads.filter((img) => img.id !== id),
    }));
  },

  setGalleryUploadModalOpen: (open) => {
    set({ galleryUploadModalOpen: open });
  },

  useGalleryImage: (image) => {
    galleryApi.incrementUsage(image.id).catch(() => {});

    fetch(image.originalUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const file = new File([blob], `${image.name}.jpg`, { type: blob.type });
        const imageSrc = URL.createObjectURL(blob);
        get().addToken(file, imageSrc);
      })
      .catch((err) => {
        console.error('Failed to use gallery image:', err);
      });
  },
});
