export type GalleryCategory =
  | 'creature'
  | 'humanoid'
  | 'undead'
  | 'environment'
  | 'item'
  | 'vehicle'
  | 'effect'
  | 'other';

export type ImageStatus = 'pending' | 'approved' | 'rejected';

export interface GalleryImageRow {
  id: string;
  name: string;
  category: GalleryCategory;
  tags: string; // JSON array stored as text
  original_path: string;
  thumbnail_path: string;
  uploader_id: string | null;
  uploader_name: string;
  is_private: number; // SQLite boolean
  status: ImageStatus;
  review_note: string | null;
  reviewed_at: string | null;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryImageDTO {
  id: string;
  originalUrl: string;
  thumbnailUrl: string;
  uploaderName: string;
  uploadedAt: string;
  name: string;
  category: GalleryCategory;
  tags: string[];
  status: ImageStatus;
  reviewedAt?: string;
  reviewNote?: string;
  usageCount: number;
  isPrivate: boolean;
}

export interface AdminUserRow {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface AuthPayload {
  userId: string;
  username: string;
}

export interface PaginatedResponse<T> {
  images: T[];
  total: number;
  page: number;
  totalPages: number;
}
