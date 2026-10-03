import json, numpy as np, soundfile as sf, subprocess
from scipy.signal import butter, sosfilt, fftconvolve
import os
P=os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SR=48000; FPS=30; TOTAL=54.5
words=json.load(open("words.json"))
def W(scene,word,nth=0):
    c=[w for w in words if w["scene"]==scene and w["w"].lower().strip(",.?!:;").startswith(word.lower())]
    return c[nth]["s"]
scenes=[("intro",0,9.0),("interp",9.0,17.2),("binary",17.2,24.3),("ram",24.3,32.1),("cpu",32.1,41.0),("output",41.0,44.4),("summary",44.4,TOTAL)]
cues={
 "typeStart":W("intro","type")+0.15,
 "behind":W("intro","behind"),
 "interpreter":W("interp","interpreter"),
 "instructions":W("interp","instructions"),
 "dontSpeak":W("binary","don't"),
 "zeros":W("binary","zeros"),
 "binaryWord":W("binary","binary"),
 "loaded":W("ram","loaded"),
 "memory":W("ram","short-term"),
 "cpuTease":W("ram","CPU"),
 "fetch":W("cpu","fetches"),
 "decode":W("cpu","decodes"),
 "execute":W("cpu","executes"),
 "hello":W("output","hello"),
 "sumCode":W("summary","code"),
 "sumInterp":W("summary","interpreter"),
 "sumBinary":W("summary","binary"),
 "sumRam":W("summary","RAM"),
 "sumCpu":W("summary","CPU"),
 "sumOutput":W("summary","output"),
 "fraction":W("summary","tiny"),
}
json.dump(dict(fps=FPS,total=TOTAL,scenes=[dict(id=a,start=b,end=c) for a,b,c in scenes],cues=cues,words=words),open(P+"/src/timeline.json","w"),indent=1)

rng=np.random.default_rng(7)
N=int(TOTAL*SR)
def T(d): return np.arange(int(d*SR))/SR
def bp(x,lo,hi,o=2): return sosfilt(butter(o,[lo,hi],btype="band",fs=SR,output="sos"),x)
def lp(x,f,o=2): return sosfilt(butter(o,f,btype="low",fs=SR,output="sos"),x)
def hp(x,f,o=2): return sosfilt(butter(o,f,btype="high",fs=SR,output="sos"),x)
L=np.zeros(N);R=np.zeros(N)
def place(sig,t,g=1.0,pan=0.0):
    i=int(t*SR); 
    if sig.ndim==1: l=sig*(1-pan)/1.0; r=sig*(1+pan)/1.0; l*=0.5**0.5*np.sqrt(2)/2*2**0.5; r*=1
    sig2=(sig*np.sqrt((1-pan)/2), sig*np.sqrt((1+pan)/2)) if sig.ndim==1 else (sig[0],sig[1])
    n=min(len(sig2[0]),N-i)
    if n<=0: return
    L[i:i+n]+=g*sig2[0][:n]; R[i:i+n]+=g*sig2[1][:n]

# ---- SFX ----
def whoosh(d=0.7,up=True):
    t=T(d); n=rng.standard_normal(len(t))
    # moving bandpass by chunked filtering
    out=np.zeros_like(n); seg=256
    for i in range(0,len(n),seg):
        p=i/len(n); f=(300+3500*p) if up else (3800-3300*p)
        out[i:i+seg]=bp(n[max(0,i-2048):i+seg],f*0.6,min(f*1.6,20000))[-len(n[i:i+seg]):]
    env=np.sin(np.pi*np.clip(t/d,0,1))**2
    s=out*env; s/=np.abs(s).max()
    pan=np.linspace(-0.7,0.7,len(t))
    return np.stack([s*np.sqrt((1-pan)/2),s*np.sqrt((1+pan)/2)])
def pop(f0=700,f1=300,d=0.12):
    t=T(d); f=f1+(f0-f1)*np.exp(-t*40); ph=2*np.pi*np.cumsum(f)/SR
    return np.sin(ph)*np.exp(-t*30)
def click():
    t=T(0.035); n=hp(rng.standard_normal(len(t)),1800)*np.exp(-t*180)
    tone=np.sin(2*np.pi*rng.uniform(2500,3500)*t)*np.exp(-t*250)*0.3
    s=n+tone; return s/np.abs(s).max()
