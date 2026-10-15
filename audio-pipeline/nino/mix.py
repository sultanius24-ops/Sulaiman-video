# Sound design, score and final mix for one language of the El Niño video.
# usage: python mix.py en|ar   (after voice.py)
import json, os, subprocess, sys
import numpy as np, soundfile as sf
from scipy.signal import fftconvolve
import sfxlib as L

LANG = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
BUILD = f"{HERE}/build/{LANG}"
tl = json.load(open(f"{ROOT}/src/nino/timeline.{LANG}.json"))
TOTAL = tl["total"]; L.setup(TOTAL); SR, N, T, noise, norm = L.SR, L.N, L.T, L.noise, L.norm
rng = np.random.default_rng(5)
S = {s["id"]: s for s in tl["scenes"]}
def cue(sid, name): return S[sid]["cues"].get(name, S[sid]["start"])

sfx, amb, mus = L.Bus(), L.Bus(), L.Bus(); L.mus = mus

# ---------- extra effects ----------
def ratchet(n=6, gap=0.07):
    out = np.zeros(int((n * gap + 0.1) * SR))
    for k in range(n):
        c = L.click() * 0.8; i = int(k * gap * SR); out[i:i + len(c)] += c
    return L.hp(out, 1500)
def snip():
    t = T(0.12); x = L.hp(noise(0.12), 3000) * np.exp(-t / 0.015) + np.sin(2 * np.pi * 3200 * t) * np.exp(-t / 0.02) * 0.4
    return norm(x)
def thud(f=90):
    return norm(L.lp(L.boom(0.5, f), 500))
def squelch(d=1.2):
    t = T(d); x = L.sweep_bp(noise(d), 500, 1400, 0.15) * (0.6 + 0.4 * np.sin(2 * np.pi * 6 * t))
    return norm(x * L.fade(np.ones_like(t), 0.1, 0.3))
def nope():
    t = T(0.32); x = np.zeros_like(t)
    for k, f in enumerate((330, 262)):
        tt = np.clip(t - k * 0.13, 0, None); on = t >= k * 0.13
        x += on * np.sign(np.sin(2 * np.pi * f * tt)) * 0.25 * np.exp(-tt * 14)
    return L.lp(x, 2500)
def ding():
    return L.chime((84, 91), 1.4)
def notify():
    return L.chime((88, 95, 100), 1.2)
def tick(n=6, gap=0.5):
    out = np.zeros(int((n * gap + 0.2) * SR))
    for k in range(n):
        tt = T(0.03); c = np.sin(2 * np.pi * (2400 if k % 2 else 1800) * tt) * np.exp(-tt / 0.006)
        i = int(k * gap * SR); out[i:i + len(c)] += c
    return out
def zipper(d=0.8):
    x = np.zeros(int(d * SR)); k = 0; t = 0.0
    while t < d - 0.01:
        c = L.hp(noise(0.006), 2500) * np.exp(-T(0.006) / 0.002); i = int(t * SR); x[i:i + len(c)] += c
        t += 0.012 + 0.006 * np.sin(k * 0.4); k += 1
    return norm(x)
def ring():
    t = T(1.6); g = ((t % 0.4) < 0.25) & (t < 1.5)
    return (np.sin(2 * np.pi * 440 * t) + np.sin(2 * np.pi * 480 * t)) * 0.5 * g * 0.6
def powerup(d=0.6):
    t = T(d); f = 300 * 2 ** (2.5 * t / d)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * 0.6
def flood(d):
    x = L.bp(noise(d), 120, 1800) * 1.0 + L.stream(d) * 0.5 + L.lp(noise(d), 200) * 0.6
    return norm(x)

