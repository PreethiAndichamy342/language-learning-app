/**
 * Zipf-based difficulty progression.
 * Lower Zipf level = higher frequency = easier vocabulary.
 */
export const Zipf = {
  /** Returns current unlocked level based on total correct answers. */
  getLevel: (totalCorrect, config) => {
    const { sentencesPerLevel, zipfLevels } = config;
    const level = Math.floor(totalCorrect / sentencesPerLevel) + 1;
    return Math.min(level, Math.max(...zipfLevels));
  },

  filterByLevel: (sentences, level) =>
    sentences.filter((s) => s.zipfLevel <= level),

  /** 0-100 progress toward unlocking next level. */
  progressToNextLevel: (totalCorrect, currentLevel, config) => {
    const { sentencesPerLevel } = config;
    const start = (currentLevel - 1) * sentencesPerLevel;
    const progress = ((totalCorrect - start) / sentencesPerLevel) * 100;
    return Math.min(100, Math.max(0, Math.round(progress)));
  },

  nextLevelThreshold: (currentLevel, config) =>
    currentLevel * config.sentencesPerLevel,
};
