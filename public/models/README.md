# Vosk Speech Recognition Models

## What is Vosk?

[Vosk](https://alphacephei.com/vosk/) is an offline speech recognition toolkit. LinguaFlow uses its
WebAssembly build (`@vosk/vosk-browser`) to transcribe pronunciation attempts **entirely in the browser**
— no audio ever leaves the device.

## Why this specific model: `vosk-model-small-es-0.42`

| Property | Value |
|----------|-------|
| Language | Spanish (Castilian) |
| Size | ~50 MB |
| Accuracy | ~85% WER on clean speech |
| Speed | ~200 ms per utterance (M1 / mid-range Android) |
| License | Apache 2.0 |

**Why small, not large?**
The large Spanish model (~1.4 GB) would require a 1–2 minute download on first use and 1.4 GB of RAM.
The small model downloads in seconds and gives good-enough accuracy for short sentences.

## Setup (automated)

```bash
# From project root
bash scripts/download-vosk.sh
```

The script downloads, extracts, and places the model at `public/models/model/`.

## Setup (manual)

```bash
cd public/models
wget https://alphacephei.com/vosk/models/vosk-model-small-es-0.42.zip
unzip vosk-model-small-es-0.42.zip
mv vosk-model-small-es-0.42 model
rm vosk-model-small-es-0.42.zip
```

## Expected directory layout

```
public/models/model/
├── am/           # Acoustic model (neural network weights)
├── conf/         # Decoder configuration
├── graph/        # Language model graph (HCLG)
├── ivector/      # Speaker adaptation vectors
└── README
```

## Alternative models

| Language | Model name | Size | URL |
|----------|-----------|------|-----|
| Chinese (Mandarin) | vosk-model-small-cn-0.22 | 42 MB | alphacephei.com/vosk/models |
| Swedish | vosk-model-small-sv-rhasspy-0.15 | 29 MB | alphacephei.com/vosk/models |
| English | vosk-model-small-en-us-0.15 | 40 MB | alphacephei.com/vosk/models |

To add a language, download its model and update `VoskService.initialize()` path in `src/services/vosk.js`.

## Fallback behaviour

If no Vosk model is present (or the browser doesn't support `SharedArrayBuffer`),
the app automatically falls back to the **Web Speech API**:
- Requires Chrome or Edge (Firefox not supported)
- Requires internet connection (audio sent to Google)
- No model download needed

## Troubleshooting

**"SharedArrayBuffer is not defined"** — The server is missing COOP/COEP headers.
Use `npm run dev` (Vite sets these automatically) or ensure Firebase headers are deployed.

**Model loads but recognition is poor** — Speak clearly, close to the microphone.
Short sentences (< 10 words) work best with the small model.

**"Cannot read model"** — Verify `public/models/model/am/` exists.
Re-run `bash scripts/download-vosk.sh` if the directory is missing or empty.

**Chinese/Swedish recognition** — The included model is Spanish-only.
Download the appropriate model and update the model path to enable other languages.
