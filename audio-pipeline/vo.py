import json, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
k=Kokoro("models/kokoro-v1.0.onnx","models/voices-v1.0.bin")
V="af_heart"
# (scene, text, pause_after_seconds)
lines=[
 ("intro","Ever wondered what actually happens after you write code?",0.35),
 ("intro","Say you type print, hello. Simple, right? Well... a lot is going on behind the scenes.",0.6),
 ("interp","First, your code needs to be translated.",0.25),
 ("interp","The Python interpreter reads it, and turns it into instructions your computer can understand.",0.6),
 ("binary","But here's the thing. Computers don't speak Python.",0.25),
 ("binary","Deep down, they only understand zeros and ones. Binary.",0.6),
 ("ram","Those binary instructions are loaded into RAM,",0.15),
 ("ram","your computer's short-term memory, so the CPU can grab them fast.",0.6),
 ("cpu","Now the CPU gets to work.",0.3),
 ("cpu","It fetches the instruction from RAM...",0.3),
 ("cpu","decodes it, to figure out what it means...",0.3),
 ("cpu","and then, executes it.",0.6),
 ("output","And just like that... hello appears on your screen.",0.7),
 ("summary","So: code, interpreter, binary, RAM, CPU... and finally, output.",0.35),
 ("summary","All of that, in a tiny fraction of a second.",0.2),
]
sr=24000; chunks=[]; meta=[]; t=0.45  # lead-in
chunks.append(np.zeros(int(sr*t),dtype=np.float32))
for sc,txt,p in lines:
    a,sr=k.create(txt,voice=V,speed=0.98,lang="en-us")
    a=a.astype(np.float32)
    # trim leading/trailing near-silence
    thr=0.01*np.abs(a).max(); idx=np.where(np.abs(a)>thr)[0]
    a=a[max(0,idx[0]-240):min(len(a),idx[-1]+1200)]
    d=len(a)/sr
    meta.append(dict(scene=sc,text=txt,start=round(t,3),end=round(t+d,3)))
    chunks.append(a); chunks.append(np.zeros(int(sr*p),dtype=np.float32)); t+=d+p
full=np.concatenate(chunks)
sf.write("vo_raw.wav",full,sr)
json.dump(meta,open("vo.json","w"),indent=1)
print("total",round(t,2))
for m in meta: print(m["scene"],m["start"],m["end"],m["text"][:40])
