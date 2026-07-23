export type RemovalMode = 'delogo' | 'blur' | 'patch' | 'crop';

export interface WatermarkBox {
  xPct: number; // 0 - 100%
  yPct: number; // 0 - 100%
  wPct: number; // 0 - 100%
  hPct: number; // 0 - 100%
}

export interface VideoInfo {
  id: string;
  name: string;
  url: string;
  size?: number;
  width: number;
  height: number;
  duration: number;
  thumbnailUrl?: string;
  isSample?: boolean;
  folder?: 'uploads' | 'public' | 'processed';
}

export interface PresetLocation {
  id: string;
  name: string;
  icon: string;
  box: WatermarkBox;
}

export interface ProcessResult {
  success: boolean;
  processedUrl: string;
  filename: string;
  size: number;
  width: number;
  height: number;
  duration: number;
  mode: RemovalMode;
  appliedBox: { x: number; y: number; w: number; h: number };
  processingTimeMs: number;
}
