import { v4 as uuidv4 } from 'uuid';
import * as queries from '../db/queries.js';
import type {
  GalleryImageRow,
  GalleryImageDTO,
  GalleryCategory,
  ImageStatus,
  PaginatedResponse,
} from '../types.js';

function rowToDTO(row: GalleryImageRow): GalleryImageDTO {
  let tags: string[];
  try {
    tags = JSON.parse(row.tags) as string[];
  } catch {
    tags = [];
  }

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    tags,
    originalUrl: row.original_path,
    thumbnailUrl: row.thumbnail_path,
    uploaderName: row.uploader_name,
    uploadedAt: row.created_at,
    status: row.status,
    reviewNote: row.review_note ?? undefined,
    reviewedAt: row.reviewed_at ?? undefined,
    usageCount: row.usage_count,
    isPrivate: row.is_private === 1,
  };
}

export interface CreateImageParams {
  name: string;
  category: GalleryCategory;
  tags: string[];
  originalPath: string;
  thumbnailPath: string;
  uploaderId?: string;
  uploaderName?: string;
  isPrivate: boolean;
}

export function createImage(params: CreateImageParams): GalleryImageDTO {
  const row = queries.createGalleryImage({
    id: uuidv4(),
    name: params.name,
    category: params.category,
    tags: params.tags,
    original_path: params.originalPath,
    thumbnail_path: params.thumbnailPath,
    uploader_id: params.uploaderId ?? null,
    uploader_name: params.uploaderName ?? 'Anonymous',
    is_private: params.isPrivate,
    status: params.isPrivate ? 'approved' : 'pending',
  });
  return rowToDTO(row);
}

export interface ListParams {
  page?: number;
  limit?: number;
  category?: GalleryCategory;
  search?: string;
  status?: ImageStatus;
  uploaderId?: string;
  isPrivate?: boolean;
  sortBy?: 'newest' | 'popular';
}

export function listImages(params: ListParams): PaginatedResponse<GalleryImageDTO> {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const { images, total } = queries.listGalleryImages({
    status: params.status,
    category: params.category,
    search: params.search,
    uploaderId: params.uploaderId,
    isPrivate: params.isPrivate,
    limit,
    offset,
    sortBy: params.sortBy,
  });

  return {
    images: images.map(rowToDTO),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export function getImageById(id: string): GalleryImageDTO | undefined {
  const row = queries.getGalleryImageById(id);
  return row ? rowToDTO(row) : undefined;
}

export function approveImage(id: string, reviewNote?: string): GalleryImageDTO | undefined {
  const row = queries.updateGalleryImage(id, {
    status: 'approved',
    review_note: reviewNote ?? null,
    reviewed_at: new Date().toISOString(),
  });
  return row ? rowToDTO(row) : undefined;
}

export function rejectImage(id: string, reviewNote: string): GalleryImageDTO | undefined {
  const row = queries.updateGalleryImage(id, {
    status: 'rejected',
    review_note: reviewNote,
    reviewed_at: new Date().toISOString(),
  });
  return row ? rowToDTO(row) : undefined;
}

export function updateImageMeta(
  id: string,
  updates: { name?: string; category?: GalleryCategory; tags?: string[] }
): GalleryImageDTO | undefined {
  const row = queries.updateGalleryImage(id, updates);
  return row ? rowToDTO(row) : undefined;
}

export function deleteImage(id: string): boolean {
  return queries.deleteGalleryImage(id);
}

export function incrementUsage(id: string): void {
  queries.incrementUsageCount(id);
}

export function getStats() {
  return queries.getGalleryStats();
}
