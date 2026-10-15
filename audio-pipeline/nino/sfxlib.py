# Shared procedural sound-effect and music-synth helpers.
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
SR = 48000
N = 0
rng = np.random.default_rng(11)
mus = None  # set by the caller to a Bus before using the music helpers

def setup(total):
    global N; N = int(total * SR)

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

