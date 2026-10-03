import {Check, Download, ScanSearch, Zap} from 'lucide-react';
import {interpolate, useCurrentFrame} from 'remotion';
import {sp} from '../anim';
import {Heading} from '../components/Heading';
import {CpuChip, IconTile} from '../components/Illustrations';
import {C, F} from '../theme';
import {cue, f, scene} from '../timeline';

const STEPS = [
  {key: 'fetch', n: 1, title: 'Fetch', desc: 'Gets the instruction from RAM', icon: Download, colors: [C.cyan, '#0891B2'] as [string, string]},
  {key: 'decode', n: 2, title: 'Decode', desc: 'Figures out what it means', icon: ScanSearch, colors: [C.violet, '#6D28D9'] as [string, string]},
  {key: 'execute', n: 3, title: 'Execute', desc: 'Performs the instruction', icon: Zap, colors: [C.amber, '#D97706'] as [string, string]},
];

export const Cpu: React.FC = () => {
  const frame = useCurrentFrame();
  const s = scene('cpu').start;
  const chip = sp(frame, s + 0.2, {damping: 11});
  const activeIdx = STEPS.reduce((acc, st, i) => (frame >= f(cue[st.key]) ? i : acc), -1);
  const activeColor = activeIdx >= 0 ? STEPS[activeIdx].colors[0] : C.blue;
  const beat = activeIdx >= 0 ? interpolate(frame - f(cue[STEPS[activeIdx].key]), [0, 4, 20], [0, 1, 0.35], {extrapolateRight: 'clamp'}) : 0.2;

  return (
    <>
      <Heading at={s + 0.1} kicker="Step 4 · Process" title="The CPU executes the instructions" highlight={['CPU', 'executes']} colors={[C.blue, C.pink]} />

      <div
        style={{
          position: 'absolute',
          top: 440,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: chip,
          transform: `scale(${(0.5 + 0.5 * chip) * (1 + beat * 0.04)}) rotate(${(1 - chip) * -20}deg)`,
        }}
      >
        <CpuChip size={480} pulse={(frame - f(s)) / (activeIdx >= 0 ? 18 : 40)} glow={beat} color={activeColor} />
      </div>

      <div style={{position: 'absolute', top: 970, left: 90, right: 90, display: 'flex', flexDirection: 'column', gap: 22}}>
        {STEPS.map((st, i) => {
          const appear = sp(frame, s + 0.7 + i * 0.12);
          const on = sp(frame, cue[st.key], {damping: 12, stiffness: 180});
          const isActive = activeIdx === i;
          const done = activeIdx > i;
          const Icon = st.icon;
          return (
            <div
              key={st.key}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: 28,
                padding: '20px 30px',
                borderRadius: 30,
                background: isActive
                  ? `linear-gradient(120deg, ${st.colors[0]}30, rgba(255,255,255,0.04))`
                  : 'linear-gradient(160deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
                border: `2px solid ${isActive ? st.colors[0] : 'rgba(255,255,255,0.08)'}`,
                boxShadow: isActive ? `0 0 50px ${st.colors[0]}55` : '0 20px 50px rgba(0,0,0,0.35)',
                opacity: appear * (0.45 + 0.55 * on),
                transform: `translateX(${(1 - appear) * -120}px) scale(${1 + (isActive ? 0.04 * on : 0)})`,
              }}
            >
              <IconTile size={88} colors={on > 0.05 ? st.colors : ['#2a3266', '#1a2048']}>
                <Icon size={44} strokeWidth={2.3} />
              </IconTile>
              <div style={{display: 'flex', flexDirection: 'column', gap: 4, flex: 1}}>
                <span style={{fontFamily: F.head, fontWeight: 800, fontSize: 46, color: C.text}}>
                  <span style={{color: st.colors[0], marginRight: 14}}>{st.n}.</span>
                  {st.title}
                </span>
                <span style={{fontFamily: F.body, fontWeight: 500, fontSize: 28, color: C.muted}}>{st.desc}</span>
              </div>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 27,
                  background: C.green,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#05301f',
                  transform: `scale(${done ? sp(frame, cue[STEPS[i + 1].key], {damping: 10}) : 0})`,
                  boxShadow: `0 0 20px ${C.green}88`,
                }}
              >
                <Check size={34} strokeWidth={3.4} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
