import {C, F} from '../theme';

// Gear outline as an SVG path.
const gearPath = (teeth: number, ro: number, ri: number) => {
  const pts: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const seq: [number, number][] = [
      [a - step * 0.25, ri],
      [a - step * 0.15, ro],
      [a + step * 0.15, ro],
      [a + step * 0.25, ri],
    ];
    for (const [ang, r] of seq) pts.push(`${(Math.cos(ang) * r).toFixed(2)},${(Math.sin(ang) * r).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
};

export const Gear: React.FC<{size: number; teeth: number; rotation: number; color: string; id: string}> = ({size, teeth, rotation, color, id}) => {
  const ro = 50;
  const ri = 50 - 50 / teeth * 2.2;
  return (
    <svg width={size} height={size} viewBox="-55 -55 110 110" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.45" stopColor={color} />
          <stop offset="1" stopColor="#1b2350" />
        </linearGradient>
      </defs>
      <g transform={`rotate(${rotation})`}>
        <path d={gearPath(teeth, ro, ri)} fill={`url(#g-${id})`} stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
        <circle r={ri * 0.62} fill="#0c1230" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
        <circle r={ri * 0.28} fill={`url(#g-${id})`} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={Math.cos((i * Math.PI) / 3) * ri * 0.45} cy={Math.sin((i * Math.PI) / 3) * ri * 0.45} r={ri * 0.07} fill="rgba(255,255,255,0.4)" />
        ))}
      </g>
    </svg>
  );
};

// Detailed RAM module. `lit` = 0..1 glow level per chip.
export const RamStick: React.FC<{width: number; lit: number[]}> = ({width, lit}) => {
  const chips = 8;
  return (
    <svg width={width} viewBox="0 0 900 270" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="pcb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14563f" />
          <stop offset="1" stopColor="#0a2e22" />
        </linearGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe9a3" />
          <stop offset="0.5" stopColor="#e2b23c" />
          <stop offset="1" stopColor="#9c7417" />
        </linearGradient>
        <linearGradient id="chip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b2f3a" />
          <stop offset="1" stopColor="#101218" />
        </linearGradient>
        <filter id="chipGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      {/* board */}
      <path d="M20 10 H880 a12 12 0 0 1 12 12 V210 H520 v22 h-24 v-22 H8 V22 a12 12 0 0 1 12 -12Z" fill="url(#pcb)" stroke="#2a8d68" strokeWidth="2" />
      {/* traces */}
      {new Array(24).fill(0).map((_, i) => (
        <path key={i} d={`M${40 + i * 35} 175 v18 h8`} stroke="#3fae83" strokeOpacity="0.35" strokeWidth="2" fill="none" />
      ))}
      {/* side notches */}
      <circle cx="8" cy="120" r="10" fill={C.bg} />
      <circle cx="892" cy="120" r="10" fill={C.bg} />
      {/* contacts */}
      {new Array(56).fill(0).map((_, i) => {
        const x = 22 + i * 15.6 + (i >= 31 ? 18 : 0);
        if (x > 868) return null;
        return <rect key={i} x={x} y={212} width={10} height={44} rx={2} fill="url(#gold)" />;
      })}
      {/* chips */}
      {new Array(chips).fill(0).map((_, i) => {
        const x = 34 + i * 105;
        const l = lit[i] ?? 0;
        return (
          <g key={i}>
            <rect x={x - 6} y={40} width={92} height={118} rx={10} fill={C.cyan} opacity={l * 0.75} filter="url(#chipGlow)" />
            {new Array(6).fill(0).map((__, k) => (
              <g key={k}>
                <rect x={x - 6} y={52 + k * 18} width={8} height={6} fill="#b8bcc6" />
                <rect x={x + 78} y={52 + k * 18} width={8} height={6} fill="#b8bcc6" />
              </g>
            ))}
            <rect x={x} y={44} width={80} height={110} rx={6} fill="url(#chip)" stroke={l > 0.05 ? C.cyan : '#3a3f4d'} strokeWidth={2} />
            <rect x={x + 6} y={50} width={68} height={10} rx={3} fill="#ffffff" opacity={0.06} />
            <text x={x + 40} y={108} textAnchor="middle" fontFamily={F.mono} fontWeight={700} fontSize={14} fill={l > 0.05 ? C.cyan : '#5b6070'} opacity={0.4 + 0.6 * l}>
              {l > 0.5 ? '1010' : 'D5'}
            </text>
            <circle cx={x + 12} cy={142} r={3} fill="#5b6070" />
          </g>
        );
      })}
      {/* label sticker */}
      <rect x={300} y={164} width={300} height={34} rx={6} fill="#e9edf5" opacity={0.92} />
      <text x={450} y={188} textAnchor="middle" fontFamily={F.head} fontWeight={800} fontSize={18} fill="#1a2040" letterSpacing={3}>
        DDR5 · 16 GB · RAM
      </text>
    </svg>
  );
};

