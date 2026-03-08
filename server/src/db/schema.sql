CREATE TABLE IF NOT EXISTS gallery_images (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  original_path TEXT NOT NULL,
  thumbnail_path TEXT NOT NULL,
  uploader_id TEXT,
  uploader_name TEXT DEFAULT 'Anonymous',
  is_private INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  review_note TEXT,
  reviewed_at TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_gallery_status ON gallery_images(status);
CREATE INDEX IF NOT EXISTS idx_gallery_category ON gallery_images(category);
CREATE INDEX IF NOT EXISTS idx_gallery_uploader ON gallery_images(uploader_id);

CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