def blip(f):
    t=T(0.05); return np.sign(np.sin(2*np.pi*f*t))*0.3*np.exp(-t*60)+np.sin(2*np.pi*f*t)*np.exp(-t*60)
def chime():
    t=T(1.6); s=np.zeros_like(t)
    for k,(f,dl) in enumerate([(1318.5,0),(1975.5,0.09),(2637,0.18)]):
        tt=np.clip(t-dl,0,None); on=(t>=dl)
        s+=on*(np.sin(2*np.pi*f*tt)+0.25*np.sin(2*np.pi*2*f*tt))*np.exp(-tt*3.2)
    return s/np.abs(s).max()
def impact():
    t=T(1.2); f=40+70*np.exp(-t*12); ph=2*np.pi*np.cumsum(f)/SR
    s=np.sin(ph)*np.exp(-t*3.5)+lp(rng.standard_normal(len(t)),1200)*np.exp(-t*14)*0.6
    return s/np.abs(s).max()
def riser(d=1.4):
    t=T(d); n=rng.standard_normal(len(t)); out=np.zeros_like(n); seg=256
    for i in range(0,len(n),seg):
        p=i/len(n); f=400+5000*p**2
        out[i:i+seg]=bp(n[max(0,i-2048):i+seg],f*0.7,min(f*1.4,20000))[-len(n[i:i+seg]):]
    s=out*(t/d)**2; return s/np.abs(s).max()
def shimmer():
    s=np.zeros(int(SR*1.4))
    for k,f in enumerate([1046.5,1318.5,1568,2093]):
        t=T(1.4-k*0.06); x=np.sin(2*np.pi*f*t)*np.exp(-t*4)
        i=int(k*0.06*SR); s[i:i+len(x)]+=x
    return s/np.abs(s).max()

# transitions
for a,b,c in scenes[1:]:
    place(whoosh(0.75),b-0.42,0.30)
place(impact(),0.1,0.55); place(whoosh(0.9),0.05,0.18)
# typing print("Hello") — 14 chars at 0.085s
for i in range(14): place(click(),cues["typeStart"]+i*0.085+rng.uniform(-0.01,0.01),0.22,rng.uniform(-0.3,0.3))
place(pop(900,400),0.55,0.25)
# interpreter
place(pop(500,250,0.15),9.25,0.25); place(whoosh(0.5,False),cues["interpreter"]-0.2,0.18); place(pop(800,500),cues["instructions"],0.22)
# binary blips: 40 bits typed
place(pop(400,200,0.15),cues["dontSpeak"],0.25)
for i in range(40): place(blip(rng.choice([1200,1500,1800,2400])),cues["zeros"]+i*0.04,0.05,rng.uniform(-0.5,0.5))
# ram
place(whoosh(0.6),cues["loaded"]-0.25,0.2)
for i in range(8): place(pop(900+i*90,550),cues["loaded"]+0.45+i*0.15,0.12)
place(pop(600,300),cues["memory"],0.2)
# cpu steps
place(impact(),32.25,0.3)
for k in ["fetch","decode","execute"]: place(pop(900,450,0.14),cues[k],0.3)
# output
for i in range(5): place(click(),cues["hello"]+i*0.07,0.22)
place(chime(),cues["hello"]+0.4,0.22)
# summary
place(riser(1.3),44.4-1.3,0.12)
for i,k in enumerate(["sumCode","sumInterp","sumBinary","sumRam","sumCpu","sumOutput"]): place(pop(600+i*90,350),cues[k],0.26)
place(shimmer(),cues["fraction"],0.2)
place(impact(),52.0,0.2)
sfx=np.stack([L,R])

