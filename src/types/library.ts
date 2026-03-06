import type { TokenShape } from './token.ts';

export type LibraryCategory = 'frame' | 'border' | 'texture' | 'icon' | 'ring';

export interface LibraryAsset {
  id: string;
  name: string;
  category: LibraryCategory;
  tags: string[];
  file: string;
  thumbnail: string;
  size: { width: number; height: number };
  compatibleShapes: TokenShape[];
  author: string;
  license: string;
}

export interface LibraryManifest {
  version: string;
  assets: LibraryAsset[];
}
