import { Injectable, signal } from '@angular/core';
import * as ort from 'onnxruntime-web';
import { CONSTANTS, DemucsProcessor } from 'demucs-web';

export type SeparationStatus =
  'idle' | 'loading-model' | 'decoding' | 'separating' | 'done' | 'error';

export interface SeparationResult {
  vocals: AudioBuffer;
  instrumental: AudioBuffer;
}

@Injectable({ providedIn: 'root' })
export class DemucsService {
  readonly status = signal<SeparationStatus>('idle');
  readonly errorMessage = signal('');
  readonly modelProgress = signal(0);
  readonly separationProgress = signal(0);

  private processor: DemucsProcessor | null = null;
  private modelLoaded = false;

  async separateFile(file: File): Promise<SeparationResult> {
    this.errorMessage.set('');

    try {
      const processor = await this.ensureProcessor();

      this.status.set('decoding');

      const audioContext = new AudioContext({ sampleRate: CONSTANTS.SAMPLE_RATE });
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const left = audioBuffer.getChannelData(0);
      const right = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : left;

      this.status.set('separating');
      this.separationProgress.set(0);

      const { drums, bass, other, vocals } = await processor.separate(left, right);

      const length = drums.left.length;
      const instLeft = new Float32Array(length);
      const instRight = new Float32Array(length);
      for (let i = 0; i < length; i++) {
        instLeft[i] = clip(drums.left[i] + bass.left[i] + other.left[i]);
        instRight[i] = clip(drums.right[i] + bass.right[i] + other.right[i]);
      }

      const instrumentalBuffer = audioContext.createBuffer(2, length, CONSTANTS.SAMPLE_RATE);
      instrumentalBuffer.getChannelData(0).set(instLeft);
      instrumentalBuffer.getChannelData(1).set(instRight);

      const vocalsBuffer = audioContext.createBuffer(2, vocals.left.length, CONSTANTS.SAMPLE_RATE);
      vocalsBuffer.getChannelData(0).set(vocals.left);
      vocalsBuffer.getChannelData(1).set(vocals.right);

      this.status.set('done');

      return { vocals: vocalsBuffer, instrumental: instrumentalBuffer };
    } catch (err) {
      this.status.set('error');
      this.errorMessage.set(err instanceof Error ? err.message : String(err));
      throw err;
    }
  }

  private async ensureProcessor(): Promise<DemucsProcessor> {
    if (this.processor && this.modelLoaded) {
      return this.processor;
    }

    ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';
    ort.env.wasm.numThreads = navigator.hardwareConcurrency || 4;

    this.processor = new DemucsProcessor({
      ort,
      onProgress: ({ progress }) => this.separationProgress.set(progress),
      onDownloadProgress: (loaded, total) => this.modelProgress.set(total ? loaded / total : 0),
    });

    this.status.set('loading-model');
    this.modelProgress.set(0);

    await this.processor.loadModel(CONSTANTS.DEFAULT_MODEL_URL);
    this.modelLoaded = true;

    return this.processor;
  }
}

function clip(value: number): number {
  if (value > 1) return 1;
  if (value < -1) return -1;
  return value;
}