# ---------- SFX timeline ----------
sfx.add(L.pop(700, 350), 0.15, 0.3)
ids = [s["id"] for s in tl["scenes"]]
for sid in ids[1:]: sfx.add(L.whoosh(0.7), S[sid]["start"] - 0.3, 0.32)
# kicker pops
for sid in ids: sfx.add(L.pop(900, 500, 0.12), S[sid]["start"] + 0.2, 0.18)
# hook
sfx.add(L.whoosh(0.6, 400, 3000), cue("hook", "title") - 0.1, 0.18)
sfx.add(L.pop(800, 400), cue("hook", "dates"), 0.28)
sfx.add(L.thunder(4), cue("hook", "storm") - 0.1, 0.5)
amb.add(L.fade(L.stereo(L.rain, S["hook"]["end"] - cue("hook", "storm") + 0.5, 0.6), 1.0, 0.8), cue("hook", "storm"), 0.4)
for i in range(7): sfx.add(L.pop(600 + i * 80, 350, 0.1), cue("hook", "steps") + i * 0.12, 0.22)
# why
for k in ("b0", "b1", "b2", "b3"): sfx.add(L.pop(750, 380), cue("why", k), 0.32)
sfx.add(nope(), cue("why", "warn"), 0.25)
sfx.add(L.chime((84, 88, 91), 1.5), cue("why", "prepare"), 0.15)
# generic tip rows: pop when a row appears, soft tick when it completes
tips = ["carport", "garden", "water", "parking", "updates"]
for sid in tips:
    ks = sorted([k for k in S[sid]["cues"] if k.startswith("b")])
    for i, k in enumerate(ks):
        sfx.add(L.pop(820, 420), cue(sid, k), 0.3)
        if i + 1 < len(ks): sfx.add(L.chime((96,), 0.5), cue(sid, ks[i + 1]) + 0.05, 0.08)
# carport
amb.add(L.fade(L.stereo(L.wind, S["carport"]["end"] - S["carport"]["start"], 500), 0.8, 0.8), S["carport"]["start"], 0.45)
sfx.add(ratchet(7), cue("carport", "b1") + 0.4, 0.35)
sfx.add(L.metal(0.9) * 0.3 + L.explosion(0.9) * 0.0, cue("carport", "b2") + 0.6, 0.12)
sfx.add(ratchet(5, 0.06), cue("carport", "b2") + 2.2, 0.3)
# garden
amb.add(L.fade(L.stereo(L.wind, S["garden"]["end"] - S["garden"]["start"], 650), 0.8, 0.8), S["garden"]["start"], 0.4)
amb.add(L.fade(L.stereo(L.jungle, S["garden"]["end"] - S["garden"]["start"], 0.3), 0.8, 0.8), S["garden"]["start"], 0.12)
for k in range(3): sfx.add(snip(), cue("garden", "b0") + 0.5 + k * 0.32, 0.35)
sfx.add(thud(110), cue("garden", "b1") + 0.7, 0.4); sfx.add(thud(90), cue("garden", "b1") + 1.1, 0.3)
sfx.add(L.whoosh(1.0, 300, 2200), cue("garden", "b2") + 0.4, 0.25)
# water
amb.add(L.fade(L.stereo(L.rain, S["water"]["end"] - S["water"]["start"], 0.5), 0.8, 0.8), S["water"]["start"], 0.3)
sfx.add(squelch(1.4), cue("water", "b0") + 1.4, 0.3)
sfx.add(thud(140), cue("water", "b1") + 0.6, 0.35)
sfx.add(L.pour(1.5), cue("water", "b2") + 1.0, 0.3)
# parking
amb.add(L.fade(L.stereo(L.rain, S["parking"]["end"] - S["parking"]["start"], 0.7), 0.8, 0.8), S["parking"]["start"], 0.35)
for k in ("b0", "b1", "b2"): sfx.add(nope(), cue("parking", k) + 0.15, 0.25)
sfx.add(L.chime((88, 92, 95), 1.6), cue("parking", "b3") + 0.15, 0.22)
# updates
sfx.add(notify(), cue("updates", "b0") + 0.2, 0.25)
sfx.add(tick(6, 0.33), cue("updates", "b1"), 0.25)
sfx.add(L.thunder(4), cue("updates", "flip"), 0.5)
amb.add(L.fade(L.stereo(L.rain, S["updates"]["end"] - cue("updates", "flip"), 0.8), 1.0, 0.8), cue("updates", "flip"), 0.35)
sfx.add(L.boom(1.5, 60), cue("updates", "life"), 0.35)
# wadi
dur = S["wadi"]["end"] - S["wadi"]["start"]
amb.add(L.fade(L.stereo(L.rain, dur, 1.0), 0.5, 0.8), S["wadi"]["start"], 0.45)
amb.add(L.fade(np.stack([flood(dur), flood(dur)]), 1.5, 1.0), S["wadi"]["start"], 0.45)
sfx.add(L.thunder(5), cue("wadi", "title") - 0.1, 0.8); sfx.add(L.boom(2.5, 45), cue("wadi", "title") - 0.05, 0.4)
sfx.add(L.riser(1.8), cue("wadi", "stat") + 0.1, 0.25); sfx.add(L.splash(1.0, True), cue("wadi", "stat") + 1.9, 0.4)
sfx.add(L.thunder(4), cue("wadi", "stat") + 2.6, 0.55)
sfx.add(L.chime((81, 88), 2.0), cue("wadi", "wait"), 0.2)
# bag
sfx.add(zipper(0.9), cue("bag", "title") + 0.3, 0.35)
for k in [f"b{i}" for i in range(9)]: sfx.add(L.pop(700 + int(k[1]) * 50, 380), cue("bag", k), 0.3)
sfx.add(powerup(), cue("bag", "b7") + 0.2, 0.2)
# outro
amb.add(L.fade(L.stereo(L.rain, TOTAL - S["outro"]["start"], 0.35), 1.0, 2.0), S["outro"]["start"], 0.2)
for k in ("save", "share"):
    sfx.add(L.pop(800, 400), cue("outro", k), 0.3); sfx.add(L.click(), cue("outro", k) + 0.5, 0.5)
