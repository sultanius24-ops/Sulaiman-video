# Sound design + score + final mix for the Arabic Juliane Koepcke story.
import numpy as np, soundfile as sf, subprocess, sys, os
from scipy.signal import butter, sosfilt, fftconvolve
SR = 48000; TOTAL = 172.0; N = int(TOTAL * SR)
rng = np.random.default_rng(11)
OUT = sys.argv[1] if len(sys.argv) > 1 else "build/soundtrack.wav"

def T(d): return np.arange(int(d * SR)) / SR
def filt(x, kind, f, o=2): return sosfilt(butter(o, f, btype=kind, fs=SR, output="sos"), x)
def lp(x, f, o=2): return filt(x, "low", f, o)
def hp(x, f, o=2): return filt(x, "high", f, o)
def bp(x, lo, hi, o=2): return filt(x, "band", [lo, min(hi, SR / 2 - 100)], o)
def noise(d): return rng.standard_normal(int(d * SR))
def norm(x): m = np.abs(x).max(); return x / m if m > 0 else x
def env_ad(d, a, r):
    t = T(d); e = np.minimum(1, t / max(a, 1e-4)); return e * np.exp(-np.maximum(0, t - a) / r)
def fade(x, fi, fo):
    n = x.shape[-1]; e = np.ones(n); i = int(fi * SR); o = int(fo * SR)
    if i: e[:i] = np.linspace(0, 1, i)
    if o: e[-o:] = np.minimum(e[-o:], np.linspace(1, 0, o))
    return x * e
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def sweep_bp(n, f0, f1, bw=0.5, seg=512):
    out = np.zeros_like(n)
    for i in range(0, len(n), seg):
        p = i / len(n); f = f0 * (f1 / f0) ** p
        out[i:i + seg] = bp(n[max(0, i - 4096):i + seg], f * (1 - bw), f * (1 + bw))[-len(n[i:i + seg]):]
    return out

class Bus:
    def __init__(s): s.a = np.zeros((2, N))
    def add(s, sig, t, g=1.0, pan=0.0):
        i = int(t * SR)
        if sig.ndim == 1: sig = np.stack([sig * np.sqrt((1 - pan) / 2) * 1.414, sig * np.sqrt((1 + pan) / 2) * 1.414])
        n = min(sig.shape[1], N - i)
        if n > 0 and i >= 0: s.a[:, i:i + n] += g * sig[:, :n]
def stereo(fn, d, *a):  # decorrelated L/R
    return np.stack([fn(d, *a), fn(d, *a)])

# ---------------- SFX generators ----------------
def rain(d, inten=1.0):
    x = hp(lp(noise(d), 7000), 500) * 0.35
    drops = np.zeros(int(d * SR)); k = rng.integers(0, len(drops) - 400, int(d * 900 * inten))
    for j in k: drops[j:j + 300] += rng.uniform(-1, 1) * np.exp(-np.arange(300) / 40)
    x += bp(drops, 1500, 9000) * 0.6
    return norm(x) * inten
def wind(d, base=400, amt=1.0):
    n = noise(d); t = T(d)
    out = np.zeros_like(n); seg = 1024
    for i in range(0, len(n), seg):
        f = base * (1 + 0.6 * np.sin(2 * np.pi * 0.13 * i / SR + 1) + 0.3 * np.sin(2 * np.pi * 0.37 * i / SR))
        out[i:i + seg] = bp(n[max(0, i - 4096):i + seg], f * 0.5, f * 1.6)[-len(n[i:i + seg]):]
    am = 0.6 + 0.4 * np.sin(2 * np.pi * 0.21 * t) * np.sin(2 * np.pi * 0.07 * t + 2)
    return norm(out * am) * amt
def thunder(d=5.0, crack=True):
    t = T(d); x = lp(noise(d), 180, 4) * 3
    bursts = np.zeros_like(t)
    for _ in range(7):
        c = rng.uniform(0.0, d * 0.5); w = rng.uniform(0.15, 0.6)
        bursts += np.exp(-((t - c) / w) ** 2) * rng.uniform(0.4, 1)
    x = x * (bursts + 0.3) * np.exp(-t / (d * 0.35))
    if crack: x[:int(0.25 * SR)] += hp(noise(0.25), 1500) * np.exp(-T(0.25) / 0.04) * 2.5
    return norm(x)
def boom(d=2.5, f0=55):
    t = T(d); f = f0 + 60 * np.exp(-t * 8)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    x += lp(noise(d), 900) * np.exp(-t * 6) * 0.8
    return norm(x)
