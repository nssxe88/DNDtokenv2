import rateLimit from 'express-rate-limit';
import { config } from '../config.js';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.apiRateLimit,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.uploadRateLimit,
  message: { error: 'Too many uploads, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.adminRateLimit,
  message: { error: 'Too many admin requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
