import {Cog} from 'lucide-react';
import {interpolate, useCurrentFrame} from 'remotion';
import {ease, sp} from '../anim';
import {Heading} from '../components/Heading';
import {Gear, IconTile} from '../components/Illustrations';
import {C, F} from '../theme';
import {cue, f, scene} from '../timeline';
import {PrintCode} from './Intro';

const BYTECODE: [string, string][] = [
  ['PUSH_NULL', ''],
  ['LOAD_NAME', 'print'],
  ['LOAD_CONST', "'Hello'"],
  ['CALL', '1'],
];

export const Interpreter: React.FC = () => {
  const frame = useCurrentFrame();
  const s = scene('interp').start;
  const chipIn = sp(frame, s + 0.5);
  const feed = ease(frame, cue.interpreter - 0.3, 0.9);
  const machine = sp(frame, s + 0.35, {damping: 14});
  // Gears spin faster while processing.
  const speed = interpolate(frame, [f(cue.interpreter), f(cue.interpreter + 0.6), f(cue.instructions + 1.5)], [1, 5, 1.5], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rot = (frame - f(s)) * 1.6 * speed;
  const working = interpolate(frame, [f(cue.interpreter), f(cue.interpreter + 0.4)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <>
      <Heading at={s + 0.1} kicker="Step 1 · Translate" title="Your code needs to be translated" highlight={['translated']} colors={[C.violet, C.pink]} />

      {/* code chip travelling into the machine */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 470 + feed * 250,
          display: 'flex',
          justifyContent: 'center',
          opacity: chipIn * (1 - ease(frame, cue.interpreter + 0.35, 0.3)),
          transform: `scale(${(0.7 + 0.3 * chipIn) * (1 - 0.5 * feed)})`,
        }}
      >
        <div style={{padding: '18px 34px', borderRadius: 22, background: '#0e1638', border: `2px solid ${C.cyan}66`, boxShadow: `0 0 40px ${C.cyan}44`}}>
          <PrintCode chars={14} size={46} />
        </div>
      </div>

      {/* The interpreter machine */}
      <div
        style={{
          position: 'absolute',
          left: 110,
          right: 110,
          top: 640,
          height: 470,
          borderRadius: 40,
          background: 'linear-gradient(165deg, #1b1f55 0%, #0f1236 100%)',
          border: `2px solid ${C.violet}${working > 0.5 ? 'aa' : '55'}`,
          boxShadow: `0 50px 120px rgba(0,0,0,0.6), 0 0 ${40 + 80 * working}px ${C.violet}${working > 0.5 ? '77' : '33'}, inset 0 2px 0 rgba(255,255,255,0.12)`,
          opacity: machine,
          transform: `translateY(${(1 - machine) * 100}px) scale(${0.85 + 0.15 * machine})`,
          overflow: 'hidden',
        }}
      >
        {/* intake slot */}
        <div style={{position: 'absolute', top: 0, left: '50%', width: 320, height: 18, marginLeft: -160, borderRadius: '0 0 14px 14px', background: '#05071a', boxShadow: `0 0 30px ${C.cyan}${working > 0 ? '88' : '22'}`}} />
        <div style={{position: 'absolute', top: 50, left: 44, right: 44, display: 'flex', alignItems: 'center', gap: 24}}>
          <IconTile size={84} colors={[C.violet, '#5B32D6']}>
            <Cog size={44} strokeWidth={2.2} />
          </IconTile>
          <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
            <span style={{fontFamily: F.head, fontWeight: 800, fontSize: 44, color: C.text}}>Python Interpreter</span>
            <span style={{fontFamily: F.body, fontWeight: 500, fontSize: 26, color: C.muted}}>Translates code into instructions</span>
          </div>
        </div>
        {/* gears */}
        <div style={{position: 'absolute', top: 190, left: 0, right: 0, height: 250}}>
          <div style={{position: 'absolute', left: 150, top: 10}}>
            <Gear id="g1" size={210} teeth={14} rotation={rot} color={C.violet} />
          </div>
          <div style={{position: 'absolute', left: 335, top: 70}}>
            <Gear id="g2" size={150} teeth={10} rotation={-rot * 1.4 + 18} color={C.cyan} />
          </div>
          <div style={{position: 'absolute', left: 470, top: 0}}>
            <Gear id="g3" size={120} teeth={8} rotation={rot * 1.75} color={C.pink} />
          </div>
          {/* status LEDs */}
          <div style={{position: 'absolute', right: 50, top: 60, display: 'flex', flexDirection: 'column', gap: 18}}>
            {[0, 1, 2, 3].map((i) => {
              const on = working > 0 && Math.floor(frame / 4 + i * 2) % 3 !== 0;
              return <div key={i} style={{width: 20, height: 20, borderRadius: 10, background: on ? C.green : '#1d2450', boxShadow: on ? `0 0 16px ${C.green}` : undefined}} />;
            })}
          </div>
        </div>
      </div>

      {/* Emitted instructions */}
      <div style={{position: 'absolute', top: 1150, left: 90, right: 90}}>
        <div
          style={{
            textAlign: 'center',
            fontFamily: F.body,
            fontWeight: 600,
            fontSize: 26,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: C.muted,
            marginBottom: 22,
            opacity: ease(frame, cue.instructions - 0.2, 0.5),
          }}
        >
          Instructions (bytecode)
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18}}>
          {BYTECODE.map(([op, arg], i) => {
            const p = sp(frame, cue.instructions + i * 0.16, {damping: 12});
            return (
              <div
                key={op}
                style={{
                  display: 'flex',
                  gap: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '18px 10px',
                  borderRadius: 18,
                  background: 'rgba(139,92,246,0.12)',
                  border: `1.5px solid ${C.violet}66`,
                  fontFamily: F.mono,
                  fontSize: 30,
                  opacity: p,
                  transform: `translateY(${(1 - p) * -60}px) scale(${0.6 + 0.4 * p})`,
                }}
              >
                <span style={{color: C.pink, fontWeight: 700}}>{op}</span>
                <span style={{color: C.amber}}>{arg}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