def explosion(d=3.0):
    t = T(d); x = lp(noise(d), 2500) * np.exp(-t * 2.5) + boom(d, 40) * 0.9
    crackle = np.zeros_like(t); k = rng.integers(0, int(len(t) * 0.6), 400)
    for j in k: crackle[j:j + 200] += rng.uniform(-1, 1) * np.exp(-np.arange(200) / 25)
    x += hp(crackle, 2000) * np.exp(-t * 1.5) * 0.5
    return norm(x)
def metal(d=2.0):
    t = T(d); n = noise(d); x = sweep_bp(n, 900, 250, 0.08) * 4
    car = 380 + 200 * np.sin(2 * np.pi * 3 * t); scr = np.sin(2 * np.pi * np.cumsum(car + 150 * np.sin(2 * np.pi * 47 * t)) / SR)
    x = x + scr * 0.25 * np.exp(-t * 1.2)
    return norm(x * fade(np.ones_like(t), 0.05, 0.8))
def whoosh(d=0.8, f0=250, f1=3500):
    n = noise(d); x = sweep_bp(n, f0, f1, 0.5); t = T(d)
    return norm(x * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 2)
def jet(d):
    t = T(d); x = bp(noise(d), 60, 500) * 1.2 + bp(noise(d), 1500, 4000) * 0.15
    x += 0.15 * np.sin(2 * np.pi * 880 * t + 0.3 * np.sin(2 * np.pi * 0.5 * t))
    return norm(x)
def jungle(d, density=1.0):
    t = T(d); x = bp(noise(d), 2500, 9000) * 0.05
    # insect drones (AM tones)
    for k in range(5):
        f = rng.uniform(3800, 7500); rate = rng.uniform(18, 45); ph = rng.uniform(0, 6)
        gate = (np.sin(2 * np.pi * rate * t + ph) > 0.2) * (0.5 + 0.5 * np.sin(2 * np.pi * rng.uniform(0.05, 0.2) * t + ph))
        x += np.sin(2 * np.pi * f * t) * lp(gate.astype(float), 300) * 0.06
    # crickets
    for _ in range(int(d * 1.2 * density)):
        c = rng.uniform(0, d - 0.3); f = rng.uniform(4200, 5200)
        for p in range(3):
            i = int((c + p * 0.045) * SR); tt = T(0.03)
            if i + len(tt) < len(x): x[i:i + len(tt)] += np.sin(2 * np.pi * f * tt) * np.sin(np.pi * tt / 0.03) * 0.12
    # birds
    for _ in range(int(d * 0.35 * density)):
        c = rng.uniform(0, d - 1); f0 = rng.uniform(1600, 3200); kind = rng.integers(0, 3)
        for p in range(rng.integers(1, 4)):
            dd = rng.uniform(0.08, 0.22); tt = T(dd)
            if kind == 0: f = f0 * (1 + 0.6 * tt / dd)
            elif kind == 1: f = f0 * (1.5 - 0.5 * tt / dd)
            else: f = f0 * (1 + 0.15 * np.sin(2 * np.pi * 25 * tt))
            s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tt / dd) ** 2
            i = int((c + p * (dd + 0.06)) * SR)
            if i + len(s) < len(x): x[i:i + len(s)] += s * rng.uniform(0.08, 0.2)
    # frogs
    for _ in range(int(d * 0.25 * density)):
        c = rng.uniform(0, d - 1); f = rng.uniform(250, 520); dd = 0.18; tt = T(dd)
        s = np.sign(np.sin(2 * np.pi * f * tt)) * (np.sin(2 * np.pi * 30 * tt) > 0) * np.sin(np.pi * tt / dd)
        s = lp(s, 1500)
        for p in range(2):
            i = int((c + p * 0.3) * SR)
            if i + len(s) < len(x): x[i:i + len(s)] += s * 0.1
    return x / 0.6
def stream(d):
    x = bp(noise(d), 300, 2500) * 0.25 + hp(lp(noise(d), 6000), 1500) * 0.08
    for _ in range(int(d * 40)):
        c = rng.uniform(0, d - 0.06); dd = rng.uniform(0.01, 0.04); tt = T(dd); f0 = rng.uniform(500, 1800)
        s = np.sin(2 * np.pi * np.cumsum(f0 * (1 + 1.5 * tt / dd)) / SR) * np.exp(-tt / (dd / 3))
        i = int(c * SR); x[i:i + len(s)] += s * rng.uniform(0.1, 0.35)
    return norm(x)
