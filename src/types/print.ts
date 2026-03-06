export type PaperSize = 'a4' | 'a3' | 'a5' | 'letter' | 'legal' | 'tabloid' | 'custom';

export interface CustomPaperSize {
  width: number;
  height: number;
}

export interface PrintSettings {
  paperSize: PaperSize;
  customPaperSize: CustomPaperSize | null;
  orientation: 'portrait' | 'landscape';
  margins: number;
  spacing: number;
  unit: 'mm' | 'inch';
  cutMarks: boolean;
  bleed: number;
}
