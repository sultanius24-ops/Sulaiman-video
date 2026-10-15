# Generate narration for one language and write the timeline the Remotion scenes read.
# usage: python voice.py en|ar MODELS_DIR
import json, os, re, sys
import numpy as np, soundfile as sf
from spec import SCENES

LANG, MODELS = sys.argv[1], sys.argv[2]
EDGE_VOICE = sys.argv[sys.argv.index("--edge") + 1] if "--edge" in sys.argv else None
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
BUILD = os.path.join(HERE, "build", LANG); os.makedirs(BUILD, exist_ok=True)

BOUNDS = None  # per-line word timings (seconds) when the engine provides them
if EDGE_VOICE:
    # Microsoft neural voice via edge-tts; returns audio plus exact word timings.
    import asyncio, subprocess, tempfile, edge_tts
    from gulf import GULF
    def synth(text):
        global BOUNDS
        async def run():
            com = edge_tts.Communicate(text, EDGE_VOICE, boundary="WordBoundary", proxy=os.environ.get("HTTPS_PROXY"))
            audio, words = bytearray(), []
            async for ch in com.stream():
                if ch["type"] == "audio": audio.extend(ch["data"])
                elif ch["type"] == "WordBoundary": words.append((ch["text"], ch["offset"] / 1e7))
            return bytes(audio), words
        audio, words = asyncio.run(run())
        with tempfile.NamedTemporaryFile(suffix=".mp3") as f:
            f.write(audio); f.flush()
            pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", f.name, "-f", "f32le", "-ac", "1", "-ar", "24000", "-"], capture_output=True, check=True).stdout
        BOUNDS = words
        return np.frombuffer(pcm, np.float32).copy(), 24000
elif LANG == "en":
    from kokoro_onnx import Kokoro
    k = Kokoro(f"{MODELS}/kokoro-v1.0.onnx", f"{MODELS}/voices-v1.0.bin")
    def synth(text):
        a, sr = k.create(text, voice="af_heart", speed=1.0, lang="en-us"); return np.asarray(a, np.float32), sr
else:
    import glob, sherpa_onnx
    d = f"{MODELS}/vits-piper-ar_JO-SA_miro_V2-high"
    tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
        vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=glob.glob(d + "/*.onnx")[0], tokens=d + "/tokens.txt", data_dir=d + "/espeak-ng-data"), num_threads=4)))
    def synth(text):
        a = tts.generate(text, sid=0, speed=1.0); return np.asarray(a.samples, np.float32), a.sample_rate

HARAKAT = re.compile("[ً-ٰٟـ]")
def plain(w): return re.sub(r"[^\w]", "", HARAKAT.sub("", w)).lower()
def trim(a):
    thr = 0.015 * np.abs(a).max(); idx = np.where(np.abs(a) > thr)[0]
    lead = max(0, idx[0] - 200)
    return a[lead:idx[-1] + 1200], lead

LEAD, LINE_GAP, COMMA_GAP, SCENE_GAP, TAIL = 0.6, 0.38, 0.18, 1.0, 3.2
chunks, t, sr = [], LEAD, None
scenes, lines = [], []
for sc in SCENES:
    s_start = max(0.0, t - 0.55)
    cues = {}
    gulf = GULF[sc["id"]] if EDGE_VOICE else None
    if gulf: assert len(gulf) == len(sc["lines"]), sc["id"]
    for li, ln in enumerate(sc["lines"]):
        text = gulf[li][0] if gulf else ln[LANG]
        a, sr = synth(text); a, lead = trim(a); d = len(a) / sr
        lines.append(dict(scene=sc["id"], start=round(t, 3), end=round(t + d, 3)))
        if ln.get("cue"): cues[ln["cue"]] = round(t, 3)
        if gulf:
            for name, word in gulf[li][1].items():
                hit = [o for w, o in BOUNDS if plain(w).startswith(plain(word))]
                if not hit: raise SystemExit(f"keyword {word} not found in: {text}")
                cues[name] = round(t + max(0.0, hit[0] - lead / sr), 3)
            chunks.append((t, a))
            t += d + (COMMA_GAP if text.rstrip().endswith(("،", ",")) else LINE_GAP)
            continue
        words = text.split(); weights = [len(plain(w)) + 1 for w in words]; total = sum(weights)
        for name, kws in ln.get("kw", {}).items():
            kw = plain(kws[0] if LANG == "en" else kws[1]); acc = 0
            for w, wt in zip(words, weights):
                if plain(w).startswith(kw): cues[name] = round(t + d * acc / total, 3); break
                acc += wt
            else: raise SystemExit(f"keyword {kws} not found in: {text}")
        chunks.append((t, a))
        t += d + (COMMA_GAP if text.rstrip().endswith(",") or text.rstrip().endswith("،") else LINE_GAP)
    t += SCENE_GAP - LINE_GAP
    scenes.append(dict(id=sc["id"], start=round(s_start, 3), cues=cues))
total = round(t - SCENE_GAP + TAIL, 2)
for i, s in enumerate(scenes): s["end"] = scenes[i + 1]["start"] if i + 1 < len(scenes) else total

out = np.zeros(int(total * sr) + sr, np.float32)
for st, a in chunks: i = int(st * sr); out[i:i + len(a)] += a
sf.write(f"{BUILD}/vo_raw.wav", out[:int(total * sr)], sr)

# On-screen content for this language (texts resolved to LANG)
def resolve(v):
    if isinstance(v, dict) and set(v) >= {"en", "ar"} and len(v) <= 2: return v[LANG]
    if isinstance(v, dict): return {k: resolve(x) for k, x in v.items() if k not in ("lines",)}
    if isinstance(v, list): return [resolve(x) for x in v]
    return v
content = [resolve({k: v for k, v in sc.items() if k != "lines"}) for sc in SCENES]
os.makedirs(f"{ROOT}/src/nino", exist_ok=True)
json.dump(dict(lang=LANG, fps=30, total=total, scenes=scenes, content=content, lines=lines),
          open(f"{ROOT}/src/nino/timeline.{LANG}.json", "w"), ensure_ascii=False, indent=1)
print(LANG, "total", total)
for s in scenes: print(f"  {s['id']:8s} {s['start']:7.2f} → {s['end']:7.2f}  cues {s['cues']}")
