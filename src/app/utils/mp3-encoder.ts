import { Mp3Encoder } from '@breezystack/lamejs';

const SAMPLE_BLOCK_SIZE = 1152;

export function audioBufferToMp3Blob(buffer: AudioBuffer, kbps = 192): Blob {
  const numChannels = buffer.numberOfChannels;
  const encoder = new Mp3Encoder(numChannels, buffer.sampleRate, kbps);

  const left = floatTo16BitPCM(buffer.getChannelData(0));
  const right = numChannels > 1 ? floatTo16BitPCM(buffer.getChannelData(1)) : undefined;

  const mp3Chunks: Uint8Array[] = [];

  for (let i = 0; i < left.length; i += SAMPLE_BLOCK_SIZE) {
    const leftChunk = left.subarray(i, i + SAMPLE_BLOCK_SIZE);
    const rightChunk = right?.subarray(i, i + SAMPLE_BLOCK_SIZE);
    const encoded = encoder.encodeBuffer(leftChunk, rightChunk);
    if (encoded.length > 0) mp3Chunks.push(encoded);
  }

  const final = encoder.flush();
  if (final.length > 0) mp3Chunks.push(final);

  return new Blob(mp3Chunks as BlobPart[], { type: 'audio/mp3' });
}

function floatTo16BitPCM(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const sample = Math.max(-1, Math.min(1, input[i]));
    output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return output;
}
