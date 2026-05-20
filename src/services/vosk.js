import { LANG_CODES } from '../config/constants.js';

let voskModel = null;

const transcribeBlob = (blob) =>
  new Promise(async (resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Vosk timeout')), 10_000);
    try {
      const ctx = new AudioContext({ sampleRate: 16000 });
      const audioBuffer = await ctx.decodeAudioData(await blob.arrayBuffer());
      const rec = new voskModel.KaldiRecognizer(16000);
      rec.on('result', (msg) => {
        clearTimeout(timer);
        resolve({ transcript: msg.result?.text ?? '', confidence: 0.8 });
        rec.remove();
        ctx.close();
      });
      rec.acceptWaveform(audioBuffer);
      rec.retrieveFinalResult();
    } catch (e) { clearTimeout(timer); reject(e); }
  });

export const VoskService = {
  isReady: () => voskModel !== null,

  async initialize(modelZipUrl) {
    if (voskModel) return;
    try {
      const { createModel } = await import('vosk-browser');
      voskModel = await createModel(modelZipUrl);
    } catch {
      console.warn('[Vosk] Model unavailable — Web Speech API fallback active');
    }
  },

  async recognize(blob) {
    if (!voskModel) throw new Error('Vosk not ready');
    return transcribeBlob(blob);
  },

  score(transcript, expected) {
    const clean = (s) => s.toLowerCase().replace(/[¿?¡!.,'"]/g, '').trim();
    const got = clean(transcript).split(/\s+/);
    const exp = clean(expected).split(/\s+/);
    const hits = got.filter((w) => exp.includes(w)).length;
    return Math.round((hits / Math.max(got.length, exp.length, 1)) * 100);
  },
};