sfx.add(ring(), cue("outro", "sos") + 0.2, 0.22); sfx.add(L.boom(2, 55), cue("outro", "sos"), 0.35)
sfx.add(L.chime((84, 88, 91, 96), 3.0), TOTAL - 3.0, 0.25)

# ---------- score ----------
C, G, Am, F, Dm, E = [60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 56, 59]
bpm = 100; beat = 60 / bpm; bar = beat * 4
def kick(t0, g=0.3):
    t = T(0.35); f = 50 + 90 * np.exp(-t * 28); mus.add(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 10) * g, t0)
def clap(t0, g=0.12):
    x = np.zeros(int(0.25 * SR))
    for o in (0, 0.01, 0.022):
        tt = T(0.2); s = L.bp(noise(0.2), 900, 5000) * np.exp(-tt / 0.03); i = int(o * SR); x[i:i + len(s)] += s
    mus.add(x * g, t0)
def shaker(t0, g=0.04):
    tt = T(0.06); mus.add(L.hp(noise(0.06), 6000) * np.sin(np.pi * tt / 0.06) * g, t0, 1.0, 0.3)
def groove(t0, t1, prog, drums=True, arp=True, g=1.0):
    b = 0; t = t0
    while t < t1 - 0.2:
        ch = prog[b % len(prog)]; d = min(bar, t1 - t)
        L.pad(t, d + 0.6, ch, 0.03 * g, 1700, 0.3, 0.6)
        for k in range(8):  # bass eighths
            if t + k * beat / 2 >= t1: break
            tt = T(beat / 2 * 0.9); s = L.lp(np.sign(np.sin(2 * np.pi * L.mtof(ch[0] - 24) * tt)), 500) * np.exp(-tt * 6) * 0.06 * g
            mus.add(s, t + k * beat / 2)
        if arp:
            for k in range(8):
                if t + k * beat / 2 >= t1: break
                n = ch[[0, 1, 2, 1, 0, 2, 1, 2][k]] + 12
                L.piano(t + k * beat / 2, n, 0.045 * g, 1.5, 0.3 * np.sin(k))
        if drums:
            for k in range(4):
                tk = t + k * beat
                if tk >= t1: break
                if k % 2 == 0: kick(tk, 0.26 * g)
                else: clap(tk, 0.1 * g)
                shaker(tk + beat / 2, 0.035 * g)
        t += bar; b += 1
hk, wy = S["hook"], S["why"]
L.pad(0, cue("hook", "storm") + 0.5, [60, 67, 72, 76], 0.035, 2200, 1.0, 1.0)
for i, n in enumerate([72, 76, 79, 84, 79, 76]):
    if i * 0.8 + 0.4 < cue("hook", "storm"): L.piano(0.4 + i * 0.8, n, 0.06, 3.0)
L.drone(cue("hook", "storm"), hk["end"] - cue("hook", "storm") + 0.5, 45, 0.08)
L.pad(cue("hook", "storm"), hk["end"] - cue("hook", "storm") + 0.5, [57, 64, 69], 0.03, 1200, 1.0, 0.5)
mus.add(L.riser(1.6) * 0.15, hk["end"] - 1.6)
groove(wy["start"], wy["end"], [Am, F, C, G], drums=False, arp=True, g=0.85)
groove(S["carport"]["start"], S["updates"]["end"], [C, G, Am, F])
wd = S["wadi"]
L.drone(wd["start"], wd["end"] - wd["start"] + 0.5, 45, 0.1)
for i, ch in enumerate([Am, F, Dm, E]):
    t0 = wd["start"] + i * (wd["end"] - wd["start"]) / 4
    L.strings(t0, (wd["end"] - wd["start"]) / 4 + 0.8, [ch[0] - 12, ch[2]], 0.03, 0.8, 0.8)