def splash(d=0.7, big=False):
    t = T(d); x = bp(noise(d), 300 if big else 700, 5000) * np.exp(-t / (0.25 if big else 0.12))
    if big: x += lp(noise(d), 300) * np.exp(-t / 0.3) * 1.5
    for _ in range(12 if big else 5):
        c = rng.uniform(0.05, d * 0.7); dd = 0.03; tt = T(dd)
        s = np.sin(2 * np.pi * np.cumsum(rng.uniform(600, 1600) * (1 + tt / dd)) / SR) * np.exp(-tt / 0.01)
        i = int(c * SR); x[i:i + len(s)] += s * 0.3
    return norm(x)
def hiss(d=1.4):
    t = T(d); return norm(bp(noise(d), 3500, 11000) * np.sin(np.pi * t / d) ** 1.5)
def heartbeat():
    out = np.zeros(int(0.9 * SR))
    for off, g in [(0, 1.0), (0.24, 0.7)]:
        tt = T(0.25); s = np.sin(2 * np.pi * (45 + 30 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 18)
        i = int(off * SR); out[i:i + len(s)] += s * g
    return lp(out, 200)
def crash_leaves(d=1.5):
    t = T(d); x = bp(noise(d), 800, 7000) * np.exp(-t / 0.5) * 0.6
    for _ in range(150):
        c = rng.uniform(0, d * 0.6); i = int(c * SR); w = rng.integers(80, 600)
        x[i:i + w] += rng.uniform(-1, 1) * np.exp(-np.arange(w) / (w / 4))
    x += boom(d, 70) * 0.6
    return norm(x)
def crinkle(d=1.2):
    x = np.zeros(int(d * SR))
    for _ in range(int(d * 140)):
        i = rng.integers(0, len(x) - 400); w = rng.integers(40, 300)
        x[i:i + w] += rng.uniform(-1, 1) * np.exp(-np.arange(w) / (w / 5))
    return norm(hp(x, 2500) * fade(np.ones_like(x), 0.05, 0.3))
def pour(d=1.8):
    x = bp(noise(d), 400, 3000) * 0.3
    for _ in range(int(d * 60)):
        c = rng.uniform(0, d - 0.05); dd = 0.025; tt = T(dd)
        s = np.sin(2 * np.pi * np.cumsum(rng.uniform(300, 900) * (1 + 2 * tt / dd)) / SR) * np.exp(-tt / 0.008)
        i = int(c * SR); x[i:i + len(s)] += s * 0.4
    return norm(x * fade(np.ones_like(x), 0.1, 0.4))
def motor(d):
    t = T(d); f = 38 + 3 * np.sin(2 * np.pi * 0.3 * t)
    x = lp(np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)), 600) + lp(noise(d), 400) * 0.4
    return norm(x)
def step(d=0.18):
    t = T(d); return norm(lp(noise(d), 1200) * np.exp(-t / 0.03) + bp(noise(d), 1500, 5000) * np.exp(-t / 0.02) * 0.3)
def click():
    t = T(0.04); return norm(hp(noise(0.04), 2000) * np.exp(-t / 0.004) + np.sin(2 * np.pi * 2400 * t) * np.exp(-t / 0.01) * 0.5)
def pop(f0=800, f1=350, d=0.14):
    t = T(d); f = f1 + (f0 - f1) * np.exp(-t * 35); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 25)
def chime(notes=(88, 95, 100), d=2.5):
    t = T(d); x = np.zeros_like(t)
    for k, m in enumerate(notes):
        dl = k * 0.08; tt = np.clip(t - dl, 0, None); on = t >= dl
        x += on * (np.sin(2 * np.pi * mtof(m) * tt) + 0.3 * np.sin(2 * np.pi * 2 * mtof(m) * tt)) * np.exp(-tt * 2.5)
    return norm(x)
def swell(d=3.0):
    t = T(d); x = sweep_bp(noise(d), 600, 7000, 0.6) * (t / d) ** 2.5
    return norm(x * fade(np.ones_like(t), 0, 0.08))
def riser(d=2.0):
    t = T(d); x = sweep_bp(noise(d), 300, 6000, 0.3) * (t / d) ** 2
    x += np.sin(2 * np.pi * np.cumsum(200 * 2 ** (2 * t / d)) / SR) * (t / d) ** 2 * 0.3
    return norm(x)
