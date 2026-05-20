#!/usr/bin/env bash
# verify-setup.sh — Check all app components are in place before running
# Run from project root.
set -euo pipefail

AUDIO_DIR="public/audio"
MODEL_DIR="public/models/model"
PASS=0; FAIL=0

check() {
  local label="$1" path="$2"
  if [[ -e "$path" && -s "$path" ]]; then
    local size; size=$(du -sh "$path" 2>/dev/null | cut -f1)
    echo "  ✓  $label ($size)"
    PASS=$((PASS+1))
  else
    echo "  ✗  $label — NOT FOUND or empty"
    FAIL=$((FAIL+1))
  fi
}

checkdir() {
  local label="$1" path="$2"
  if [[ -d "$path" ]]; then
    local count; count=$(find "$path" -type f | wc -l)
    echo "  ✓  $label ($count files)"
    PASS=$((PASS+1))
  else
    echo "  ✗  $label — MISSING"
    FAIL=$((FAIL+1))
  fi
}

echo "=== Audio Files ==="
for id in es_001 es_002 es_003 es_004 es_005 \
           zh_001 zh_002 zh_003 zh_004 zh_005 \
           sv_001 sv_002 sv_003 sv_004 sv_005; do
  check "$id.mp3" "$AUDIO_DIR/${id}.mp3"
done

echo ""
echo "=== Vosk Model ==="
checkdir "model root"  "$MODEL_DIR"
checkdir "acoustic model (am/)" "$MODEL_DIR/am"
checkdir "config (conf/)"       "$MODEL_DIR/conf"
checkdir "graph/"               "$MODEL_DIR/graph"

echo ""
echo "=== Data Files ==="
check "config.json"           "public/data/config.json"
check "sentences_spanish.json" "public/data/sentences_spanish.json"
check "sentences_chinese.json" "public/data/sentences_chinese.json"
check "sentences_swedish.json" "public/data/sentences_swedish.json"

echo ""
TOTAL=$((PASS+FAIL))
if [[ $FAIL -eq 0 ]]; then
  echo "✓ All $TOTAL checks passed — app is ready to run (npm run dev)"
else
  echo "✗ $FAIL/$TOTAL checks failed — run missing setup steps before starting"
  exit 1
fi
