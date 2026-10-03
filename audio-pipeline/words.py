# Estimate word timings from vo_raw.wav + vo.json, aligning punctuation breaks to detected pauses
import json, re, numpy as np, soundfile as sf
src=json.load(open("vo.json"))
full,sr=sf.read("vo_raw.wav")
out=[]
def env(a,win):
    n=len(a)//win; return np.array([np.sqrt(np.mean(a[i*win:(i+1)*win]**2)) for i in range(n)])
for m in src:
    a=full[int(m["start"]*sr):int(m["end"]*sr)]
    win=int(sr*0.01); e=env(a,win); thr=max(e)*0.04
    quiet=e<thr
    # find pauses >=110ms inside the clip
    gaps=[];i=0
    while i<len(quiet):
        if quiet[i]:
            j=i
            while j<len(quiet) and quiet[j]: j+=1
            if (j-i)>=11 and i>5 and j<len(quiet)-5: gaps.append((i*0.01,j*0.01))
            i=j
        else: i+=1
    words=m["text"].split()
    # phrases split at punctuation
    phrases=[];cur=[]
    for w in words:
        cur.append(w)
        if re.search(r"[,.?!:;]$",w): phrases.append(cur);cur=[]
    if cur: phrases.append(cur)
    dur=m["end"]-m["start"]
    # choose the len(phrases)-1 longest gaps if available
    gs=sorted(sorted(gaps,key=lambda g:-(g[1]-g[0]))[:len(phrases)-1])
    if len(gs)==len(phrases)-1:
        bounds=[(0,gs[0][0] if gs else dur)]
        for a_,b_ in zip(gs,gs[1:]+[(dur,dur)]): bounds.append((a_[1],b_[0]))
    else:
        tot=sum(len(" ".join(p)) for p in phrases);t=0;bounds=[]
        for p in phrases:
            d=dur*len(" ".join(p))/tot;bounds.append((t,t+d));t+=d
    for p,(s,e2) in zip(phrases,bounds):
        wts=[len(re.sub(r"[^A-Za-z0-9]","",w))+1.5 for w in p];tot=sum(wts);t=s
        for w,wt in zip(p,wts):
            d=(e2-s)*wt/tot
            out.append(dict(w=w,s=round(m["start"]+t,3),e=round(m["start"]+t+d,3),scene=m["scene"]));t+=d
json.dump(out,open("words.json","w"),indent=0)
for o in out: print(o["s"],o["w"])
