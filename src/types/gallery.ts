export type GalleryCategory =
  | 'creature'
  | 'humanoid'
  | 'undead'
  | 'environment'
  | 'item'
  | 'vehicle'
  | 'effect'
  | 'other';

export interface GalleryImage {
  id: string;
  originalUrl: string;
  thumbnailUrl: string;
  uploaderName: string;
  uploadedAt: string;
  name: string;
  category: GalleryCategory;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt?: string;
  reviewNote?: string;
  usageCount: number;
  isPrivate: boolean;
}

export interface GalleryUploadRequest {
  image: File;
  name: string;
  category: GalleryCategory;
  tags: string[];
  isPrivate: boolean;
  uploaderName: string;
}

export interface GalleryFilters {
  category?: GalleryCategory;
  search?: string;
  sort?: 'newest' | 'popular';
  page: number;
  limit: number;
}

export interface GalleryPaginatedResponse {
  images: GalleryImage[];
  total: number;
  page: number;
  totalPages: number;
}