def plane_far(d=4.0):
    t = T(d); x = lp(bp(noise(d), 80, 900), 700) + 0.2 * np.sin(2 * np.pi * (180 + 20 * t / d) * t)
    return norm(x * np.sin(np.pi * t / d) ** 2)

sfx = Bus(); amb = Bus()
# ---- 0–9 cold open: falling in a storm
amb.add(fade(stereo(wind, 9.2, 600), 0.3, 1.2), 0, 0.55)
amb.add(fade(stereo(rain, 9.2, 0.8), 0.3, 1.2), 0, 0.35)
sfx.add(thunder(5), 0.2, 0.7); sfx.add(boom(2.5), 0.25, 0.5)
sfx.add(whoosh(1.2, 200, 3000), 8.3, 0.25)
# ---- 9–14 follow CTA
sfx.add(pop(900, 450), 10.0, 0.3); sfx.add(click(), 11.95, 0.5); sfx.add(chime((93, 100), 1.2), 12.05, 0.18)
sfx.add(whoosh(0.9), 13.6, 0.25)
# ---- 14–21 map
sfx.add(pop(700, 350), 14.6, 0.25); sfx.add(pop(1000, 500), 16.0, 0.2)
sfx.add(whoosh(2.5, 300, 1800), 16.8, 0.22)
sfx.add(pop(1100, 600), 20.3, 0.22)
# ---- 22–29 plane in the sky + portraits
amb.add(fade(stereo(jet, 7.0), 0.8, 1.0), 21.8, 0.25)
amb.add(fade(stereo(wind, 7.0, 900), 0.8, 1.0), 21.8, 0.12)
sfx.add(whoosh(1.4, 200, 1500), 21.6, 0.3)
sfx.add(pop(800, 400), 22.4, 0.3, 0.3); sfx.add(pop(900, 450), 23.9, 0.3, -0.3)
sfx.add(whoosh(1.0), 28.6, 0.25)
# ---- 29–38 research station in the jungle
amb.add(fade(stereo(jungle, 9.3, 0.9), 0.8, 1.0), 28.9, 0.5)
sfx.add(pop(600, 300, 0.2), 32.0, 0.35); sfx.add(boom(1.5, 70), 32.0, 0.2)
# ---- 38–57 storm, turbulence, crash
amb.add(fade(stereo(jet, 3.3), 0.4, 0.4), 37.9, 0.3)
amb.add(fade(stereo(rain, 19.0, 1.0), 0.6, 0.8), 38.0, 0.45)
amb.add(fade(stereo(wind, 19.0, 500), 1.0, 0.8), 38.0, 0.35)
sfx.add(thunder(5.5), 40.9, 0.95); sfx.add(boom(3, 45), 40.95, 0.6)
amb.add(fade(stereo(lambda d: lp(noise(d), 160, 4) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 1.7 * T(d)))), 3.8), 0.2, 0.5), 44.0, 1.2)  # cabin rumble
for tb in (44.4, 45.3, 46.4): sfx.add(lp(boom(0.6, 90), 600), tb, 0.45, rng.uniform(-0.4, 0.4))
sfx.add(thunder(3.5), 47.0, 0.6)
for hb in (48.6, 49.6, 50.6, 51.6): sfx.add(heartbeat(), hb, 0.55)
sfx.add(thunder(4.0), 52.9, 1.0); sfx.add(boom(3, 40), 53.0, 0.6)
sfx.add(explosion(3.0), 54.0, 0.8)
sfx.add(metal(2.2), 54.8, 0.45); sfx.add(explosion(2.5), 55.2, 0.6)
# ---- 57–69 the fall
amb.add(fade(stereo(wind, 12.0, 700, 1.0), 0.2, 0.6), 56.8, 0.85)
sfx.add(whoosh(1.5, 200, 2500), 56.8, 0.5)
amb.add(fade(stereo(rain, 7.0, 0.7), 0.3, 1.0), 57.0, 0.3)
sfx.add(riser(4.5), 63.6, 0.35)
sfx.add(crash_leaves(1.6), 67.6, 0.8)
# ---- 69–71 black: unconscious
sfx.add(heartbeat(), 69.2, 0.6); sfx.add(heartbeat(), 70.4, 0.45)
# ---- 71–89 waking up in the jungle
amb.add(fade(stereo(jungle, 18.5, 1.0), 2.0, 1.0), 71.0, 0.55)
for k, tp in enumerate((75.0, 76.0, 77.0, 78.0, 79.0)): sfx.add(pop(700 + k * 60, 400, 0.12), tp, 0.2)
sfx.add(crinkle(1.3), 85.3, 0.35)
# ---- 89–96 father's advice (memory: warm, filtered)
amb.add(fade(stereo(jungle, 7.0, 0.4), 0.8, 0.8), 89.0, 0.18)
sfx.add(swell(1.2), 88.0, 0.2)
# ---- 96–99 stream → river → people
amb.add(fade(stereo(stream, 3.0), 0.3, 0.6), 96.0, 0.3)
for k, tp in enumerate((96.2, 97.1, 98.0)): sfx.add(pop(600 + k * 150, 350), tp, 0.25)
# ---- 99–117 walking in the water
amb.add(fade(stereo(stream, 18.5), 0.8, 1.0), 98.8, 0.4)
amb.add(fade(stereo(jungle, 18.5, 0.8), 0.8, 1.0), 98.8, 0.4)
for k in range(9): sfx.add(splash(0.5), 99.4 + k * 0.9 + rng.uniform(-0.05, 0.05), 0.22, 0.2 * (-1) ** k)
amb.add(fade(stereo(plane_far, 4.5), 0.5, 0.5), 105.5, 0.35)
sfx.add(hiss(1.5), 110.4, 0.35, -0.3); sfx.add(splash(1.0, True), 111.6, 0.45, 0.4)
sfx.add(boom(2.0, 60), 114.0, 0.3)
# ---- 117–129 day ten, the hut, fuel, night
amb.add(fade(stereo(stream, 8.5), 0.6, 0.8), 116.8, 0.25)
amb.add(fade(stereo(jungle, 8.5, 0.9), 0.6, 0.8), 116.8, 0.4)
for k in range(4): sfx.add(step(), 117.4 + k * 0.55, 0.3)
sfx.add(pop(700, 350), 122.0, 0.25); sfx.add(pop(800, 400), 123.0, 0.22)
sfx.add(pour(1.8), 125.3, 0.4)
amb.add(fade(stereo(jungle, 4.0, 1.4), 0.4, 0.6), 126.8, 0.35)  # night crickets
# ---- 129–137 rescuers + boat
amb.add(fade(stereo(jungle, 4.0, 0.7), 0.4, 0.6), 129.0, 0.35)
for k in range(6): sfx.add(step(), 129.3 + k * 0.4, 0.25, rng.uniform(-0.5, 0.5))
amb.add(fade(stereo(motor, 4.2), 0.5, 0.8), 132.9, 0.3)
amb.add(fade(stereo(stream, 4.2), 0.5, 0.8), 132.9, 0.25)
# ---- 137–146 rescue, sole survivor
sfx.add(swell(1.6), 135.7, 0.35); sfx.add(chime((86, 90, 93, 98), 3.5), 137.25, 0.3); sfx.add(boom(3, 50), 137.3, 0.35)
sfx.add(whoosh(1.0), 139.6, 0.2)
for k in range(10): sfx.add(click(), 140.5 + k * 0.05, 0.08)
sfx.add(chime((93,), 2.5), 142.0, 0.25); sfx.add(chime((81,), 2.5), 144.0, 0.25)
# ---- 146–162 return to the forest, epilogue
amb.add(fade(stereo(jungle, 16.0, 0.6), 1.0, 2.0), 146.0, 0.3)
for tp in (150.2, 152.2, 154.2): sfx.add(pop(900, 450), tp, 0.28)
sfx.add(swell(2.0), 155.3, 0.25)
sfx.add(boom(3, 55), 159.0, 0.3)
# ---- 162–172 outro CTA
sfx.add(whoosh(0.9), 161.7, 0.25); sfx.add(pop(900, 450), 163.0, 0.3)
sfx.add(click(), 164.9, 0.5); sfx.add(chime((93, 100), 1.2), 165.0, 0.18)
sfx.add(pop(800, 400), 167.4, 0.3); sfx.add(pop(1000, 500), 169.2, 0.2)

