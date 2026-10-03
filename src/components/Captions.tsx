import {interpolate, useCurrentFrame} from 'remotion';
import {sp} from '../anim';
import {C, F} from '../theme';
import {f, words} from '../timeline';

type Chunk = {words: typeof words; start: number; end: number};

// Group words into short caption chunks, breaking at punctuation or after 3 words.
const chunks: Chunk[] = (() => {
  const out: Chunk[] = [];
  let cur: typeof words = [];
  const flush = () => {
    if (cur.length) out.push({words: cur, start: cur[0].s, end: cur[cur.length - 1].e});
    cur = [];
  };
  words.forEach((w, i) => {
    cur.push(w);
    const prev = words[i + 1];
    const punct = /[,.?!:;]$/.test(w.w);
    const gap = prev ? prev.s - w.e > 0.25 : true;
    if (punct || gap || cur.length >= 3) flush();
  });
  flush();
  return out.map((c, i) => ({...c, end: Math.min(out[i + 1]?.start ?? c.end + 0.5, c.end + 0.5)}));
})();

const clean = (w: string) => w.replace(/[,.:;]+$/g, '').replace(/\.\.\.$/, '');

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const chunk = chunks.find((c) => t >= c.start - 0.05 && t < c.end);
  if (!chunk) return null;
  const k = sp(frame, chunk.start - 0.05, {damping: 13, stiffness: 220});
  const next = chunks[chunks.indexOf(chunk) + 1];
  const backToBack = next !== undefined && next.start - 0.05 <= chunk.end + 0.01;
  const out = backToBack ? 1 : interpolate(frame, [f(chunk.end) - 4, f(chunk.end)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        top: 1530,
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        columnGap: 18,
        rowGap: 6,
        opacity: out,
        transform: `translateY(${(1 - k) * 30}px) scale(${0.85 + 0.15 * k})`,
      }}
    >
      {chunk.words.map((w, i) => {
        const active = t >= w.s - 0.03 && t < w.e + 0.05;
        const said = t >= w.s - 0.03;
        const pop = sp(frame, w.s - 0.03, {damping: 12, stiffness: 300});
        return (
          <span
            key={i}
            style={{
              fontFamily: F.head,
              fontWeight: 800,
              fontSize: 68,
              letterSpacing: -1,
              padding: '2px 16px 8px',
              borderRadius: 18,
              color: active ? '#0A0F24' : said ? C.text : 'rgba(244,246,255,0.55)',
              background: active ? `linear-gradient(135deg, ${C.amber}, #FFD86B)` : 'transparent',
              boxShadow: active ? `0 10px 40px ${C.amber}66` : undefined,
              textShadow: active ? undefined : '0 4px 24px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.9)',
              transform: `scale(${active ? 1 + 0.08 * pop : 1}) rotate(${active ? -1.5 : 0}deg)`,
              display: 'inline-block',
            }}
          >
            {clean(w.w)}
          </span>
        );
      })}
    </div>
  );
};
