# Setup & Deployment Guide

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18 | https://nodejs.org |
| npm | ≥ 9 | bundled with Node |
| Firebase CLI | ≥ 12 | `npm i -g firebase-tools` |
| Git | any | https://git-scm.com |

---

## Local Development

```bash
# 1. Clone / enter the project
git clone <your-repo-url>
cd language-learning-app

# 2. Install dependencies
npm install

# 3. Download a Vosk model (optional — Web Speech API used as fallback)
cd public/models
wget https://alphacephei.com/vosk/models/vosk-model-small-es-0.42.zip
unzip vosk-model-small-es-0.42.zip
mv vosk-model-small-es-0.42 vosk-model-small-spanish
cd ../..

# 4. Start dev server (COOP/COEP headers included via vite.config.js)
npm run dev
# → http://localhost:5173
```

> **Microphone**: Chrome/Edge will prompt for mic permission on first recording attempt.
> Localhost is treated as a secure context — no HTTPS required locally.

---

## Generate Sample Audio (Optional)

eSpeak NG can generate placeholder audio for all sentences:

```bash
# Install eSpeak NG
sudo apt install espeak-ng   # Linux
brew install espeak           # macOS

# Generate Spanish audio
node scripts/generate-audio.js   # see scripts/ for implementation
```

Or download pre-generated MP3s from the Tatoeba project:
- https://tatoeba.org/en/audio/index

---

## Adding More Sentences

Edit `public/data/sentences_<language>.json` following this schema:

```json
{
  "id": "es_006",
  "text": "¿Tienes mesa para dos?",
  "translation": "Do you have a table for two?",
  "pronunciation": "TYEH-nehs MEH-sah PAH-rah dos",
  "audioUrl": "/audio/es_006.mp3",
  "zipfLevel": 2
}
```

`zipfLevel` values:
- `1` = top 500 words (survival phrases)
- `2` = top 1,000 words (travel vocabulary)
- `3` = top 2,000 words (conversational)
- `4` = top 5,000 words (professional)
- `5` = top 10,000 words (advanced)

---

## Firebase Deployment

```bash
# 1. Log in to Firebase
firebase login

# 2. Create a project at https://console.firebase.google.com
#    (free Spark plan is sufficient for MVP)

# 3. Update .firebaserc with your project ID
#    Replace "your-firebase-project-id" with your actual project ID

# 4. Initialize Firebase (one time)
firebase use --add

# 5. Build and deploy
npm run deploy
# Runs: vite build && firebase deploy

# Your app is live at:
# https://<project-id>.web.app
```

---

## GitHub Actions (CI/CD)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: your-firebase-project-id
```

Add `FIREBASE_SERVICE_ACCOUNT` to GitHub repo secrets (download from Firebase Console → Project Settings → Service Accounts).

---

## Environment Variables

No `.env` file is required for the MVP — all config lives in `public/data/config.json`.

If you later add Firebase Auth or Analytics, create `.env.local`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

Vite exposes only variables prefixed with `VITE_` to the browser bundle.

---

## Troubleshooting

**"SharedArrayBuffer is not defined"** — Missing COOP/COEP headers. Ensure `firebase.json` headers are deployed and the dev server is started via `npm run dev` (not a plain `http-server`).

**"Speech recognition not supported"** — Use Chrome or Edge. Firefox does not implement the Web Speech API.

**Vosk not loading** — Check browser console for the model path. Ensure the model folder name matches the path constructed in `VoskService.initialize()`.

**IndexedDB errors in private/incognito mode** — Safari blocks IndexedDB in private browsing. Use Chrome for development.
