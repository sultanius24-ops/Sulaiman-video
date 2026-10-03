import {X} from 'lucide-react';
import {random, useCurrentFrame} from 'remotion';
import {ease, sp} from '../anim';
import {Heading} from '../components/Heading';
import {C, F, gradText} from '../theme';
import {cue, f, scene} from '../timeline';
import {PrintCode} from './Intro';

const LETTERS = 'Hello'.split('').map((ch) => ({ch, bits: ch.charCodeAt(0).toString(2).padStart(8, '0')}));

const BitRain: React.FC<{opacity: number}> = ({opacity}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', inset: 0, opacity, overflow: 'hidden'}}>
      {new Array(18).fill(0).map((_, c) => {
        const speed = 3 + random(`rs${c}`) * 5;
        const off = random(`ro${c}`) * 1920;
        const y = ((frame * speed + off) % 2400) - 600;
        return (
          <div key={c} style={{position: 'absolute', left: 20 + c * 60, top: y, display: 'flex', flexDirection: 'column', fontFamily: F.mono, fontSize: 28, lineHeight: '34px'}}>
            {new Array(16).fill(0).map((__, r) => (
              <span key={r} style={{color: C.cyan, opacity: (r / 16) * 0.5}}>
                {random(`b${c}-${r}-${Math.floor(frame / 6)}`) > 0.5 ? 1 : 0}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export const Binary: React.FC = () => {
  const frame = useCurrentFrame();
  const s = scene('binary').start;
  const bubble = sp(frame, s + 0.45);
  const cross = sp(frame, cue.dontSpeak, {damping: 10, stiffness: 200});
  const shake = cross > 0 && cross < 0.98 ? Math.sin(frame * 2.2) * 10 * (1 - cross) : 0;
  const stream = ease(frame, cue.binaryWord - 0.1, 0.9);

  return (
    <>
      <BitRain opacity={0.18 + 0.2 * ease(frame, cue.zeros, 1)} />
      <Heading at={s + 0.1} kicker="Step 2 · Binary" title="Computers only speak 0s and 1s" highlight={['0s', '1s']} colors={[C.cyan, C.blue]} />

      {/* Python isn't understood */}
      <div style={{position: 'absolute', top: 520, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            position: 'relative',
            padding: '22px 40px',
            borderRadius: 26,
            background: '#0e1638',
            border: `2px solid ${cross > 0.5 ? C.red : C.cyan}66`,
            opacity: bubble * (1 - 0.45 * cross),
            transform: `translateX(${shake}px) scale(${0.7 + 0.3 * bubble})`,
          }}
        >
          <PrintCode chars={14} size={48} />
          <div
            style={{
              position: 'absolute',
              right: -30,
              top: -30,
              width: 66,
              height: 66,
              borderRadius: 33,
              background: `linear-gradient(140deg, ${C.red}, #DC2626)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: `0 10px 30px ${C.red}88`,
              transform: `scale(${cross})`,
            }}
          >
            <X size={40} strokeWidth={3.2} />
          </div>
          <div style={{position: 'absolute', left: 30, right: 30, top: '50%', height: 5, borderRadius: 3, background: C.red, transformOrigin: 'left', transform: `scaleX(${ease(frame, cue.dontSpeak + 0.1, 0.5)})`}} />
        </div>
      </div>

      {/* Letter → byte cards */}
      <div style={{position: 'absolute', top: 730, left: 50, right: 50, display: 'flex', justifyContent: 'center', gap: 18}}>
        {LETTERS.map((l, i) => {
          const p = sp(frame, cue.zeros - 1.9 + i * 0.12, {damping: 12});
          return (
            <div
              key={i}
              style={{
                width: 180,
                padding: '26px 0 24px',
                borderRadius: 28,
                background: 'linear-gradient(170deg, rgba(34,211,238,0.14), rgba(79,139,255,0.05))',
                border: `1.5px solid ${C.cyan}55`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
                opacity: p,
                transform: `translateY(${(1 - p) * 100}px) rotate(${(1 - p) * (i - 2) * 6}deg)`,
                boxShadow: `0 30px 70px rgba(0,0,0,0.45)`,
              }}
            >
              <span style={{fontFamily: F.head, fontWeight: 800, fontSize: 92, lineHeight: 1, ...gradText('#ffffff', C.cyan)}}>{l.ch}</span>
              <div style={{width: 110, height: 2, background: `${C.cyan}44`}} />
              {[0, 1].map((row) => (
                <div key={row} style={{display: 'flex', gap: 4, fontFamily: F.mono, fontWeight: 700, fontSize: 38}}>
                  {l.bits
                    .slice(row * 4, row * 4 + 4)
                    .split('')
                    .map((b, j) => {
                      const idx = i * 8 + row * 4 + j;
                      const lockAt = f(cue.zeros + idx * 0.04);
                      const locked = frame >= lockAt;
                      const v = locked ? b : random(`s${idx}-${Math.floor(frame / 2)}`) > 0.5 ? '1' : '0';
                      const flash = locked ? Math.max(0, 1 - (frame - lockAt) / 8) : 0;
                      return (
                        <span
                          key={j}
                          style={{
                            width: 26,
                            textAlign: 'center',
                            color: locked ? (b === '1' ? C.cyan : '#7f8bb8') : '#39436e',
                            textShadow: locked && b === '1' ? `0 0 ${10 + flash * 20}px ${C.cyan}` : undefined,
                            transform: `scale(${1 + flash * 0.35})`,
                            display: 'inline-block',
                          }}
                        >
                          {v}
                        </span>
                      );
                    })}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Full binary stream */}
      <div
        style={{
          position: 'absolute',
          top: 1170,
          left: 60,
          right: 60,
          padding: '26px 20px',
          borderRadius: 24,
          background: 'rgba(5,10,30,0.7)',
          border: `1.5px solid ${C.cyan}44`,
          textAlign: 'center',
          opacity: stream,
          transform: `scale(${0.9 + 0.1 * stream})`,
        }}
      >
        <div style={{fontFamily: F.body, fontWeight: 600, fontSize: 24, letterSpacing: 6, color: C.muted, textTransform: 'uppercase', marginBottom: 10}}>Binary instructions</div>
        <div style={{fontFamily: F.mono, fontWeight: 700, fontSize: 31, color: C.cyan, textShadow: `0 0 18px ${C.cyan}88`, letterSpacing: 1}}>
          {LETTERS.map((l) => l.bits).join(' ')}
        </div>
      </div>
    </>
  );
};
