import { Router } from 'express';
import type { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, loginAdmin, hashPassword } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import { adminLimiter } from '../middleware/rateLimit.js';
import * as galleryService from '../services/galleryService.js';
import * as imageService from '../services/imageService.js';
import * as queries from '../db/queries.js';
import type { GalleryCategory } from '../types.js';

function paramStr(v: unknown): string {
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
  return '';
}

export const adminRouter = Router();

// Login
adminRouter.post('/login', adminLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password required' });
      return;
    }

    const token = await loginAdmin(username, password);
    if (!token) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Setup initial admin (only if none exist)
adminRouter.post('/setup', adminLimiter, async (req: AuthRequest, res: Response) => {
  try {
    if (queries.hasAnyAdminUsers()) {
      res.status(403).json({ error: 'Admin user already exists' });
      return;
    }

    const { username, password } = req.body as { username?: string; password?: string };
    if (!username || !password) {
      res.status(400).json({ error: 'Username and password required' });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    const hash = await hashPassword(password);
    queries.createAdminUser({ id: uuidv4(), username, password_hash: hash });

    res.status(201).json({ success: true, message: 'Admin user created' });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
});

// ─── Protected routes below ────────────────────────────

adminRouter.use(authMiddleware);

// Stats
adminRouter.get('/stats', (_req: AuthRequest, res: Response) => {
  try {
    res.json(galleryService.getStats());
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Pending list
adminRouter.get('/pending', (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(paramStr(req.query.page)) || 1;
    const limit = parseInt(paramStr(req.query.limit)) || 20;

    const result = galleryService.listImages({
      page,
      limit,
      status: 'pending',
      isPrivate: false,
    });

    res.json(result);
  } catch (error) {
    console.error('Pending list error:', error);
    res.status(500).json({ error: 'Failed to fetch pending' });
  }
});

// Approve
adminRouter.post('/approve/:id', (req: AuthRequest, res: Response) => {
  try {
    const id = paramStr(req.params.id);
    const image = galleryService.approveImage(id, req.body?.reviewNote);
    if (!image) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }
    res.json({ success: true, image });
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ error: 'Failed to approve' });
  }
});

// Reject
adminRouter.post('/reject/:id', (req: AuthRequest, res: Response) => {
  try {
    const id = paramStr(req.params.id);
    const { reviewNote } = req.body as { reviewNote?: string };
    const image = galleryService.rejectImage(id, reviewNote || 'Rejected');
    if (!image) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }
    res.json({ success: true, image });
  } catch (error) {
    console.error('Reject error:', error);
    res.status(500).json({ error: 'Failed to reject' });
  }
});

// Bulk approve
adminRouter.post('/bulk-approve', (req: AuthRequest, res: Response) => {
  try {
    const { ids, reviewNote } = req.body as { ids?: string[]; reviewNote?: string };
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'ids array required' });
      return;
    }

    let approved = 0;
    for (const id of ids) {
      if (galleryService.approveImage(id, reviewNote)) approved++;
    }

    res.json({ success: true, approved, total: ids.length });
  } catch (error) {
    console.error('Bulk approve error:', error);
    res.status(500).json({ error: 'Failed to bulk approve' });
  }
});

// Bulk reject
adminRouter.post('/bulk-reject', (req: AuthRequest, res: Response) => {
  try {
    const { ids, reviewNote } = req.body as { ids?: string[]; reviewNote?: string };
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'ids array required' });
      return;
    }

    let rejected = 0;
    for (const id of ids) {
      if (galleryService.rejectImage(id, reviewNote || 'Rejected')) rejected++;
    }

    res.json({ success: true, rejected, total: ids.length });
  } catch (error) {
    console.error('Bulk reject error:', error);
    res.status(500).json({ error: 'Failed to bulk reject' });
  }
});

// Delete image
adminRouter.delete('/gallery/:id', async (req: AuthRequest, res: Response) => {
  try {
    const id = paramStr(req.params.id);
    const image = galleryService.getImageById(id);
    if (!image) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }

    await imageService.deleteImageFiles(image.originalUrl, image.thumbnailUrl);
    galleryService.deleteImage(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// Edit image metadata
adminRouter.patch('/gallery/:id', (req: AuthRequest, res: Response) => {
  try {
    const id = paramStr(req.params.id);
    const { name, category, tags } = req.body as {
      name?: string;
      category?: GalleryCategory;
      tags?: string[];
    };

    const image = galleryService.updateImageMeta(id, { name, category, tags });
    if (!image) {
      res.status(404).json({ error: 'Image not found' });
      return;
    }
    res.json({ success: true, image });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update' });
  }
});