# ---------------- score ----------------
mus = Bus()
def pad(t0, d, notes, g=0.05, cutoff=1600, att=1.5, rel=2.0):
    t = T(d); x = np.zeros((2, len(t)))
    for m in notes:
        for det, ch in ((-0.06, 0), (0.06, 1)):
            f = mtof(m) * (1 + det / 100 * 6)
            s = sum(np.sin(2 * np.pi * f * h * t + h * 1.3) / h ** 1.5 for h in range(1, 7))
            x[ch] += s
    x = np.stack([lp(x[0], cutoff), lp(x[1], cutoff)]) * fade(np.ones(len(t)), att, rel) * g / max(1, len(notes) / 3)
    mus.add(x, t0)
def piano(t0, m, g=0.12, d=4.0, pan=0.0):
    t = T(d); f = mtof(m); x = np.zeros_like(t)
    for h, a in enumerate((1, 0.45, 0.25, 0.12, 0.06), 1):
        x += a * np.sin(2 * np.pi * f * h * (1 + 0.0004 * h * h) * t) * np.exp(-t * (1.2 + h * 0.6))
    x += lp(noise(0.02), 3000) * 0.05 if False else 0
    x *= np.minimum(1, t / 0.004)
    mus.add(x * g, t0, 1.0, pan)
