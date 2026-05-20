import { useState, useEffect, useCallback } from 'react';
import { DataService } from '../services/data.js';
import { Storage } from '../services/storage.js';
import { VoskService } from '../services/vosk.js';
import { SM2 } from '../utils/sm2.js';
import { Zipf } from '../utils/zipf.js';

const enrichProgress = (prog, config) => {
  const level = Zipf.getLevel(prog.totalCorrect ?? 0, config);
  return { ...prog, currentLevel: level, levelProgress: Zipf.progressToNextLevel(prog.totalCorrect ?? 0, level, config) };
};

const pickCard = async (available, language, level) => {
  const due = await Storage.getDueCards(language, level);
  const dueSet = new Set(due.map((d) => d.id));
  return available.find((s) => dueSet.has(s.id)) ?? available[Math.floor(Math.random() * available.length)];
};

export function useApp() {
  const [config, setConfig] = useState(null);
  const [language, setLanguage] = useState('spanish');
  const [card, setCard] = useState(null);
  const [sentences, setSentences] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    DataService.getConfig()
      .then((cfg) => { setConfig(cfg); setLanguage(cfg.defaultLanguage); })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!config) return;
    setLoading(true);
    Promise.all([Storage.getProgress(language), DataService.getSentences(language)])
      .then(async ([prog, all]) => {
        const computed = enrichProgress(prog, config);
        setSentences(all);
        setProgress(computed);
        setCard(await pickCard(Zipf.filterByLevel(all, computed.currentLevel), language, computed.currentLevel));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [language, config]);

  const onRecordingResult = useCallback(async (quality) => {
    if (!card || !config) return;
    const base = (await Storage.getCard(card.id)) ?? { id: card.id, language, zipfLevel: card.zipfLevel, ...SM2.initial() };
    await Storage.saveCard({ ...base, ...SM2.calculate(base, quality) });
    const prog = await Storage.getProgress(language);
    const updated = { ...prog, language, totalCorrect: (prog.totalCorrect ?? 0) + (quality >= 3 ? 1 : 0), totalReviewed: (prog.totalReviewed ?? 0) + 1 };
    await Storage.saveProgress(updated);
    const computed = enrichProgress(updated, config);
    setProgress(computed);
    setCard(await pickCard(Zipf.filterByLevel(sentences, computed.currentLevel), language, computed.currentLevel));
  }, [card, language, config, sentences]);

  const onPlayAudio = useCallback((audioUrl) => {
    new Audio(audioUrl).play().catch(console.error);
  }, []);

  const onLanguageChange = useCallback((lang) => {
    setLanguage(lang);
    VoskService.initialize(`/models/vosk-model-small-${lang}.zip`);
  }, []);

  return {
    state: { card, progress, language, loading, error },
    handlers: { onRecordingResult, onPlayAudio, onLanguageChange },
  };
}
