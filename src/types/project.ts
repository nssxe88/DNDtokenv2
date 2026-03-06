import type { Token, DnDSizePreset } from './token.ts';
import type { OverlayAsset } from './overlay.ts';
import type { PrintSettings } from './print.ts';
import type { EditorState } from './editor.ts';

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  tokens: Token[];
  overlayAssets: OverlayAsset[];
  printSettings: PrintSettings;
  editorState: EditorState;
  presets: Record<DnDSizePreset, number>;
}
