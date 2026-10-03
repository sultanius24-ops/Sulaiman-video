import {ArrowDown, Clock} from 'lucide-react';
import {interpolate, useCurrentFrame} from 'remotion';
import {ease, sp} from '../anim';
import {Heading} from '../components/Heading';
import {CpuChip, IconTile, RamStick} from '../components/Illustrations';
import {C, F} from '../theme';
import {cue, f, scene} from '../timeline';

const BYTES = ['01001000', '01100101', '01101100', '01101100', '01101111', '00000010', '10010011', '01100001'];
const RAM_LEFT = 70;
const RAM_W = 940;
const RAM_TOP = 700;
const k = RAM_W / 900;

export const Ram: React.FC = () => {
  const frame = useCurrentFrame();
  const s = scene('ram').start;
  const stick = sp(frame, s + 0.35, {damping: 13});
  const arrive = (i: number) => cue.loaded + 0.45 + i * 0.15;
  const lit = BYTES.map((_, i) => {
    const a = f(arrive(i));
    return interpolate(frame, [a - 2, a + 2, a + 14], [0, 1, 0.55], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  });
  const label = sp(frame, cue.memory - 0.05);
  const tease = sp(frame, cue.cpuTease - 0.1);

  return (
    <>
      <Heading at={s + 0.1} kicker="Step 3 · Memory" title="Instructions are loaded into RAM" highlight={['RAM']} colors={[C.green, C.cyan]} />

      <div
        style={{
          position: 'absolute',
          left: RAM_LEFT,
          top: RAM_TOP,
          opacity: stick,
          transform: `translateY(${(1 - stick) * 140}px) rotate(${(1 - stick) * -8}deg) scale(${0.8 + 0.2 * stick})`,
          filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.6))',
        }}
      >
        <RamStick width={RAM_W} lit={lit} />
      </div>

      {/* bytes flying into the chips */}
      {BYTES.map((b, i) => {
        const a = arrive(i);
        const p = ease(frame, a - 0.5, 0.5, (x) => x * x * (3 - 2 * x));
        const vis = frame >= f(a - 0.55) && frame < f(a) + 2;
        if (!vis) return null;
        const tx = RAM_LEFT + (34 + i * 105 + 40) * k;
        const ty = RAM_TOP + 99 * k;
        const x = interpolate(p, [0, 1], [540, tx]);
        const y = interpolate(p, [0, 1], [520, ty]) - Math.sin(p * Math.PI) * 60;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: `translate(-50%, -50%) scale(${1 - 0.6 * p})`,
              padding: '8px 16px',
              borderRadius: 12,
              background: '#06122b',
              border: `2px solid ${C.cyan}`,
              boxShadow: `0 0 26px ${C.cyan}aa`,
              fontFamily: F.mono,
              fontWeight: 700,
              fontSize: 28,
              color: C.cyan,
              whiteSpace: 'nowrap',
            }}
          >
            {b}
          </div>
        );
      })}

      {/* short-term memory label */}
      <div style={{position: 'absolute', top: 1000, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 26,
            padding: '24px 40px 24px 26px',
            borderRadius: 30,
            background: 'linear-gradient(160deg, rgba(52,211,153,0.14), rgba(255,255,255,0.03))',
            border: `1.5px solid ${C.green}55`,
            opacity: label,
            transform: `translateY(${(1 - label) * 50}px) scale(${0.85 + 0.15 * label})`,
          }}
        >
          <IconTile size={86} colors={[C.green, '#0E9F6E']}>
            <Clock size={44} strokeWidth={2.2} />
          </IconTile>
          <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
            <span style={{fontFamily: F.head, fontWeight: 800, fontSize: 44, color: C.text}}>Short-term memory</span>
            <span style={{fontFamily: F.body, fontWeight: 500, fontSize: 27, color: C.muted}}>Fast · Temporary · Ready for the CPU</span>
          </div>
        </div>
      </div>

      {/* hand-off to the CPU */}
      <div style={{position: 'absolute', top: 1170, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: tease, transform: `translateY(${(1 - tease) * 60}px)`}}>
        <div style={{color: C.blue, transform: `translateY(${Math.sin(frame / 5) * 8}px)`, filter: `drop-shadow(0 0 12px ${C.blue})`}}>
          <ArrowDown size={60} strokeWidth={2.6} />
        </div>
        <div style={{marginTop: 4}}>
          <CpuChip size={190} pulse={frame / 40} glow={0.6} color={C.blue} />
        </div>
      </div>
    </>
  );
};
