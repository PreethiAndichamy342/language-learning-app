# LinguaFlow

> Master languages one sentence at a time — with spaced repetition and offline speech recognition.

## Features

- **Spaced repetition** (SM-2 algorithm) — review sentences at optimal intervals
- **Pronunciation scoring** — speak and get instant feedback (0–100%)
- **Offline speech recognition** — Vosk WASM, no API keys, no data uploaded
- **Zipf progression** — unlock harder vocabulary as you improve
- **Multi-language** — Spanish, Chinese, Swedish (easily extendable)
- **Zero backend** — everything runs in the browser, progress saved locally

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| UI | React 18 | Functional components, fast |
| Styling | Tailwind CSS | Utility-first, no custom CSS |
| Speech recognition | Vosk WASM | Free, offline, private |
| Speech fallback | Web Speech API | Zero setup, Chrome/Edge |
| Storage | IndexedDB (Dexie) | Local-first, no backend needed |
| Hosting | Firebase Hosting | Free CDN, COOP/COEP headers |
| Algorithm | SM-2 | Battle-tested spaced repetition |

## Quick Start

```bash
npm install
npm run dev
# → http://localhost:5173
```

See [docs/SETUP.md](docs/SETUP.md) for Vosk model download and Firebase deployment instructions.

## Project Structure

```
src/
├── components/   # React UI components (≤ 50 lines each)
├── hooks/        # Custom React hooks (business logic)
├── services/     # Data & storage abstraction layer
├── utils/        # Pure functions (SM-2, Zipf)
└── config/       # Constants, no magic numbers
public/data/      # JSON content — edit to add sentences
docs/             # Architecture, setup, API reference
```

## Extending

**Add sentences**: edit `public/data/sentences_<language>.json`

**Add a language**: add to `public/data/config.json` + create a sentences file + add to `LANG_CODES` in `src/config/constants.js`

**Add audio**: drop MP3s into `public/audio/` matching `audioUrl` values in the JSON

## Documentation

- [Architecture Decisions](docs/ARCHITECTURE.md) — why each technology was chosen
- [Setup & Deployment](docs/SETUP.md) — installation, Vosk models, Firebase deploy
- [API & Data Flow](docs/API.md) — service interfaces and data schemas

## License

MIT
