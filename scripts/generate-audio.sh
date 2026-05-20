#!/usr/bin/env bash
# generate-audio.sh — Generate MP3 audio for all sentences using eSpeak-NG + ffmpeg
# Idempotent: skips files that already exist. Run from project root.
set -euo pipefail

AUDIO_DIR="public/audio"
TMPWAV="/tmp/lingua_tmp.wav"
SENTENCES="/tmp/lingua_sentences.txt"
DONE=0; SKIP=0

# Dump all sentences as id|voice|text lines
python3 -c "
import json, os
files = [
  ('public/data/sentences_spanish.json', 'es'),
  ('public/data/sentences_chinese.json', 'cmn'),
  ('public/data/sentences_swedish.json', 'sv'),
]
for path, voice in files:
    for s in json.load(open(path)):
        print(s['id'] + '|' + voice + '|' + s['text'])
" > "$SENTENCES"

TOTAL=$(wc -l < "$SENTENCES")
echo "Generating $TOTAL audio files into $AUDIO_DIR/"

while IFS='|' read -r id voice text; do
  mp3="$AUDIO_DIR/${id}.mp3"
  if [[ -f "$mp3" && -s "$mp3" ]]; then
    SKIP=$((SKIP+1))
    echo "  skip  ${id}.mp3"
    continue
  fi
  espeak-ng -v "$voice" "$text" -w "$TMPWAV" </dev/null 2>/dev/null
  ffmpeg -y -loglevel error -i "$TMPWAV" -acodec libmp3lame -q:a 4 "$mp3" </dev/null
  DONE=$((DONE+1))
  echo "  ✓  ($DONE/$TOTAL) ${id}.mp3"
done < "$SENTENCES"

rm -f "$TMPWAV" "$SENTENCES"
echo ""
echo "Done — generated: $DONE  skipped: $SKIP  total: $TOTAL"
