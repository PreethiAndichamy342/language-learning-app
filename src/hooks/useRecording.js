import { useState, useRef, useCallback } from 'react';
import { VoskService } from '../services/vosk.js';
import { LANG_CODES, SCORE_THRESHOLDS, FEEDBACK } from '../config/constants.js';

const getFeedback = (score) => {
  if (score >= SCORE_THRESHOLDS.EXCELLENT) return FEEDBACK.EXCELLENT;
  if (score >= SCORE_THRESHOLDS.GOOD) return FEEDBACK.GOOD;
  return FEEDBACK.PRACTICE;
};

export function useRecording(card, language, onResult) {
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState(null);
  const [feedback, setFeedback] = useState('');
  const mediaRef = useRef(null);
  const speechRef = useRef(null);
  const chunksRef = useRef([]);
  const transcriptRef = useRef('');

  // Web Speech API — runs live alongside the recording for the fallback path
  const startWebSpeech = useCallback(() => {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = LANG_CODES[language] ?? 'es-ES';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (ev) => {
      transcriptRef.current = Array.from(ev.results).map((r) => r[0].transcript).join(' ');
    };
    rec.onerror = () => {};
    rec.start();
    speechRef.current = rec;
  }, [language]);

  const start = useCallback(async (e) => {
    e?.preventDefault();
    transcriptRef.current = '';
    if (!VoskService.isReady()) startWebSpeech();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRef.current.ondataavailable = (ev) => chunksRef.current.push(ev.data);
      mediaRef.current.start();
      setIsRecording(true);
      setScore(null);
    } catch { setFeedback(FEEDBACK.ERROR); }
  }, [startWebSpeech]);

  const stop = useCallback(async (e) => {
    e?.preventDefault();
    if (!mediaRef.current || mediaRef.current.state === 'inactive') return;
    speechRef.current?.stop();
    speechRef.current = null;
    mediaRef.current.stop();
    mediaRef.current.stream.getTracks().forEach((t) => t.stop());
    setIsRecording(false);

    mediaRef.current.onstop = async () => {
      try {
        let transcript = transcriptRef.current;
        if (VoskService.isReady()) {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          ({ transcript } = await VoskService.recognize(blob));
        }
        if (!transcript?.trim()) { setFeedback(FEEDBACK.ERROR); return; }
        const s = VoskService.score(transcript, card.text);
        setScore(s);
        setFeedback(getFeedback(s));
      } catch { setFeedback(FEEDBACK.ERROR); }
    };
  }, [card]);

  const submit = useCallback(() => {
    if (score === null) return;
    const quality = score >= SCORE_THRESHOLDS.EXCELLENT ? 5
      : score >= SCORE_THRESHOLDS.GOOD ? 4
      : score >= 40 ? 2 : 1;
    onResult(quality);
    setScore(null);
    setFeedback('');
  }, [score, onResult]);

  return { isRecording, score, feedback, start, stop, submit };
}
