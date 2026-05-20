const BASE = '/data';
const cache = new Map();

const load = async (url) => {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  const data = await res.json();
  cache.set(url, data);
  return data;
};

export const DataService = {
  getConfig: () => load(`${BASE}/config.json`),

  getSentences: (language) => load(`${BASE}/sentences_${language}.json`),

  getSentencesByLevel: async (language, level) => {
    const sentences = await DataService.getSentences(language);
    return sentences.filter((s) => s.zipfLevel <= level);
  },

  getLanguages: async () => {
    const config = await DataService.getConfig();
    return config.languages;
  },

  getSentenceById: async (language, id) => {
    const sentences = await DataService.getSentences(language);
    return sentences.find((s) => s.id === id) ?? null;
  },
};
