import { UpperCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { APP_PATHS } from '../app.routes';
import { SeoService } from '../seo/seo.service';
import { DemucsService } from '../services/demucs.service';
import { audioBufferToMp3Blob } from '../utils/mp3-encoder';
import { audioBufferToWavBlob } from '../utils/wav-encoder';

export type DownloadFormat = 'mp3' | 'wav';

@Component({
  selector: 'app-separator',
  imports: [RouterLink, UpperCasePipe, TranslatePipe],
  templateUrl: './separator.html',
  styleUrl: './separator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Separator {
  private readonly demucs = inject(DemucsService);
  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly paths = APP_PATHS;

  readonly fileName = signal<string | null>(null);
  readonly isDragOver = signal(false);
  readonly isProcessing = signal(false);
  readonly agreedToTerms = signal(false);
  readonly downloadFormat = signal<DownloadFormat>('mp3');
  readonly isDownloading = signal(false);

  readonly vocalsUrl = signal<string | null>(null);
  readonly instrumentalUrl = signal<string | null>(null);

  readonly status = this.demucs.status;
  readonly errorMessage = this.demucs.errorMessage;
  readonly modelProgress = this.demucs.modelProgress;
  readonly separationProgress = this.demucs.separationProgress;

  readonly progressPercent = computed(() => {
    if (this.status() === 'loading-model') return Math.round(this.modelProgress() * 100);
    if (this.status() === 'separating') return Math.round(this.separationProgress() * 100);
    return 0;
  });

  readonly showProgressBar = computed(
    () => this.status() === 'loading-model' || this.status() === 'separating',
  );

  readonly statusKey = computed(() => {
    switch (this.status()) {
      case 'loading-model':
        return 'status.loadingModel';
      case 'decoding':
        return 'status.decoding';
      case 'separating':
        return 'status.separating';
      case 'done':
        return 'status.done';
      default:
        return '';
    }
  });

  readonly canSeparate = computed(
    () => !!this.fileName() && this.agreedToTerms() && !this.isProcessing(),
  );

  private selectedFile: File | null = null;
  private vocalsBuffer: AudioBuffer | null = null;
  private instrumentalBuffer: AudioBuffer | null = null;

  constructor() {
    this.seo.bindPage({
      titleKey: 'meta.homeTitle',
      descriptionKey: 'meta.homeDescription',
      path: APP_PATHS.home,
    });

    this.destroyRef.onDestroy(() => this.resetResults());
  }

  onTermsAgreementChanged(event: Event): void {
    this.agreedToTerms.set((event.target as HTMLInputElement).checked);
  }

  onDownloadFormatChanged(format: DownloadFormat): void {
    this.downloadFormat.set(format);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.setFile(file);
    input.value = '';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.setFile(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(): void {
    this.isDragOver.set(false);
  }

  async separate(): Promise<void> {
    if (!this.canSeparate() || !this.selectedFile) return;

    this.isProcessing.set(true);
    this.resetResults();

    try {
      const { vocals, instrumental } = await this.demucs.separateFile(this.selectedFile);
      this.vocalsBuffer = vocals;
      this.instrumentalBuffer = instrumental;
      this.vocalsUrl.set(URL.createObjectURL(audioBufferToWavBlob(vocals)));
      this.instrumentalUrl.set(URL.createObjectURL(audioBufferToWavBlob(instrumental)));
    } catch {
      // mesajul de eroare e deja setat în DemucsService
    } finally {
      this.isProcessing.set(false);
    }
  }

  async downloadInstrumental(): Promise<void> {
    if (!this.instrumentalBuffer) return;
    await this.encodeAndDownload(this.instrumentalBuffer, 'instrumental');
  }

  async downloadVocals(): Promise<void> {
    if (!this.vocalsBuffer) return;
    await this.encodeAndDownload(this.vocalsBuffer, 'vocals');
  }

  private async encodeAndDownload(buffer: AudioBuffer, suffix: string): Promise<void> {
    this.isDownloading.set(true);
    try {
      // Așteaptă un tick ca UI-ul să apuce să arate starea de încărcare
      // înainte de codificarea sincronă (poate dura câteva secunde pentru MP3).
      await new Promise((resolve) => setTimeout(resolve, 0));

      const format = this.downloadFormat();
      const blob = format === 'mp3' ? audioBufferToMp3Blob(buffer) : audioBufferToWavBlob(buffer);
      this.downloadBlob(blob, this.buildFileName(suffix, format));
    } finally {
      this.isDownloading.set(false);
    }
  }

  private setFile(file: File): void {
    this.selectedFile = file;
    this.fileName.set(file.name);
    this.agreedToTerms.set(false);
    this.resetResults();
  }

  private resetResults(): void {
    const vocalsUrl = this.vocalsUrl();
    const instrumentalUrl = this.instrumentalUrl();
    if (vocalsUrl) URL.revokeObjectURL(vocalsUrl);
    if (instrumentalUrl) URL.revokeObjectURL(instrumentalUrl);

    this.vocalsUrl.set(null);
    this.instrumentalUrl.set(null);
    this.vocalsBuffer = null;
    this.instrumentalBuffer = null;
  }

  private buildFileName(suffix: string, format: DownloadFormat): string {
    const base = this.selectedFile?.name.replace(/\.[^/.]+$/, '') ?? 'audio';
    return `${base}-${suffix}.${format}`;
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
}
