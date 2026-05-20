# Vosk Model Download Instructions

Vosk WASM models are **not committed to git** (large binaries). Download them before running locally.

## Spanish (recommended for MVP)

```bash
cd public/models
wget https://alphacephei.com/vosk/models/vosk-model-small-es-0.42.zip
unzip vosk-model-small-es-0.42.zip
mv vosk-model-small-es-0.42 vosk-model-small-spanish
rm vosk-model-small-es-0.42.zip
```

## Chinese

```bash
wget https://alphacephei.com/vosk/models/vosk-model-small-cn-0.22.zip
unzip vosk-model-small-cn-0.22.zip && mv vosk-model-small-cn-0.22 vosk-model-small-chinese
```

## Swedish

```bash
wget https://alphacephei.com/vosk/models/vosk-model-small-sv-rhasspy-0.15.zip
unzip vosk-model-small-sv-rhasspy-0.15.zip && mv vosk-model-small-sv-rhasspy-0.15 vosk-model-small-swedish
```

## Expected directory structure

```
public/models/
├── vosk-model-small-spanish/
│   ├── am/
│   ├── conf/
│   ├── graph/
│   └── ivector/
├── vosk-model-small-chinese/
└── vosk-model-small-swedish/
```

## Fallback

If no Vosk model is present, the app automatically falls back to the **Web Speech API**
(Chrome/Edge only). This requires an internet connection and sends audio to Google's servers.
Vosk keeps everything local and works offline.

## Model sizes

| Language | Model size | Accuracy |
|----------|-----------|----------|
| Spanish  | ~39 MB    | Good     |
| Chinese  | ~42 MB    | Good     |
| Swedish  | ~29 MB    | Fair     |
