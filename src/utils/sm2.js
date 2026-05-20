/**
 * SM-2 spaced repetition algorithm.
 * @see https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */
export const SM2 = {
  initial: () => ({ interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: null }),

  /** @param {{ interval: number, repetitions: number, easeFactor: number }} card @param {number} quality 0-5 */
  calculate(card, quality) {
    const q = Math.max(0, Math.min(5, quality));
    let { interval, repetitions, easeFactor } = card;

    if (q < 3) {
      interval = 1;
      repetitions = 0;
    } else {
      if (repetitions === 0) interval = 1;
      else if (repetitions === 1) interval = 6;
      else interval = Math.round(interval * easeFactor);
      repetitions += 1;
    }

    easeFactor = Math.max(
      1.3,
      easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)
    );

    return {
      interval,
      repetitions,
      easeFactor: Math.round(easeFactor * 100) / 100,
      nextReview: new Date(Date.now() + interval * 86_400_000).toISOString(),
    };
  },

  isDue: (card) => !card.nextReview || new Date(card.nextReview) <= new Date(),
};
