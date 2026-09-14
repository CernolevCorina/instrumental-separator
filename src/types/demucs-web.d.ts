declare module 'demucs-web' {
  export interface DemucsProgressInfo {
    progress: number;
    currentSegment?: number;
    totalSegments?: number;
  }

  export interface DemucsProcessorOptions {
    ort: unknown;
    modelPath?: string;
    sessionOptions?: Record<string, unknown>;
    onProgress?: (info: DemucsProgressInfo) => void;
    onLog?: (phase: string, message: string) => void;
    onDownloadProgress?: (loaded: number, total: number) => void;
  }

  export interface StereoTrack {
    left: Float32Array;
    right: Float32Array;
  }

  export interface DemucsSeparationResult {
    drums: StereoTrack;
    bass: StereoTrack;
    other: StereoTrack;
    vocals: StereoTrack;
  }

  export class DemucsProcessor {
    constructor(options: DemucsProcessorOptions);
    loadModel(source?: string | ArrayBuffer): Promise<void>;
    separate(left: Float32Array, right: Float32Array): Promise<DemucsSeparationResult>;
  }

  export const CONSTANTS: {
    SAMPLE_RATE: number;
    FFT_SIZE: number;
    HOP_SIZE: number;
    TRAINING_SAMPLES: number;
    TRACKS: string[];
    DEFAULT_MODEL_URL: string;
  };
}
