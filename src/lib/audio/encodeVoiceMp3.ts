import { Mp3Encoder } from 'lamejs';

function floatTo16BitPcm(input: Float32Array) {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const sample = Math.max(-1, Math.min(1, input[i]));
    output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return output;
}

function downmixToMono(buffer: AudioBuffer) {
  if (buffer.numberOfChannels === 1) return buffer.getChannelData(0);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);
  const mono = new Float32Array(buffer.length);
  for (let i = 0; i < buffer.length; i++) mono[i] = (left[i] + right[i]) / 2;
  return mono;
}

export async function encodeVoiceToMp3(blob: Blob): Promise<File> {
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) throw new Error('Audio encoding is not supported in this browser');

  const ctx = new AudioCtx();
  try {
    const audioBuffer = await ctx.decodeAudioData(await blob.arrayBuffer());
    const pcm = floatTo16BitPcm(downmixToMono(audioBuffer));
    const encoder = new Mp3Encoder(1, audioBuffer.sampleRate, 64);
    const chunks: Int8Array[] = [];
    const blockSize = 1152;

    for (let i = 0; i < pcm.length; i += blockSize) {
      const encoded = encoder.encodeBuffer(pcm.subarray(i, i + blockSize));
      if (encoded.length) chunks.push(encoded);
    }

    const finalChunk = encoder.flush();
    if (finalChunk.length) chunks.push(finalChunk);

    return new File(chunks, `voice-${Date.now()}.mp3`, { type: 'audio/mpeg' });
  } finally {
    try { await ctx.close(); } catch {}
  }
}