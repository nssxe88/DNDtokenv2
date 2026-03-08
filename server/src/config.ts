import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverRoot = path.resolve(__dirname, '..');

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  dbPath: path.resolve(serverRoot, process.env.DB_PATH || './data/gallery.db'),

  uploadDir: path.resolve(serverRoot, process.env.UPLOAD_DIR || './uploads'),
  get originalsPath() {
    return path.join(this.uploadDir, 'originals');
  },
  get thumbnailsPath() {
    return path.join(this.uploadDir, 'thumbnails');
  },

  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  maxOriginalSize: 2048,
  thumbnailSize: 256,
  thumbnailQuality: 80,

  jwtSecret: (() => {
    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    return secret || 'dev-secret-do-not-use-in-production';
  })(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  corsOrigin: (() => {
    const origin = process.env.CORS_ORIGIN;
    if (!origin && process.env.NODE_ENV === 'production') {
      throw new Error('CORS_ORIGIN must be set in production');
    }
    return origin || 'http://localhost:5173';
  })(),

  apiRateLimit: parseInt(process.env.API_RATE_LIMIT || '200', 10),
  uploadRateLimit: parseInt(process.env.UPLOAD_RATE_LIMIT || '10', 10),
  adminRateLimit: parseInt(process.env.ADMIN_RATE_LIMIT || '100', 10),
} as const;