def strings(t0, d, notes, g=0.04, att=2.0, rel=2.0):
    t = T(d); x = np.zeros((2, len(t)))
    for m in notes:
        for k in range(3):
            f = mtof(m) * (1 + rng.uniform(-0.003, 0.003)); vib = 1 + 0.003 * np.sin(2 * np.pi * 5.2 * t + k)
            ph = 2 * np.pi * np.cumsum(f * vib) / SR
            saw = sum(np.sin(h * ph) / h for h in range(1, 9))
            x[k % 2] += saw
    x = np.stack([lp(x[0], 2200), lp(x[1], 2200)]) * fade(np.ones(len(t)), att, rel) * g / max(1, len(notes) / 2)
    mus.add(x, t0)
def drone(t0, d, m, g=0.08):
    t = T(d); f = mtof(m)
    x = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2 * f * t + 0.3) + 0.25 * np.sin(2 * np.pi * 3.01 * f * t)) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.2 * t))
    mus.add(fade(lp(x, 600), 2.0, 2.0) * g, t0)
def taiko(t0, g=0.35):
    d = 1.2; t = T(d); f = 70 + 40 * np.exp(-t * 20)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4) + lp(noise(d), 1200) * np.exp(-t * 30) * 0.5
    mus.add(x * g, t0)
def ostinato(t0, t1, notes, step, g=0.06):
    k = 0; t = t0
    while t < t1:
        m = notes[k % len(notes)]; d = step * 0.9; tt = T(d)
        ph = 2 * np.pi * np.cumsum(np.full(len(tt), mtof(m))) / SR
        s = lp(sum(np.sin(h * ph) / h for h in range(1, 7)), 1400) * np.exp(-tt * 5) * np.minimum(1, tt / 0.01)
        mus.add(s * g, t, 1.0, 0.25 * np.sin(k))
        t += step; k += 1

D2, F2, A2, Bb1, C2 = 38, 41, 45, 34, 36
Dm = [50, 53, 57]; Bb = [46, 50, 53]; F = [53, 57, 60]; C = [48, 52, 55]; Am = [45, 48, 52]; Gm = [43, 46, 50]
# Cold open: dark drone + eerie high pad
drone(0, 9.5, D2, 0.10); pad(0, 9.5, [74, 77, 81], 0.03, 2500, 2.0, 2.0)
piano(0.4, 62, 0.10); piano(3.0, 65, 0.08); piano(5.6, 69, 0.08)
# CTA + map: soft pad
pad(9.0, 5.5, Dm, 0.04, 1200, 0.5, 1.0)
# Journey: gentle piano motif, 75 bpm
beat = 0.8; prog = [Dm, Bb, F, C]
for bar in range(8):
    t0 = 14.0 + bar * beat * 4; ch = prog[bar % 4]
    if t0 > 37.4: break
    pad(t0, beat * 4 + 1.0, ch, 0.035, 1400, 0.8, 1.2)
    for k, n in enumerate([ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 12]):
        if t0 + k * beat < 37.4: piano(t0 + k * beat, n, 0.07, 3.0, 0.2 * (k - 1.5))
    mus.add(lp(np.sin(2 * np.pi * mtof(ch[0] - 12) * T(beat * 4)) * np.exp(-T(beat * 4) * 0.7), 300) * 0.1, t0)
