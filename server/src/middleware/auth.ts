import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../config.js';
import * as queries from '../db/queries.js';
import type { AuthPayload } from '../types.js';

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const payload = jwt.verify(token, config.jwtSecret) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export async function loginAdmin(
  username: string,
  password: string
): Promise<string | null> {
  const admin = queries.getAdminUserByUsername(username);
  if (!admin) return null;

  const match = await bcrypt.compare(password, admin.password_hash);
  if (!match) return null;

  const payload: AuthPayload = { userId: admin.id, username: admin.username };
  // expiresIn expects a number (seconds) or ms-compatible StringValue
  const expiresInSec = 24 * 60 * 60; // 24 hours
  return jwt.sign(payload, config.jwtSecret, { expiresIn: expiresInSec });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
