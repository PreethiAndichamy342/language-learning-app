#!/usr/bin/env bash
# download-vosk.sh — Download and set up the Vosk Spanish small model
# Idempotent: skips download if model already exists. Run from project root.
set -euo pipefail

MODEL_DIR="public/models/model"
ZIP_NAME="vosk-model-small-es-0.42.zip"
EXTRACTED="public/models/vosk-model-small-es-0.42"
URL="https://alphacephei.com/vosk/models/$ZIP_NAME"

if [[ -d "$MODEL_DIR/am" && -d "$MODEL_DIR/conf" ]]; then
  echo "✓ Vosk model already present at $MODEL_DIR — skipping download."
  exit 0
fi

echo "Downloading Vosk Spanish small model (~50 MB)..."
wget -q --show-progress -O "public/models/$ZIP_NAME" "$URL"

echo "Extracting..."
unzip -q "public/models/$ZIP_NAME" -d "public/models/"

if [[ -d "$EXTRACTED" ]]; then
  mv "$EXTRACTED" "$MODEL_DIR"
else
  echo "ERROR: Expected extracted folder '$EXTRACTED' not found." >&2
  exit 1
fi

rm -f "public/models/$ZIP_NAME"

# Verify critical subdirectories
for subdir in am conf graph; do
  if [[ -d "$MODEL_DIR/$subdir" ]]; then
    echo "  ✓ $MODEL_DIR/$subdir"
  else
    echo "  ✗ $MODEL_DIR/$subdir (missing — model may be corrupt)" >&2
  fi
done

echo ""
echo "✓ Vosk model ready at $MODEL_DIR/"
