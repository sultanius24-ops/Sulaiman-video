#!/usr/bin/env bash
# Render a composition in frame chunks (video only), join them, then mux the full soundtrack.
# usage: ./scripts-render-chunked.sh <CompositionId> <soundtrack.wav> <out.mp4> [chunk_frames]
set -euo pipefail
COMP=$1; AUDIO=$2; OUT=$3; CHUNK=${4:-1500}
BROWSER=${REMOTION_BROWSER:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
TMP=$(mktemp -d)
TOTAL=$(npx remotion compositions --browser-executable="$BROWSER" 2>/dev/null | awk -v c="$COMP" '$1==c {print $4}')
[ -n "$TOTAL" ] || { echo "could not read duration of $COMP"; exit 1; }
echo "$COMP: $TOTAL frames"
npx remotion bundle --out-dir="$TMP/bundle" --log=error >/dev/null
i=0; start=0; : > "$TMP/list.txt"
while [ $start -lt $TOTAL ]; do
  end=$(( start + CHUNK - 1 )); [ $end -ge $TOTAL ] && end=$(( TOTAL - 1 ))
  part="$TMP/part$(printf %03d $i).mp4"
  for attempt in 1 2; do
    if npx remotion render "$TMP/bundle" "$COMP" "$part" --frames=$start-$end --muted --browser-executable="$BROWSER" \
         --concurrency=4 --timeout=120000 --log=error > "$TMP/log$i.txt" 2>&1; then break; fi
    echo "chunk $i failed (attempt $attempt):"; grep -iE "error" "$TMP/log$i.txt" | head -2
    [ $attempt -eq 2 ] && exit 1
  done
  echo "file '$part'" >> "$TMP/list.txt"; echo "chunk $i done ($start-$end)"
  start=$(( end + 1 )); i=$(( i + 1 ))
done
ffmpeg -v error -y -f concat -safe 0 -i "$TMP/list.txt" -i "$AUDIO" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "$OUT"
rm -rf "$TMP"
echo "wrote $OUT"
