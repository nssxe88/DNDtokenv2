import type {
  GalleryFilters,
  GalleryPaginatedResponse,
  GalleryImage,
  GalleryUploadRequest,
} from '../types/index.ts';

const API_BASE = '/api';

export const galleryApi = {
  async listImages(filters: GalleryFilters): Promise<GalleryPaginatedResponse> {
    const params = new URLSearchParams({
      page: filters.page.toString(),
      limit: filters.limit.toString(),
    });

    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort) params.append('sort', filters.sort);

    const response = await fetch(`${API_BASE}/gallery?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch gallery images: ${response.statusText}`);
    }

    return response.json() as Promise<GalleryPaginatedResponse>;
  },

  async getImage(id: string): Promise<GalleryImage> {
    const response = await fetch(`${API_BASE}/gallery/${encodeURIComponent(id)}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    return response.json() as Promise<GalleryImage>;
  },

  async uploadImage(
    data: GalleryUploadRequest
  ): Promise<{ id: string; thumbnailUrl: string; status: string }> {
    const formData = new FormData();
    formData.append('image', data.image);
    formData.append('name', data.name);
    formData.append('category', data.category);
    formData.append('tags', JSON.stringify(data.tags));
    formData.append('isPrivate', data.isPrivate.toString());
    formData.append('uploaderName', data.uploaderName);

    const response = await fetch(`${API_BASE}/gallery/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText })) as { message: string };
      throw new Error(error.message || 'Failed to upload image');
    }

    return response.json() as Promise<{ id: string; thumbnailUrl: string; status: string }>;
  },

  async getMyUploads(uploaderId: string): Promise<GalleryImage[]> {
    const response = await fetch(
      `${API_BASE}/gallery/my-uploads?uploaderId=${encodeURIComponent(uploaderId)}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch uploads: ${response.statusText}`);
    }

    return response.json() as Promise<GalleryImage[]>;
  },

  async deleteMyUpload(id: string, uploaderId: string): Promise<void> {
    const response = await fetch(
      `${API_BASE}/gallery/my-uploads/${encodeURIComponent(id)}?uploaderId=${encodeURIComponent(uploaderId)}`,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete upload: ${response.statusText}`);
    }
  },

  async incrementUsage(id: string): Promise<void> {
    const response = await fetch(
      `${API_BASE}/gallery/${encodeURIComponent(id)}/usage`,
      { method: 'POST' }
    );

    if (!response.ok) {
      console.warn(`Failed to increment usage for ${id}`);
    }
  },
};
