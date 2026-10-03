import {Cog, Cpu, MemoryStick} from 'lucide-react';
import {useCurrentFrame} from 'remotion';
import {ease, sp} from '../anim';
import {Heading} from '../components/Heading';
import {IconTile, WindowFrame} from '../components/Illustrations';
import {C, F} from '../theme';
import {cue, f} from '../timeline';

const CODE = 'print("Hello")';

// Syntax-highlights a prefix of print("Hello").
export const PrintCode: React.FC<{chars: number; size: number}> = ({chars, size}) => {
  const typed = CODE.slice(0, chars);
  const parts: [string, string][] = [
    [typed.slice(0, 5), C.cyan],
    [typed.slice(5, 6), C.text],
    [typed.slice(6, 13), C.amber],
    [typed.slice(13, 14), C.text],
  ];
  return (
    <span style={{fontFamily: F.mono, fontWeight: 700, fontSize: size}}>
      {parts.map(([s, c], i) => (
        <span key={i} style={{color: c}}>
          {s}
        </span>
      ))}
    </span>
  );
};

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const win = sp(frame, 0.55, {damping: 13});
  const chars = Math.max(0, Math.min(14, Math.floor((frame - f(cue.typeStart)) / (0.085 * 30)) + 1));
  const cursorOn = Math.floor(frame / 15) % 2 === 0 || (chars > 0 && chars < 14);
  const lift = ease(frame, cue.behind - 0.3, 0.8);
  const typedGlow = chars === 14 ? sp(frame, cue.typeStart + 1.2) : 0;

  const layers = [
    {label: 'Interpreter', icon: <Cog size={46} strokeWidth={2.2} />, colors: [C.violet, '#6D3DF0'] as [string, string]},
    {label: 'Memory', icon: <MemoryStick size={46} strokeWidth={2.2} />, colors: [C.green, '#0E9F6E'] as [string, string]},
    {label: 'CPU', icon: <Cpu size={46} strokeWidth={2.2} />, colors: [C.blue, '#2F5BEA'] as [string, string]},
  ];

  return (
    <>
      <Heading at={0.15} kicker="Code → Output" title="What Happens After You Write Code?" highlight={['Write', 'Code?']} size={96} top={200} colors={[C.cyan, C.violet]} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 760 - lift * 120,
          display: 'flex',
          justifyContent: 'center',
          opacity: win,
          transform: `translateY(${(1 - win) * 120}px) scale(${0.82 + 0.18 * win}) rotateX(${(1 - win) * 25}deg)`,
        }}
      >
        <WindowFrame width={900} title="main.py" accent={C.blue}>
          <div style={{display: 'flex', flexDirection: 'column', gap: 18}}>
            {[
              <span key="c" style={{fontFamily: F.mono, fontSize: 38, color: C.dim}}># my first program</span>,
              <span key="p">
                <PrintCode chars={chars} size={54} />
                <span
                  style={{
                    display: 'inline-block',
                    width: 5,
                    height: 58,
                    marginLeft: 4,
                    verticalAlign: 'middle',
                    background: C.cyan,
                    opacity: cursorOn ? 1 : 0,
                    boxShadow: `0 0 12px ${C.cyan}`,
                  }}
                />
              </span>,
            ].map((line, i) => (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 34, height: 64}}>
                <span style={{fontFamily: F.mono, fontSize: 30, color: '#3d4775', width: 24}}>{i + 1}</span>
                {line}
              </div>
            ))}
          </div>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 30,
              boxShadow: `0 0 ${60 * typedGlow}px ${C.cyan}66`,
              pointerEvents: 'none',
            }}
          />
        </WindowFrame>
      </div>

      {/* Behind the scenes: the pipeline it's about to go through */}
      <div style={{position: 'absolute', top: 1110, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28}}>
        <div
          style={{
            fontFamily: F.body,
            fontWeight: 600,
            fontSize: 28,
            letterSpacing: 6,
            color: C.muted,
            textTransform: 'uppercase',
            opacity: ease(frame, cue.behind, 0.6),
          }}
        >
          Behind the scenes
        </div>
        <div style={{display: 'flex', gap: 30, alignItems: 'center'}}>
          {layers.map((l, i) => {
            const p = sp(frame, cue.behind + 0.15 + i * 0.14, {damping: 12});
            return (
              <div
                key={l.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 16,
                  padding: '26px 22px',
                  width: 250,
                  borderRadius: 28,
                  background: 'linear-gradient(160deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  opacity: p,
                  transform: `translateY(${(1 - p) * 80}px) scale(${0.7 + 0.3 * p})`,
                }}
              >
                <IconTile size={92} colors={l.colors}>
                  {l.icon}
                </IconTile>
                <span style={{fontFamily: F.head, fontWeight: 700, fontSize: 32, color: C.text}}>{l.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};
