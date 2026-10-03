import {Binary, CodeXml, Cog, Cpu, MemoryStick, Monitor, Zap} from 'lucide-react';
import {interpolate, useCurrentFrame} from 'remotion';
import {ease, sp} from '../anim';
import {Heading} from '../components/Heading';
import {IconTile} from '../components/Illustrations';
import {C, F, gradText} from '../theme';
import {cue, f, scene} from '../timeline';

const NODES = [
  {cue: 'sumCode', label: 'Code', sub: 'print("Hello")', icon: CodeXml, colors: [C.blue, '#2F5BEA'] as [string, string]},
  {cue: 'sumInterp', label: 'Interpreter', sub: 'Translates to instructions', icon: Cog, colors: [C.violet, '#6D28D9'] as [string, string]},
  {cue: 'sumBinary', label: 'Binary', sub: '0s and 1s', icon: Binary, colors: [C.cyan, '#0891B2'] as [string, string]},
  {cue: 'sumRam', label: 'RAM', sub: 'Holds the instructions', icon: MemoryStick, colors: [C.green, '#059669'] as [string, string]},
  {cue: 'sumCpu', label: 'CPU', sub: 'Fetch · Decode · Execute', icon: Cpu, colors: [C.pink, '#DB2777'] as [string, string]},
  {cue: 'sumOutput', label: 'Output', sub: 'Hello on your screen', icon: Monitor, colors: [C.amber, '#D97706'] as [string, string]},
];

const TOP = 470;
const ROW = 122;

export const Summary: React.FC = () => {
  const frame = useCurrentFrame();
  const s = scene('summary').start;
  const lastCue = cue.sumOutput;
  const line = interpolate(frame, [f(cue.sumCode), f(lastCue)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // light pulse sweeping down the pipeline on "a fraction of a second"
  const sweep = ease(frame, cue.fraction - 0.1, 0.9, (x) => x);
  const badge = sp(frame, cue.fraction + 0.2, {damping: 11});
  const finale = sp(frame, 52.0, {damping: 16});

  return (
    <>
      <Heading at={s + 0.05} kicker="Recap" title="From Code to Output" highlight={['Output']} colors={[C.violet, C.cyan]} size={88} />

      {/* connector */}
      <div style={{position: 'absolute', left: 179, top: TOP + 55, width: 6, height: ROW * 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)'}}>
        <div style={{width: '100%', height: `${line * 100}%`, borderRadius: 3, background: `linear-gradient(${C.blue}, ${C.violet}, ${C.cyan}, ${C.green}, ${C.pink}, ${C.amber})`}} />
        {sweep > 0 && sweep < 1 && (
          <div style={{position: 'absolute', left: -12, top: `${sweep * 100}%`, width: 30, height: 30, borderRadius: 15, background: '#fff', boxShadow: `0 0 30px 10px ${C.cyan}`, transform: 'translateY(-50%)'}} />
        )}
      </div>

      {NODES.map((n, i) => {
        const p = sp(frame, cue[n.cue] - 0.04, {damping: 11, stiffness: 170});
        const lit = Math.max(0, 1 - Math.abs(sweep * 5 - i) * 1.2) * (sweep < 1 ? 1 : 0);
        const Icon = n.icon;
        return (
          <div
            key={n.label}
            style={{
              position: 'absolute',
              top: TOP + i * ROW,
              left: 130,
              right: 110,
              height: 108,
              display: 'flex',
              alignItems: 'center',
              gap: 30,
              opacity: p,
              transform: `translateX(${(1 - p) * 140}px) scale(${0.8 + 0.2 * p + lit * 0.05})`,
              transformOrigin: 'left center',
            }}
          >
            <IconTile size={104} colors={n.colors} style={{boxShadow: `0 0 ${20 + lit * 60}px ${n.colors[0]}${lit > 0.2 ? 'cc' : '66'}, inset 0 2px 0 rgba(255,255,255,0.35)`}}>
              <Icon size={52} strokeWidth={2.2} />
            </IconTile>
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                padding: '14px 28px',
                borderRadius: 24,
                background: `linear-gradient(110deg, ${n.colors[0]}${lit > 0.2 ? '33' : '14'}, rgba(255,255,255,0.02))`,
                border: `1.5px solid ${n.colors[0]}44`,
              }}
            >
              <span style={{fontFamily: F.head, fontWeight: 800, fontSize: 44, color: C.text, lineHeight: 1.1}}>{n.label}</span>
              <span style={{fontFamily: n.label === 'Code' ? F.mono : F.body, fontWeight: 500, fontSize: 26, color: C.muted}}>{n.sub}</span>
            </div>
          </div>
        );
      })}

      {/* fraction of a second badge */}
      <div style={{position: 'absolute', top: 1235, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            padding: '20px 40px 20px 22px',
            borderRadius: 999,
            background: 'linear-gradient(120deg, rgba(251,191,36,0.2), rgba(244,114,182,0.12))',
            border: `2px solid ${C.amber}88`,
            boxShadow: `0 0 ${40 + 40 * finale}px ${C.amber}55`,
            opacity: badge,
            transform: `scale(${(0.5 + 0.5 * badge) * (1 + 0.06 * finale)})`,
          }}
        >
          <IconTile size={70} colors={[C.amber, '#F59E0B']}>
            <Zap size={38} strokeWidth={2.4} fill="#fff" />
          </IconTile>
          <span style={{fontFamily: F.head, fontWeight: 800, fontSize: 42, ...gradText('#FFFFFF', C.amber)}}>In a fraction of a second</span>
        </div>
      </div>
    </>
  );
};