# Storm: ostinato + taiko
drone(37.5, 11, D2, 0.09)
ostinato(38.0, 48.2, [50, 50, 53, 50, 52, 50, 49, 50], 0.25, 0.05)
strings(38.0, 10.5, [50, 57], 0.035, 3, 1.0)
for tt in (40.9, 44.4, 45.3, 46.4, 47.0): taiko(tt, 0.35)
# Mother's words: suspended eerie chord
strings(48.2, 5.0, [62, 65, 70], 0.03, 0.8, 1.2); drone(48.0, 5.5, Bb1, 0.08)
# Crash: hits + chaos ostinato
for tt in (53.0, 54.0, 55.2): taiko(tt, 0.5)
ostinato(53.0, 57.0, [50, 51, 50, 51, 53, 54], 0.125, 0.06)
# Fall: high cluster + low drone, cut to silence at 69
strings(56.8, 12.2, [74, 75, 81], 0.025, 1.0, 0.4); drone(56.8, 12.2, 37, 0.1)
# Alone in the jungle: sparse piano + pad
pad(71.5, 17.5, [50, 57, 62], 0.03, 1100, 3.0, 2.0)
for tt, n in [(72.0, 74), (74.5, 72), (77.0, 69), (79.5, 70), (82.0, 69), (83.4, 65), (85.5, 62), (87.5, 64)]: piano(tt, n, 0.08, 5.0, 0.2)
# Father's advice: warm
pad(89.0, 7.5, [53, 57, 60, 64], 0.045, 1800, 1.0, 1.5); strings(89.0, 7.5, [41, 48], 0.03, 1.5, 1.5)
for tt, n in [(89.4, 72), (90.6, 76), (91.8, 79), (93.0, 77), (94.2, 76)]: piano(tt, n, 0.07, 4.0)
# Stream → river → people: rising arpeggio
for k, ch in enumerate([Dm, F, C]): pad(96.0 + k * 1.0, 3.2 - k * 1.0, ch, 0.035, 1600, 0.2, 0.8)
# Walking: pulse + arpeggio Dm–C–Bb–A
walk = [Dm, C, Bb, [45, 49, 52]]
for bar in range(5):
    t0 = 99.0 + bar * 3.6; ch = walk[bar % 4]
    pad(t0, 4.2, ch, 0.03, 1300, 0.6, 1.0)
    for k in range(6):
        piano(t0 + k * 0.6, ch[k % 3] + 12 + (12 if k == 3 else 0), 0.05, 2.5, 0.3 * np.sin(k))
drone(110.0, 7.0, D2, 0.09); strings(113.8, 3.5, [51, 57], 0.03, 0.5, 1.0)  # danger + worms
# Day 10 → night: tense low pulse
drone(117.0, 12.0, D2, 0.08); pad(117.0, 12.0, [50, 53, 56], 0.025, 900, 2.0, 2.0)
for k in range(10): mus.add(heartbeat() * 0.35, 117.5 + k * 1.15)
# Rescue: build to triumph at 137
pad(129.0, 8.5, F, 0.035, 1500, 1.5, 0.5); strings(129.0, 8.5, [53, 60], 0.03, 3.0, 0.5)
for tt, ch in [(129.0, F), (131.0, C), (133.0, Dm), (135.0, Bb)]:
    for k in range(4): piano(tt + k * 0.5, ch[k % 3] + 12, 0.055, 2.0)
pad(137.2, 3.5, [53, 57, 60, 65], 0.06, 2600, 0.05, 1.5); strings(137.2, 3.3, [41, 53, 60, 65], 0.045, 0.1, 1.5); taiko(137.25, 0.4)
# Sole survivor: somber
pad(140.0, 6.3, [50, 53, 57], 0.03, 1000, 0.8, 1.5)
for tt, n in [(140.3, 69), (141.8, 65), (143.3, 62), (144.8, 61)]: piano(tt, n, 0.075, 4.0)
# Return to the forest: inspirational build
insp = [Bb, F, C, Dm]
for bar in range(4):
    t0 = 146.0 + bar * 2.8; ch = insp[bar % 4]
    pad(t0, 3.4, ch, 0.04, 1500 + bar * 200, 0.5, 0.8); strings(t0, 3.3, [ch[0] - 12, ch[2]], 0.025 + bar * 0.006, 0.6, 0.8)
    for k in range(4): piano(t0 + k * 0.7, ch[k % 3] + 12 + (12 if k == 2 else 0), 0.05, 2.5)
pad(157.2, 5.0, [46, 53, 58, 62, 65], 0.06, 2600, 0.3, 1.5); strings(157.2, 5.0, [34, 46, 58, 62], 0.05, 0.3, 1.5); taiko(157.25, 0.35)
# Outro
pad(162.0, 10.0, [50, 57, 62, 64], 0.035, 1400, 1.0, 3.5)
for tt, n in [(162.5, 74), (164.3, 72), (166.1, 69), (168.0, 74)]: piano(tt, n, 0.06, 4.0)