# ---- MUSIC ----
bpm=96; beat=60/bpm; t=np.arange(N)/SR
def mtof(m): return 440*2**((m-69)/12)
prog=[[57,60,64,67],[53,57,60,64],[48,52,55,59],[55,59,62,66-2]]  # Am7 Fmaj7 Cmaj7 G6-ish
bar=4*beat; music=np.zeros((2,N))
# pad
for bi in range(int(TOTAL/bar)+1):
    ch=prog[bi%4]; s0=bi*bar; d=bar+0.4; tt=T(d)
    env=np.minimum(1,tt/0.6)*np.minimum(1,(d-tt)/0.6).clip(0)
    for j,m in enumerate(ch):
        for det,pan in [(-0.08,-0.6),(0.08,0.6)]:
            f=mtof(m)*(1+det/100*5); x=sum(np.sin(2*np.pi*f*h*tt+h)/h**1.6 for h in range(1,6))
            x=lp(x,1400)*env*0.05
            i=int(s0*SR); n=min(len(x),N-i)
            if n>0: music[0,i:i+n]+=x[:n]*np.sqrt((1-pan)/2); music[1,i:i+n]+=x[:n]*np.sqrt((1+pan)/2)
    # sub bass
    tt=T(bar); x=np.sin(2*np.pi*mtof(ch[0]-12)*tt)*np.minimum(1,tt/0.05)*np.exp(-tt*0.6)*0.12
    i=int(s0*SR); n=min(len(x),N-i)
    if n>0: music[:,i:i+n]+=x[:n]
# pluck arp, 8ths, from 2.4s
step=beat/2; k=0; ts=2.4
while ts<TOTAL-1.5:
    bi=int(ts/bar); ch=prog[bi%4]; m=ch[[0,2,1,3,2,1,3,2][k%8]]+12
    tt=T(0.6); x=(np.sin(2*np.pi*mtof(m)*tt)+0.3*np.sin(4*np.pi*mtof(m)*tt))*np.exp(-tt*7)*0.05
    pan=0.35*np.sin(k*0.7); i=int(ts*SR); n=min(len(x),N-i)
    music[0,i:i+n]+=x[:n]*np.sqrt((1-pan)/2); music[1,i:i+n]+=x[:n]*np.sqrt((1+pan)/2)
    ts+=step; k+=1
# soft kick + hat from 9s to 52s
ts=9.0
while ts<52:
    tt=T(0.4); f=45+80*np.exp(-tt*30); x=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt*9)*0.22
    i=int(ts*SR); n=min(len(x),N-i); music[:,i:i+n]+=x[:n]
    for off in [beat/2,beat*1.5]:
        tt=T(0.05); h=hp(rng.standard_normal(len(tt)),7000)*np.exp(-tt*90)*0.03
        i=int((ts+off)*SR); n=min(len(h),N-i); music[:,i:i+n]+=h[:n]
    ts+=beat*2
# reverb on music
ir_t=T(2.2); ir=rng.standard_normal(len(ir_t))*np.exp(-ir_t*2.6); ir=lp(ir,5000); ir/=np.abs(ir).sum()**0.5*8
for c in range(2): music[c]=music[c]*0.8+fftconvolve(music[c],ir)[:N]*0.5
fade=np.ones(N); fi=int(1.5*SR); fade[:fi]=np.linspace(0,1,fi); fo=int(2.5*SR); fade[-fo:]=np.linspace(1,0,fo)
music*=fade

# ---- VOICE (polished with ffmpeg) ----
subprocess.run(["ffmpeg","-v","error","-y","-i","vo_raw.wav","-af",
 "aresample=48000,highpass=f=75,equalizer=f=220:t=q:w=1:g=1.5,equalizer=f=3200:t=q:w=1.2:g=2.5,deesser=i=0.3,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=3dB,aecho=0.8:0.6:28|47:0.10|0.06",
 "-ac","2","vo48.wav"],check=True)
vo,_=sf.read("vo48.wav"); vo=vo.T; v=np.zeros((2,N)); n=min(N,vo.shape[1]); v[:,:n]=vo[:,:n]
# sidechain duck
e=np.abs(v[0]); win=int(0.25*SR); env=np.convolve(e,np.ones(win)/win,"same"); env=env/env.max()
duck=1-0.6*np.clip(env*4,0,1)
mix=v*1.0+music*duck*0.9+sfx*0.9
mix/=np.abs(mix).max()*1.05
sf.write("mix_pre.wav",mix.T,SR)
subprocess.run(["ffmpeg","-v","error","-y","-i","mix_pre.wav","-af","loudnorm=I=-14:TP=-1.5:LRA=11","-ar","48000",P+"/public/audio/soundtrack.wav"],check=True)
sf.write(P+"/public/audio/music_only.wav",(music*0.9).T/np.abs(music).max(),SR)
print("ok",cues)
