import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';

export interface ProcessedImage {
  id: string;
  originalPath: string;
  thumbnailPath: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const ALLOWED_MIMES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_DIMENSION = 4096;

export async function validateImage(
  buffer: Buffer,
  mimetype: string
): Promise<ValidationResult> {
  if (!ALLOWED_MIMES.includes(mimetype)) {
    return { valid: false, error: 'Invalid file type. Only PNG, JPG, and WebP are allowed.' };
  }

  if (buffer.length > config.maxFileSize) {
    return { valid: false, error: `File too large. Maximum size is ${config.maxFileSize / 1024 / 1024}MB.` };
  }

  try {
    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) {
      return { valid: false, error: 'Could not read image dimensions.' };
    }
    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
      return { valid: false, error: `Image too large. Maximum dimensions are ${MAX_DIMENSION}x${MAX_DIMENSION}.` };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid or corrupted image file.' };
  }
}

export async function processAndSaveImage(
  buffer: Buffer,
  originalFilename: string
): Promise<ProcessedImage> {
  const id = uuidv4();
  const ext = path.extname(originalFilename).toLowerCase() || '.jpg';

  ensureDir(config.originalsPath);
  ensureDir(config.thumbnailsPath);

  const originalFileName = `${id}${ext}`;
  const thumbnailFileName = `${id}.webp`;

  const originalFullPath = path.join(config.originalsPath, originalFileName);
  const thumbnailFullPath = path.join(config.thumbnailsPath, thumbnailFileName);

  // Process original — resize if too large
  const image = sharp(buffer);
  const metadata = await image.metadata();

  if (
    metadata.width &&
    metadata.height &&
    (metadata.width > config.maxOriginalSize || metadata.height > config.maxOriginalSize)
  ) {
    await image
      .resize(config.maxOriginalSize, config.maxOriginalSize, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFile(originalFullPath);
  } else {
    await sharp(buffer).toFile(originalFullPath);
  }

  // Generate thumbnail
  await sharp(buffer)
    .resize(config.thumbnailSize, config.thumbnailSize, {
      fit: 'cover',
      position: 'centre',
    })
    .webp({ quality: config.thumbnailQuality })
    .toFile(thumbnailFullPath);

  return {
    id,
    originalPath: `/uploads/originals/${originalFileName}`,
    thumbnailPath: `/uploads/thumbnails/${thumbnailFileName}`,
  };
}

export async function deleteImageFiles(
  originalPath: string,
  thumbnailPath: string
): Promise<void> {
  const safePath = (p: string): string => {
    const relative = path.normalize(p.replace('/uploads/', ''));
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new Error('Invalid file path');
    }
    const full = path.join(config.uploadDir, relative);
    if (!full.startsWith(config.uploadDir)) {
      throw new Error('Path traversal attempt detected');
    }
    return full;
  };

  for (const p of [originalPath, thumbnailPath]) {
    try {
      const fp = safePath(p);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    } catch (err) {
      console.error(`Failed to delete file:`, err);
    }
  }
}

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}
