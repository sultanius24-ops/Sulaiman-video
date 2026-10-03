# From Code to Output — Remotion video

A vertical (1080×1920, 30fps) explainer about what happens after you run `print("Hello")`. It has motion graphics, a natural-sounding voiceover, music, sound effects and word-by-word captions.

## Render

```bash
npm install
npm run studio   # live preview / editing
npm run render   # → out/code-to-output.mp4
```

## Project layout

- `src/scenes/` — one file per scene (Intro, Interpreter, Binary, Ram, Cpu, Output, Summary)
- `src/components/` — background, scene transitions, headings, captions, SVG illustrations (CPU, RAM, gears, windows)
- `src/timeline.json` — scene boundaries, animation cues and per-word voice timings (generated)
- `public/audio/soundtrack.wav` — final mix (voice + music + SFX)
- `public/fonts/` — Plus Jakarta Sans, Inter, JetBrains Mono

## Regenerating the voiceover / audio

The voice uses [Kokoro](https://github.com/thewh1teagle/kokoro-onnx), an open-source TTS model that runs locally (voice `af_heart`).

```bash
cd audio-pipeline
python3 -m venv venv && ./venv/bin/pip install kokoro-onnx soundfile scipy numpy
mkdir -p models && cd models
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -LO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
cd ..
./venv/bin/python vo.py      # narration → vo_raw.wav + vo.json  (edit the script lines / voice here)
./venv/bin/python words.py   # word timings → words.json
./venv/bin/python build.py   # timeline.json + music, SFX, final mix → public/audio/soundtrack.wav
```

Requires `ffmpeg` on the PATH.
