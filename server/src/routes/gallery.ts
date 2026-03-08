import { Router } from 'express';
import type { Request, Response } from 'express';
import { upload } from '../middleware/upload.js';
import { uploadLimiter, apiLimiter } from '../middleware/rateLimit.js';
import * as imageService from '../services/imageService.js';
import * as galleryService from '../services/galleryService.js';
import type { GalleryCategory } from '../types.js';

function str(v: unknown): string {
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
  return '';
}

const VALID_CATEGORIES: GalleryCategory[] = [
  'creature', 'humanoid', 'undead', 'environment',
  'item', 'vehicle', 'effect', 'other',
];

function isValidCategory(v: string): v is GalleryCategory {
  return VALID_CATEGORIES.includes(v as GalleryCategory);
}

export const galleryRouter = Router();

// List approved gallery images (public)
galleryRouter.get('/', apiLimiter, (_req: Request, res: Response) => {
  try {
    const page = parseInt(str(_req.query.page)) || 1;
    const limit = Math.min(parseInt(str(_req.query.limit)) || 20, 100);
    const catInput = str(_req.query.category);
    const category = catInput && isValidCategory(catInput) ? catInput : undefined;
    const search = str(_req.query.search) || undefined;
    const sortBy = (str(_req.query.sort) as 'newest' | 'popular') || 'newest';

    const result = galleryService.listImages({
      page,
      limit,
      category: category || undefined,
      search,
      status: 'approved',
      isPrivate: false,
      sortBy,
    });

    res.json(result);
  } catch (error) {
    console.error('Error listing gallery:', error);
    res.status(500).json({ error: 'Failed to fetch gallery images' });
  }
});

// Get user's own uploads — must be before /:id to avoid route conflict
galleryRouter.get('/my-uploads', apiLimiter, (req: Request, res: Response) => {
  try {
    const uploaderId = str(req.query.uploaderId);
    if (!uploaderId) {
      res.status(400).json({ error: 'uploaderId query parameter required' });
      return;
    }

    const result = galleryService.listImages({
      uploaderId,
      page: 1,
      limit: 100,
    });

    res.json(result.images);
  } catch (error) {
    console.error('Error fetching user uploads:', error);
    res.status(500).json({ error: 'Failed to fetch uploads' });
  }
});

// Delete own pending upload
galleryRouter.delete('/my-uploads/:id', apiLimiter, async (req: Request, res: Response) => {
  try {
    const id = str(req.params.id);
    const uploaderId = str(req.query.uploaderId);
    if (!uploaderId) {
      res.status(400).json({ error: 'uploaderId query parameter required' });
      return;
    }

    const image = galleryService.getImageById(id);
    if (!image) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    const { getGalleryImageById } = await import('../db/queries.js');
    const row = getGalleryImageById(id);
    if (!row || row.uploader_id !== uploaderId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    if (image.status !== 'pending' && !image.isPrivate) {
      res.status(403).json({ error: 'Cannot delete approved images' });
      return;
    }

    await imageService.deleteImageFiles(image.originalUrl, image.thumbnailUrl);
    galleryService.deleteImage(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting upload:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Get single image
galleryRouter.get('/:id', apiLimiter, (req: Request, res: Response) => {
  try {
    const image = galleryService.getImageById(str(req.params.id));
    if (!image || (image.status !== 'approved' && !image.isPrivate)) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }
    res.json(image);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

// Increment usage count
galleryRouter.post('/:id/usage', (req: Request, res: Response) => {
  try {
    galleryService.incrementUsage(str(req.params.id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to increment usage' });
  }
});

// Upload new image
galleryRouter.post(
  '/upload',
  uploadLimiter,
  upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No image file provided' });
        return;
      }

      const { name, category, tags, uploaderName, isPrivate } = req.body as Record<
        string,
        string
      >;

      if (!name || !category || !isValidCategory(category)) {
        res.status(400).json({ error: 'Name and valid category are required' });
        return;
      }

      const validation = await imageService.validateImage(req.file.buffer, req.file.mimetype);
      if (!validation.valid) {
        res.status(400).json({ error: validation.error });
        return;
      }

      const processed = await imageService.processAndSaveImage(
        req.file.buffer,
        req.file.originalname
      );

      let parsedTags: string[] = [];
      if (tags) {
        try {
          parsedTags = JSON.parse(tags) as string[];
        } catch {
          parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
        }
      }

      const galleryImage = galleryService.createImage({
        name,
        category: category as GalleryCategory,
        tags: parsedTags,
        originalPath: processed.originalPath,
        thumbnailPath: processed.thumbnailPath,
        uploaderId: uploaderName || req.ip,
        uploaderName: uploaderName || 'Anonymous',
        isPrivate: isPrivate === 'true',
      });

      res.status(201).json({
        id: galleryImage.id,
        thumbnailUrl: galleryImage.thumbnailUrl,
        status: galleryImage.status,
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  }
);
