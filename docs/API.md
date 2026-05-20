# API & Data Flow Documentation

## Service Layer

All data access is routed through `src/services/`. Components and hooks **never** call `fetch()` or `Dexie` directly. This abstraction enables a future migration to a REST or Firebase backend without touching UI code.

---

## DataService (`src/services/data.js`)

Loads static JSON files from `public/data/`. All methods return Promises and are cached in memory.

### `DataService.getConfig() → Promise<Config>`

```js
// Returns:
{
  languages: ['spanish', 'chinese', 'swedish'],
  defaultLanguage: 'spanish',
  zipfLevels: [1, 2, 3, 4, 5],
  audioPath: '/audio',
  modelsPath: '/models',
  sentencesPerLevel: 50
}
```

### `DataService.getSentences(language) → Promise<Sentence[]>`

Returns all sentences for a language. Cached after first fetch.

```js
// Sentence shape:
{
  id: 'es_001',          // unique identifier
  text: '¿Dónde está el baño?',
  translation: 'Where is the bathroom?',
  pronunciation: 'DOHN-deh eh-STAH el BAH-nyoh',
  audioUrl: '/audio/es_001.mp3',
  zipfLevel: 1           // 1 (easiest) to 5 (hardest)
}
```

### `DataService.getSentencesByLevel(language, level) → Promise<Sentence[]>`

Filters sentences where `zipfLevel <= level`.

### `DataService.getLanguages() → Promise<string[]>`

Returns `config.languages`.

**Future API migration**: replace `load(url)` with `apiFetch(endpoint)` — interface unchanged.

---

## Storage Service (`src/services/storage.js`)

Wraps Dexie (IndexedDB). All methods return Promises.

### `Storage.getCard(id) → Promise<CardRecord | undefined>`

### `Storage.saveCard(card) → Promise`

```js
// CardRecord shape:
{
  id: 'es_001',
  language: 'spanish',
  zipfLevel: 1,
  interval: 6,           // days until next review
  repetitions: 2,        // successful review streak
  easeFactor: 2.5,       // SM-2 ease factor
  nextReview: '2026-05-25T10:00:00.000Z'
}
```

### `Storage.getDueCards(language, level) → Promise<CardRecord[]>`

Returns cards whose `nextReview` is in the past (or null) filtered by language and max level.

### `Storage.getProgress(language) → Promise<ProgressRecord>`

```js
// ProgressRecord shape:
{
  language: 'spanish',
  totalCorrect: 42,
  totalReviewed: 60
}
```

### `Storage.saveProgress(progress) → Promise`

### `Storage.exportData() → Promise<string>`

Returns a JSON string containing all cards and progress records.

### `Storage.importData(json) → Promise`

Bulk-inserts exported data. Safe to call multiple times (uses `bulkPut`).

---

## VoskService (`src/services/vosk.js`)

Manages offline speech recognition.

### `VoskService.initialize(modelPath) → Promise<void>`

Loads the Vosk WASM model from `modelPath`. Falls back silently if Vosk is unavailable.
Call once on language change.

### `VoskService.recognize(audioBlob, language) → Promise<{ transcript: string, confidence: number }>`

Transcribes an audio Blob. Uses Vosk if initialized, otherwise delegates to Web Speech API.

### `VoskService.score(transcript, expected) → number`

Returns 0–100 pronunciation score based on word-level overlap.

```js
VoskService.score('donde esta el banyo', '¿Dónde está el baño?') // → 100
VoskService.score('donde esta', '¿Dónde está el baño?')         // → 50
```

---

## SM2 Algorithm (`src/utils/sm2.js`)

Pure functions — no state, no side effects.

### `SM2.initial() → CardRecord`

Returns default card state: `{ interval: 1, repetitions: 0, easeFactor: 2.5, nextReview: null }`.

### `SM2.calculate(card, quality) → Partial<CardRecord>`

`quality` is 0–5:
- 5: Perfect response
- 4: Correct with slight hesitation
- 3: Correct with difficulty
- 2: Incorrect — easy to recall
- 1: Incorrect — hard to recall
- 0: Complete blackout

Returns updated `{ interval, repetitions, easeFactor, nextReview }`.

### `SM2.isDue(card) → boolean`

Returns `true` if `card.nextReview` is in the past or null.

---

## Zipf Utilities (`src/utils/zipf.js`)

### `Zipf.getLevel(totalCorrect, config) → number`

Returns current unlocked level (1–5) based on total correct answers.

### `Zipf.filterByLevel(sentences, level) → Sentence[]`

Returns sentences where `zipfLevel <= level`.

### `Zipf.progressToNextLevel(totalCorrect, currentLevel, config) → number`

Returns 0–100 percentage progress toward unlocking the next level.

---

## Data File Schema

### `public/data/config.json`

| Field | Type | Description |
|-------|------|-------------|
| `languages` | `string[]` | Available language codes |
| `defaultLanguage` | `string` | Language loaded on first visit |
| `zipfLevels` | `number[]` | Level numbers (e.g. `[1,2,3,4,5]`) |
| `audioPath` | `string` | Base path for audio files |
| `modelsPath` | `string` | Base path for Vosk models |
| `sentencesPerLevel` | `number` | Correct answers needed to unlock next level |

### `public/data/sentences_<language>.json`

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique ID, format `<lang>_<NNN>` |
| `text` | `string` | Native language sentence |
| `translation` | `string` | English translation |
| `pronunciation` | `string` | Phonetic guide (IPA or respelling) |
| `audioUrl` | `string` | Path to MP3 relative to public root |
| `zipfLevel` | `number` | Difficulty level 1–5 |