// CPU package with radiating traces; `pulse` 0..1 travels along traces, `glow` brightens the die.
export const CpuChip: React.FC<{size: number; pulse: number; glow: number; color: string}> = ({size, pulse, glow, color}) => {
  const traces: string[] = [];
  for (let i = 0; i < 6; i++) {
    const o = -125 + i * 50;
    traces.push(`M${o} -170 V-250 l${i < 3 ? -40 : 40} -40 V-330`);
    traces.push(`M${o} 170 V250 l${i < 3 ? -40 : 40} 40 V330`);
    traces.push(`M-170 ${o} H-250 l-40 ${i < 3 ? -40 : 40} H-330`);
    traces.push(`M170 ${o} H250 l40 ${i < 3 ? -40 : 40} H330`);
  }
  return (
    <svg width={size} height={size} viewBox="-340 -340 680 680" style={{overflow: 'visible'}}>
      <defs>
        <linearGradient id="ihs" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3f5fa" />
          <stop offset="0.35" stopColor="#b9c0cf" />
          <stop offset="0.6" stopColor="#e4e8f0" />
          <stop offset="1" stopColor="#8a92a6" />
        </linearGradient>
        <linearGradient id="sub" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1f6b4f" />
          <stop offset="1" stopColor="#0b3326" />
        </linearGradient>
        <radialGradient id="cpuGlow">
          <stop offset="0" stopColor={color} stopOpacity="0.9" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r={330} fill="url(#cpuGlow)" opacity={0.25 + 0.5 * glow} />
      {traces.map((d, i) => (
        <g key={i}>
          <path d={d} stroke="#3b4a7a" strokeWidth={5} fill="none" strokeLinecap="round" />
          <path
            d={d}
            stroke={color}
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="14 86"
            strokeDashoffset={-((pulse * 100 + i * 9) % 100)}
            style={{filter: `drop-shadow(0 0 8px ${color})`}}
          />
        </g>
      ))}
      {/* substrate + pins */}
      <rect x={-175} y={-175} width={350} height={350} rx={22} fill="url(#sub)" stroke="#2fa77a" strokeWidth={3} />
      {new Array(14).fill(0).map((_, i) => {
        const o = -150 + i * 23;
        return (
          <g key={i} fill="#e2b23c">
            <rect x={o} y={-170} width={10} height={14} rx={2} />
            <rect x={o} y={156} width={10} height={14} rx={2} />
            <rect x={-170} y={o} width={14} height={10} rx={2} />
            <rect x={156} y={o} width={14} height={10} rx={2} />
          </g>
        );
      })}
      {/* heat spreader */}
      <rect x={-128} y={-128} width={256} height={256} rx={26} fill="url(#ihs)" stroke="#ffffff" strokeOpacity={0.7} strokeWidth={2} />
      <rect x={-112} y={-112} width={224} height={224} rx={18} fill="none" stroke="#000" strokeOpacity={0.12} strokeWidth={2} />
      <text x={0} y={22} textAnchor="middle" fontFamily={F.head} fontWeight={800} fontSize={74} fill="#2a3150" letterSpacing={4}>
        CPU
      </text>
      <text x={0} y={62} textAnchor="middle" fontFamily={F.mono} fontWeight={500} fontSize={20} fill="#4a5275" letterSpacing={3}>
        x86-64 · 8 CORE
      </text>
      <circle cx={-96} cy={96} r={8} fill="none" stroke="#5a6385" strokeWidth={3} />
    </svg>
  );
};

// Window chrome used for the code editor and terminal.
export const WindowFrame: React.FC<{width: number; title: string; children: React.ReactNode; accent?: string; style?: React.CSSProperties}> = ({
  width,
  title,
  children,
  accent = C.blue,
  style,
}) => (
  <div
    style={{
      width,
      borderRadius: 30,
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #121a3d 0%, #0a1029 100%)',
      border: '1.5px solid rgba(255,255,255,0.12)',
      boxShadow: `0 50px 120px rgba(0,0,0,0.6), 0 0 80px ${accent}30, inset 0 1px 0 rgba(255,255,255,0.15)`,
      ...style,
    }}
  >
    <div style={{height: 76, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 14, background: 'rgba(255,255,255,0.04)', borderBottom: '1.5px solid rgba(255,255,255,0.08)'}}>
      {['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
        <div key={c} style={{width: 22, height: 22, borderRadius: 11, background: c, boxShadow: `inset 0 -2px 0 rgba(0,0,0,0.2)`}} />
      ))}
      <div
        style={{
          marginLeft: 20,
          padding: '8px 22px',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.07)',
          color: C.muted,
          fontFamily: F.mono,
          fontSize: 24,
          fontWeight: 500,
        }}
      >
        {title}
      </div>
    </div>
    <div style={{padding: '34px 40px'}}>{children}</div>
  </div>
);

// Rounded gradient tile holding a lucide icon.
export const IconTile: React.FC<{size: number; colors: [string, string]; children: React.ReactNode; style?: React.CSSProperties}> = ({size, colors, children, style}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(140deg, ${colors[0]}, ${colors[1]})`,
      boxShadow: `0 14px 40px ${colors[0]}55, inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -3px 0 rgba(0,0,0,0.2)`,
      color: '#fff',
      flexShrink: 0,
      ...style,
    }}
  >
    {children}
  </div>
);
