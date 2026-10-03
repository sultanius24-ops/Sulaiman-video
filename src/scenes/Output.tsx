import {Check} from 'lucide-react';
import {useCurrentFrame} from 'remotion';
import {ease, sp} from '../anim';
import {Heading} from '../components/Heading';
import {WindowFrame} from '../components/Illustrations';
import {C, F} from '../theme';
import {cue, f, scene} from '../timeline';

export const Output: React.FC = () => {
  const frame = useCurrentFrame();
  const s = scene('output').start;
  const win = sp(frame, s + 0.15, {damping: 13});
  const cmd = '$ python main.py';
  const cmdChars = Math.max(0, Math.min(cmd.length, Math.floor((frame - f(s + 0.3)) / 1)));
  const outChars = Math.max(0, Math.min(5, Math.floor((frame - f(cue.hello)) / 2.1) + 1));
  const burst = ease(frame, cue.hello + 0.38, 1.1);
  const badge = sp(frame, cue.hello + 0.5, {damping: 11});
  const cursorOn = Math.floor(frame / 12) % 2 === 0;

  return (
    <>
      <Heading at={s + 0.05} kicker="Step 5 · Output" title="The result appears on screen" highlight={['screen']} colors={[C.green, C.cyan]} />
      <div
        style={{
          position: 'absolute',
          top: 600,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: win,
          transform: `translateY(${(1 - win) * 120}px) scale(${0.85 + 0.15 * win})`,
        }}
      >
        <WindowFrame width={900} title="Terminal" accent={C.green}>
          <div style={{fontFamily: F.mono, fontWeight: 500, fontSize: 40, color: C.muted, height: 56}}>
            <span style={{color: C.green}}>{cmd.slice(0, 1)}</span>
            {cmd.slice(1, cmdChars)}
          </div>
          <div style={{position: 'relative', height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            {/* sparkle burst */}
            {new Array(16).fill(0).map((_, i) => {
              const a = (i / 16) * Math.PI * 2;
              const r = 80 + burst * 300;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: i % 2 ? 10 : 16,
                    height: i % 2 ? 10 : 16,
                    borderRadius: 8,
                    background: i % 3 ? C.green : C.amber,
                    boxShadow: `0 0 14px ${i % 3 ? C.green : C.amber}`,
                    opacity: burst > 0 ? 1 - burst : 0,
                    transform: `translate(-50%, -50%) translate(${Math.cos(a) * r}px, ${Math.sin(a) * r * 0.6}px)`,
                  }}
                />
              );
            })}
            <span
              style={{
                fontFamily: F.mono,
                fontWeight: 700,
                fontSize: 150,
                color: C.text,
                textShadow: `0 0 ${30 + 40 * (1 - burst)}px ${C.green}, 0 0 4px ${C.green}`,
              }}
            >
              {frame >= f(cue.hello) ? 'Hello'.slice(0, outChars) : ''}
              <span style={{color: C.green, opacity: cursorOn ? 1 : 0}}>_</span>
            </span>
          </div>
        </WindowFrame>
      </div>
      <div style={{position: 'absolute', top: 1150, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '16px 34px 16px 18px',
            borderRadius: 999,
            background: `${C.green}1f`,
            border: `1.5px solid ${C.green}77`,
            fontFamily: F.body,
            fontWeight: 600,
            fontSize: 32,
            color: C.text,
            opacity: badge,
            transform: `scale(${0.6 + 0.4 * badge})`,
          }}
        >
          <div style={{width: 50, height: 50, borderRadius: 25, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#05301f'}}>
            <Check size={32} strokeWidth={3.4} />
          </div>
          Program finished
        </div>
      </div>
    </>
  );
};
