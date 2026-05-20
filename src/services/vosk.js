import { LANG_CODES } from '../config/constants.js';

let voskModel = null;

const webSpeechRecognize = (langCode) =>
  new Promise((resolve, reject) => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return reject(new Error('Speech recognition not supported'));
    const rec = new SR();
    rec.lang = langCode;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) =>
      resolve({ transcript: e.results[0][0].transcript, confidence: e.results[0][0].confidence });
    rec.onerror = (e) => reject(new Error(e.error));
    rec.start();
  });

export const VoskService = {
  async initialize(modelPath) {
    if (voskModel) return;
    try {
      const { createModel } = await import('@vosk/vosk-browser');
      voskModel = await createModel(modelPath);
    } catch {
      console.warn('[Vosk] WASM unavailable — Web Speech API fallback active');
    }
  },

  async recognize(audioBlob, language) {
    const langCode = LANG_CODES[language] ?? 'en-US';
    if (!voskModel) return webSpeechRecognize(langCode);
    const arrayBuffer = await audioBlob.arrayBuffer();
    const result = await voskModel.transcribe(arrayBuffer);
    return { transcript: result.text, confidence: result.confidence ?? 0.8 };
  },

  score(transcript, expected) {
    const clean = (s) => s.toLowerCase().replace(/[¿?¡!.,'"]/g, '').trim();
    const got = clean(transcript).split(/\s+/);
    const exp = clean(expected).split(/\s+/);
    const hits = got.filter((w) => exp.includes(w)).length;
    return Math.round((hits / Math.max(got.length, exp.length)) * 100);
  },
};
