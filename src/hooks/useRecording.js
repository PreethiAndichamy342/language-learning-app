import { useState, useRef, useCallback } from 'react';
import { VoskService } from '../services/vosk.js';
import { SCORE_THRESHOLDS, FEEDBACK } from '../config/constants.js';

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
  const chunksRef = useRef([]);

  const start = useCallback(async (e) => {
    e?.preventDefault();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      mediaRef.current.ondataavailable = (ev) => chunksRef.current.push(ev.data);
      mediaRef.current.start();
      setIsRecording(true);
      setScore(null);
    } catch {
      setFeedback(FEEDBACK.ERROR);
    }
  }, []);

  const stop = useCallback(async (e) => {
    e?.preventDefault();
    if (!mediaRef.current || mediaRef.current.state === 'inactive') return;
    mediaRef.current.stop();
    mediaRef.current.stream.getTracks().forEach((t) => t.stop());
    setIsRecording(false);

    mediaRef.current.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      try {
        const { transcript } = await VoskService.recognize(blob, language);
        const s = VoskService.score(transcript, card.text);
        setScore(s);
        setFeedback(getFeedback(s));
      } catch {
        setFeedback(FEEDBACK.ERROR);
      }
    };
  }, [card, language]);

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
