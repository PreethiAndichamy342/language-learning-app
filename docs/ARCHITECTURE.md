# Architecture Decision Record

## System Overview

LinguaFlow is a client-only Progressive Web App. No backend server is required for the MVP.
All data lives in the browser; all ML inference runs in WebAssembly.

```
Browser
├── React 18 (UI)
├── Vosk WASM (speech recognition, offline)
├── Web Speech API (fallback, online)
├── Dexie.js → IndexedDB (persistence)
└── fetch() → /public/data/*.json (content)
```

---

## Technology Decisions

### Firebase Hosting (not Vercel/Netlify)
- **Free tier**: 10 GB storage, 360 MB/day transfer — sufficient for MVP
- **CDN by default**: assets served from 90+ PoPs globally
- **CORS headers**: trivial to configure per-path in `firebase.json`
- **COOP/COEP headers**: required for `SharedArrayBuffer` (Vosk WASM threads) — Firebase supports these natively
- **Future path**: Firebase Auth + Firestore + Cloud Functions are one `firebase init` away

### Vosk WebAssembly (not Whisper API / Google STT)
| Concern | Vosk WASM | Whisper API |
|---------|-----------|-------------|
| Cost | $0 forever | ~$0.006/min |
| Privacy | 100% local | Audio uploaded |
| Latency | ~200 ms | ~1–3 s RTT |
| Offline | Yes | No |
| Accuracy | Good (small model) | Excellent |

At 1,000 DAU × 20 recordings/day × 5 s avg = 100,000 min/day → $600/day with Whisper.
Vosk eliminates this cost entirely.

### IndexedDB via Dexie.js (not Firestore / SQLite)
- **Zero infrastructure**: no database to provision or pay for
- **Dexie**: typed IndexedDB wrapper with Promise API — 15 KB gzipped
- **Export/import**: `Storage.exportData()` lets users back up to a file
- **Migration path**: `Storage` service is fully abstracted; swap to Firestore by changing the service implementation only

### Tatoeba sentences (not GPT-generated)
- Open database of 10M+ human-verified sentence pairs
- CC-BY 2.0 license — safe for commercial use with attribution
- Native speaker audio available via the Tatoeba API

### eSpeak NG TTS (planned audio generation)
- Open-source, runs locally — no API cost
- Supports Spanish, Mandarin, Swedish natively
- Generate all MP3s once at build time, commit to `public/audio/`
- Command: `espeak-ng -v es "¿Dónde está el baño?" -w public/audio/es_001.wav`

### SM-2 Spaced Repetition (not Leitner / FSRS)
- Battle-tested (Anki uses it for 50M+ users)
- Simple enough to fit in 40 lines — easy to audit and tune
- **Future**: upgrade to FSRS-4.5 for 20% fewer reviews at same retention

### Zipf Frequency Progression
- Zipf's law: the Nth most common word appears 1/N as often as the most common
- Levels 1–5 map roughly to the top 500 / 1K / 2K / 5K / 10K words
- Users are gated to lower levels until mastery; prevents overwhelm

---

## Data Flow

```
App boot
  └─ DataService.getConfig()          → /data/config.json
  └─ DataService.getSentences(lang)   → /data/sentences_<lang>.json
  └─ Storage.getProgress(lang)        → IndexedDB

Review loop
  └─ Zipf.filterByLevel()             → candidate sentences
  └─ Storage.getDueCards()            → SM-2 due filter
  └─ CardDisplay renders sentence
  └─ Recording captures audio
  └─ VoskService.recognize()          → transcript + confidence
  └─ VoskService.score()              → pronunciation %
  └─ SM2.calculate()                  → next interval
  └─ Storage.saveCard()               → IndexedDB
  └─ Storage.saveProgress()           → IndexedDB
```

---

## Cost Analysis

### MVP ($0/month)
- Firebase Hosting free tier (10 GB, 360 MB/day)
- Vosk WASM (local inference)
- IndexedDB (browser storage)
- Static JSON files

### At Scale — 10K DAU ($15–30/month)
| Service | Cost |
|---------|------|
| Firebase Hosting (CDN) | ~$3 |
| Firestore (progress sync) | ~$8 |
| Cloud Functions (optional scoring) | ~$5 |
| Firebase Auth | Free |
| **Total** | **~$16/month** |

Speech recognition stays at $0 with Vosk regardless of scale.

---

## Migration Path (MVP → Production)

1. **Auth**: Add `firebase/auth` — one `signInWithGoogle()` call
2. **Sync**: Replace `Storage` service with Firestore — same interface, cloud-backed
3. **Admin**: Add Cloud Function to manage sentence packs — DataService unchanged
4. **Audio CDN**: Move MP3s to Firebase Storage with signed URLs
5. **Analytics**: Firebase Analytics — one `logEvent()` per card review

No component code changes required for steps 1–4. The service abstraction layer absorbs all infrastructure changes.

---

## Future Roadmap

- [ ] FSRS-4.5 algorithm upgrade (better retention)
- [ ] Tatoeba API integration (live sentence sync)
- [ ] Sentence pack marketplace
- [ ] Multiplayer pronunciation challenges
- [ ] Waveform visualization during recording
- [ ] Offline PWA (service worker caching)
- [ ] Native mobile via Capacitor (same codebase)
