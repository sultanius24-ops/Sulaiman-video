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

---

# Juliane Koepcke story — Arabic voiceover, SFX and music

`ArabicStory` composition: the original animated story (`public/arabic-story/source.mp4`) with a new soundtrack (`public/arabic-story/soundtrack.m4a`):

- **Arabic narration**: fully diacritized Modern Standard Arabic script, each line timed to its scene, using the `ar_JO-SA_miro_V2-high` neural voice (Piper / sherpa-onnx, runs locally).
- **Sound design**: storm, rain, thunder, turbulence, explosion, wind while falling, canopy crash, heartbeat, jungle ambience, stream, splashes, snake and crocodile, search plane, fuel pour, boat motor, UI pops and clicks.
- **Score**: follows the story: dark opening, piano journey theme, storm ostinato with taiko hits, silence at the blackout, lonely piano in the jungle, warm theme for the father's advice, build to the rescue and an inspirational ending.
- **Mix**: smart ducking keeps music and effects at least 14 dB under the narration while it speaks, mastered to −14 LUFS.

```bash
npm run render:arabic   # or use the pre-rendered renders/juliane-story-arabic.mp4
```

Regenerate the audio:

```bash
cd audio-pipeline/arabic
python3 -m venv venv && ./venv/bin/pip install sherpa-onnx soundfile scipy numpy
mkdir -p models build && cd models
curl -L https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-ar_JO-SA_miro_V2-high.tar.bz2 | tar xj
cd ..
./venv/bin/python ar_vo.py      # narration → build/vo_raw.wav (edit lines/timings at the top)
./venv/bin/python ar_mix.py     # SFX + score + mix → build/soundtrack.wav
```

Other Arabic voices that work the same way are `vits-piper-ar_JO-SA_dii-high` (female), `vits-piper-ar_JO-SA_miro-high` and `vits-piper-ar_JO-kareem-medium` (male). Pass the folder name to `ar_vo.py`.
