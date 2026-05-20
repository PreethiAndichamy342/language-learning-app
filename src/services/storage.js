import Dexie from 'dexie';

const db = new Dexie('LinguaFlow');
db.version(1).stores({
  cards: 'id, language, zipfLevel, nextReview',
  progress: 'language',
});

export const Storage = {
  getCard: (id) => db.cards.get(id),

  saveCard: (card) => db.cards.put(card),

  getDueCards: (language, level) => {
    const now = new Date().toISOString();
    return db.cards
      .where('language').equals(language)
      .and((c) => c.zipfLevel <= level && (!c.nextReview || c.nextReview <= now))
      .toArray();
  },

  getProgress: async (language) =>
    (await db.progress.get(language)) ??
    { language, totalCorrect: 0, totalReviewed: 0 },

  saveProgress: (progress) => db.progress.put(progress),

  exportData: async () => {
    const [cards, progress] = await Promise.all([
      db.cards.toArray(),
      db.progress.toArray(),
    ]);
    return JSON.stringify({ cards, progress, exportedAt: new Date().toISOString() });
  },

  importData: async (json) => {
    const { cards, progress } = JSON.parse(json);
    await Promise.all([db.cards.bulkPut(cards), db.progress.bulkPut(progress)]);
  },

  clearLanguage: (language) =>
    Promise.all([
      db.cards.where('language').equals(language).delete(),
      db.progress.delete(language),
    ]),
};
