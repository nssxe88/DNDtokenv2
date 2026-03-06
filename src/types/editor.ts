export interface EditorState {
  mode: 'edit' | 'print-layout';
  selectedTokenIds: string[];
  zoom: number;
  panOffset: { x: number; y: number };
  gridEnabled: boolean;
  gridSizeMm: number;
  snapToGrid: boolean;
  showGuides: boolean;
  showCutMarks: boolean;
}
