import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { initDatabase } from './db/index.js';
import { galleryRouter } from './routes/gallery.js';
import { adminRouter } from './routes/admin.js';

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.corsOrigin, credentials: true }));

// Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Ensure directories
for (const dir of [config.uploadDir, config.originalsPath, config.thumbnailsPath, path.dirname(config.dbPath)]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Static uploads
app.use('/uploads', express.static(config.uploadDir));

// Health
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/gallery', galleryRouter);
app.use('/api/admin', adminRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error & { code?: string }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({ error: 'File too large' });
    return;
  }
  if (err.message?.includes('file type')) {
    res.status(400).json({ error: err.message });
    return;
  }

  res.status(500).json({
    error: config.nodeEnv === 'development' ? err.message : 'Internal server error',
  });
});

// Start
initDatabase();

app.listen(config.port, () => {
  console.log(`\nFantasy Token Printer Server v2.0`);
  console.log(`Server: http://localhost:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`Database: ${config.dbPath}\n`);
});