L.ostinato(wd["start"] + 0.5, wd["end"] - 0.5, [45, 45, 52, 45, 48, 45, 47, 45], beat / 2, 0.045)
groove(S["bag"]["start"], S["bag"]["end"], [F, G, C, Am])
groove(S["outro"]["start"], TOTAL - 3.2, [F, G, Am, C])
L.pad(TOTAL - 3.2, 3.2, [48, 60, 64, 67, 72], 0.05, 2400, 0.2, 2.5)
L.strings(TOTAL - 3.2, 3.2, [48, 60, 67], 0.04, 0.2, 2.5)

ir_t = T(2.2)
def ir():
    x = L.lp(rng.standard_normal(len(ir_t)), 6000) * np.exp(-ir_t * 2.6); return x / np.sqrt(np.sum(x ** 2))
I = [ir(), ir()]
for c in range(2):
    mus.a[c] = mus.a[c] * 0.8 + fftconvolve(mus.a[c], I[c])[:N] * 0.4
    sfx.a[c] = sfx.a[c] + fftconvolve(sfx.a[c], I[c])[:N] * 0.1

# ---------- voice + mix ----------
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{BUILD}/vo_raw.wav", "-af",
  "aresample=48000,highpass=f=70,equalizer=f=180:t=q:w=1:g=1.5,equalizer=f=3000:t=q:w=1.2:g=2.5,equalizer=f=9000:t=q:w=1:g=1.5,"
  "deesser=i=0.3,acompressor=threshold=-21dB:ratio=3:attack=6:release=140:makeup=4dB,aecho=0.85:0.5:22|39:0.07|0.04",
  "-ac", "2", f"{BUILD}/vo48.wav"], check=True)
vo, _ = sf.read(f"{BUILD}/vo48.wav"); vo = vo.T; v = np.zeros((2, N)); n = min(N, vo.shape[1]); v[:, :n] = vo[:, :n]
def rms_env(x, win):
    p = np.convolve(x ** 2, np.ones(int(win * SR)) / int(win * SR), "same"); return np.sqrt(p) + 1e-7
def peak(x): return np.abs(x).max()
venv_ = rms_env(v[0], 0.4); speech = venv_ > venv_.max() * 0.08
v *= 10 ** (-19 / 20) / np.sqrt(np.mean(v[0][speech] ** 2))
mus.a /= peak(mus.a); sfx.a /= peak(sfx.a); amb.a /= peak(amb.a)
bg = mus.a * 0.30 + amb.a * 0.22 + sfx.a * 0.60
venv_ = rms_env(v[0], 0.4); benv = rms_env(0.5 * (bg[0] + bg[1]), 0.4)
active = rms_env(v[0], 0.15) > 10 ** (-40 / 20)
active = np.convolve(active.astype(float), np.ones(int(0.35 * SR)), "same") > 0
g = np.where(active, np.minimum(1.0, venv_ * 10 ** (-14 / 20) / benv), 1.0)
g = np.maximum(g, 0.08); k = int(0.12 * SR); g = np.convolve(g, np.ones(k) / k, "same")
bg = bg * g
mix = v + bg
r = []
for ln in tl["lines"]:
    a_, b_ = int(ln["start"] * SR), int(ln["end"] * SR)
    r.append(20 * np.log10(np.sqrt(np.mean(v[0, a_:b_] ** 2)) / (np.sqrt(np.mean(bg[0, a_:b_] ** 2)) + 1e-9)))
print(f"{LANG}: voice over background dB  min {min(r):.1f}  median {np.median(r):.1f}  max {max(r):.1f}")
mix[:, -int(1.5 * SR):] *= np.linspace(1, 0, int(1.5 * SR))
mix /= peak(mix) * 1.05
sf.write(f"{BUILD}/mix_pre.wav", mix.T, SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{BUILD}/mix_pre.wav", "-af", "alimiter=limit=0.9:attack=3:release=50,loudnorm=I=-14:TP=-1.5:LRA=11",
                "-ar", "48000", f"{BUILD}/soundtrack.wav"], check=True)
os.makedirs(f"{ROOT}/public/nino/audio", exist_ok=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{BUILD}/soundtrack.wav", "-c:a", "aac", "-b:a", "256k", f"{ROOT}/public/nino/audio/{LANG}.m4a"], check=True)
print("done", LANG)