# reverb on music
ir_t = T(3.0)
def ir(): return lp(rng.standard_normal(len(ir_t)), 6000) * np.exp(-ir_t * 2.0)
I = [ir(), ir()]; I = [i / np.sqrt(np.sum(i ** 2)) for i in I]
for c in range(2): mus.a[c] = mus.a[c] * 0.75 + fftconvolve(mus.a[c], I[c])[:N] * 0.55
for c in range(2): sfx.a[c] = sfx.a[c] + fftconvolve(sfx.a[c], I[c])[:N] * 0.12
# hard cut of music into the blackout at 69s
cut = np.ones(N); a, b = int(68.9 * SR), int(71.2 * SR); cut[a:b] = 0.0; cut[a - int(0.15 * SR):a] = np.linspace(1, 0, int(0.15 * SR))
cut[b:b + int(1.5 * SR)] = np.linspace(0, 1, int(1.5 * SR)); mus.a *= cut

# ---------------- voice ----------------
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/vo_raw.wav", "-af",
  "aresample=48000,highpass=f=70,equalizer=f=160:t=q:w=1:g=2,equalizer=f=350:t=q:w=1.5:g=-1.5,equalizer=f=3000:t=q:w=1.2:g=2.5,equalizer=f=9000:t=q:w=1:g=1.5,"
  "deesser=i=0.35,acompressor=threshold=-21dB:ratio=3.2:attack=6:release=140:makeup=4dB,aecho=0.85:0.5:24|41:0.08|0.05",
  "-ac", "2", "build/vo48.wav"], check=True)
vo, _ = sf.read("build/vo48.wav"); vo = vo.T; v = np.zeros((2, N)); n = min(N, vo.shape[1]); v[:, :n] = vo[:, :n]
def rms_env(x, win):
    p = np.convolve(x ** 2, np.ones(int(win * SR)) / int(win * SR), "same"); return np.sqrt(p) + 1e-7
def peak(x): return np.abs(x).max()
# voice: normalise so speech sits at about -19 dBFS RMS
venv_ = rms_env(v[0], 0.4); speech = venv_ > venv_.max() * 0.08
v *= 10 ** (-19 / 20) / np.sqrt(np.mean(v[0][speech] ** 2))
mus.a /= peak(mus.a); sfx.a /= peak(sfx.a); amb.a /= peak(amb.a)
bg = mus.a * 0.36 + amb.a * 0.28 + sfx.a * 0.70
# smart ducking: keep background >= 12 dB under the voice while it speaks
venv_ = rms_env(v[0], 0.4); benv = rms_env(0.5 * (bg[0] + bg[1]), 0.4)
active = rms_env(v[0], 0.15) > 10 ** (-40 / 20)
active = np.convolve(active.astype(float), np.ones(int(0.35 * SR)), "same") > 0
target = venv_ * 10 ** (-14 / 20)
g = np.where(active, np.minimum(1.0, target / benv), 1.0)
g = np.maximum(g, 0.08)
k = int(0.12 * SR); g = np.convolve(g, np.ones(k) / k, "same")
bg = bg * g
mix = v * 1.0 + bg
import json as _j
_r = []
for m in _j.load(open("build/vo.json"))["lines"]:
    a_, b_ = int(m["start"] * SR), int(m["end"] * SR)
    _r.append((m["start"], round(20 * np.log10(np.sqrt(np.mean(v[0, a_:b_] ** 2)) / (np.sqrt(np.mean(bg[0, a_:b_] ** 2)) + 1e-9)), 1)))
print("VBR", _r)
mix = fade(mix[0], 0, 1.2)[None] if False else mix
mix[:, -int(1.0 * SR):] *= np.linspace(1, 0, int(1.0 * SR))
mix /= peak(mix) * 1.05
sf.write("build/mix_pre.wav", mix.T, SR)
sf.write("build/music.wav", (mus.a / peak(mus.a) * 0.8).T, SR)
sf.write("build/sfx.wav", ((sfx.a + amb.a) / peak(sfx.a + amb.a) * 0.8).T, SR)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "build/mix_pre.wav", "-af", "alimiter=limit=0.9:attack=3:release=50,loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", OUT], check=True)
print("done", OUT)
