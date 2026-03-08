import { getDb } from './index.js';
import type {
  GalleryImageRow,
  GalleryCategory,
  ImageStatus,
  AdminUserRow,
} from '../types.js';

// ─── Gallery Image Queries ─────────────────────────────────────

export interface CreateImageParams {
  id: string;
  name: string;
  category: GalleryCategory;
  tags: string[];
  original_path: string;
  thumbnail_path: string;
  uploader_id: string | null;
  uploader_name: string;
  is_private: boolean;
  status: ImageStatus;
}

export function createGalleryImage(params: CreateImageParams): GalleryImageRow {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO gallery_images (id, name, category, tags, original_path, thumbnail_path,
      uploader_id, uploader_name, is_private, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    params.id,
    params.name,
    params.category,
    JSON.stringify(params.tags),
    params.original_path,
    params.thumbnail_path,
    params.uploader_id,
    params.uploader_name,
    params.is_private ? 1 : 0,
    params.status
  );

  return getGalleryImageById(params.id)!;
}

export function getGalleryImageById(id: string): GalleryImageRow | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM gallery_images WHERE id = ?').get(id) as
    | GalleryImageRow
    | undefined;
}

export interface ListImagesParams {
  status?: ImageStatus;
  category?: GalleryCategory;
  search?: string;
  uploaderId?: string;
  isPrivate?: boolean;
  limit: number;
  offset: number;
  sortBy?: 'newest' | 'popular';
}

export function listGalleryImages(
  params: ListImagesParams
): { images: GalleryImageRow[]; total: number } {
  const db = getDb();
  const conditions: string[] = [];
  const values: (string | number)[] = [];

  if (params.status) {
    conditions.push('status = ?');
    values.push(params.status);
  }

  if (params.category) {
    conditions.push('category = ?');
    values.push(params.category);
  }

  if (params.search) {
    conditions.push('(name LIKE ? OR tags LIKE ?)');
    const term = `%${params.search}%`;
    values.push(term, term);
  }

  if (params.uploaderId) {
    conditions.push('uploader_id = ?');
    values.push(params.uploaderId);
  }

  if (params.isPrivate !== undefined) {
    conditions.push('is_private = ?');
    values.push(params.isPrivate ? 1 : 0);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderBy =
    params.sortBy === 'popular' ? 'ORDER BY usage_count DESC' : 'ORDER BY created_at DESC';

  const countRow = db
    .prepare(`SELECT COUNT(*) as count FROM gallery_images ${where}`)
    .get(...values) as { count: number };

  const images = db
    .prepare(
      `SELECT * FROM gallery_images ${where} ${orderBy} LIMIT ? OFFSET ?`
    )
    .all(...values, params.limit, params.offset) as GalleryImageRow[];

  return { images, total: countRow.count };
}

export function updateGalleryImage(
  id: string,
  updates: Partial<{
    name: string;
    category: GalleryCategory;
    tags: string[];
    status: ImageStatus;
    review_note: string | null;
    reviewed_at: string | null;
  }>
): GalleryImageRow | undefined {
  const db = getDb();
  const sets: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.name !== undefined) {
    sets.push('name = ?');
    values.push(updates.name);
  }
  if (updates.category !== undefined) {
    sets.push('category = ?');
    values.push(updates.category);
  }
  if (updates.tags !== undefined) {
    sets.push('tags = ?');
    values.push(JSON.stringify(updates.tags));
  }
  if (updates.status !== undefined) {
    sets.push('status = ?');
    values.push(updates.status);
  }
  if (updates.review_note !== undefined) {
    sets.push('review_note = ?');
    values.push(updates.review_note);
  }
  if (updates.reviewed_at !== undefined) {
    sets.push('reviewed_at = ?');
    values.push(updates.reviewed_at);
  }

  if (sets.length === 0) return getGalleryImageById(id);

  sets.push("updated_at = datetime('now')");
  values.push(id);

  db.prepare(`UPDATE gallery_images SET ${sets.join(', ')} WHERE id = ?`).run(...values);

  return getGalleryImageById(id);
}

export function deleteGalleryImage(id: string): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM gallery_images WHERE id = ?').run(id);
  return result.changes > 0;
}

export function incrementUsageCount(id: string): void {
  const db = getDb();
  db.prepare('UPDATE gallery_images SET usage_count = usage_count + 1 WHERE id = ?').run(id);
}

export function getGalleryStats(): {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
} {
  const db = getDb();
  const total = (db.prepare('SELECT COUNT(*) as c FROM gallery_images').get() as { c: number }).c;
  const pending = (
    db.prepare("SELECT COUNT(*) as c FROM gallery_images WHERE status = 'pending'").get() as {
      c: number;
    }
  ).c;
  const approved = (
    db.prepare("SELECT COUNT(*) as c FROM gallery_images WHERE status = 'approved'").get() as {
      c: number;
    }
  ).c;
  const rejected = (
    db.prepare("SELECT COUNT(*) as c FROM gallery_images WHERE status = 'rejected'").get() as {
      c: number;
    }
  ).c;

  return { total, pending, approved, rejected };
}

// ─── Admin User Queries ─────────────────────────────────────

export function getAdminUserByUsername(username: string): AdminUserRow | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username) as
    | AdminUserRow
    | undefined;
}

export function hasAnyAdminUsers(): boolean {
  const db = getDb();
  const row = db.prepare('SELECT COUNT(*) as c FROM admin_users').get() as { c: number };
  return row.c > 0;
}

export function createAdminUser(params: {
  id: string;
  username: string;
  password_hash: string;
}): AdminUserRow {
  const db = getDb();
  db.prepare('INSERT INTO admin_users (id, username, password_hash) VALUES (?, ?, ?)').run(
    params.id,
    params.username,
    params.password_hash
  );
  return getAdminUserByUsername(params.username)!;
}
