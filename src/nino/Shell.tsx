import {Easing, interpolate} from 'remotion';
import {ease, sp} from '../anim';
import {useNino} from './context';
import {N} from './theme';

// Shows children only during the scene, with a slide/fade in and out (direction follows the language).
export const SceneShell: React.FC<{id: string; children: React.ReactNode}> = ({id, children}) => {
  const {frame, scene, tl, rtl} = useNino();
  const s = scene(id);
  const start = Math.round(s.start * 30);
  const end = Math.round(s.end * 30);
  const last = end >= Math.round(tl.total * 30) - 1;
  if (frame < start - 1 || frame > end + 8) return null;
  const ez = Easing.bezier(0.16, 1, 0.3, 1);
  const pin = interpolate(frame, [start - 1, start + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ez});
  const pout = last ? 0 : interpolate(frame, [end - 4, end + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});
  const dir = rtl ? -1 : 1;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: pin * (1 - pout), transform: `translateX(${dir * (60 * (1 - pin) - 60 * pout)}px)`}}>
      {children}
    </div>
  );
};

export const Kicker: React.FC<{at: number; text: string; color?: string; top?: number}> = ({at, text, color = N.orange, top = 236}) => {
  const {frame, font} = useNino();
  const p = sp(frame, at);
  return (
    <div style={{position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          padding: '10px 26px',
          borderRadius: 999,
          background: color,
          color: '#fff',
          fontFamily: font.head,
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: font.head.startsWith('Cairo') ? 0 : 1,
          opacity: p,
          transform: `translateY(${(1 - p) * 20}px) scale(${0.85 + 0.15 * p})`,
          boxShadow: `0 8px 20px ${color}55`,
        }}
      >
        {text}
      </div>
    </div>
  );
};

export const Title: React.FC<{at: number; text: string; size?: number; top?: number; color?: string; sub?: string; subAt?: number}> = ({
  at,
  text,
  size = 76,
  top = 312,
  color = N.ink,
  sub,
  subAt,
}) => {
  const {frame, font} = useNino();
  const words = text.split(' ');
  return (
    <div style={{position: 'absolute', top, left: 60, right: 60, textAlign: 'center'}}>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: size * 0.25, fontFamily: font.head, fontWeight: 800, fontSize: size, lineHeight: 1.15, color}}>
        {words.map((w, i) => {
          const p = ease(frame, at + i * 0.07, 0.6);
          return (
            <span key={i} style={{display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 40}px)`, filter: p < 0.98 ? `blur(${(1 - p) * 8}px)` : undefined}}>
              {w}
            </span>
          );
        })}
      </div>
      {sub && (
        <div
          style={{
            marginTop: 12,
            fontFamily: font.head,
            fontWeight: 700,
            fontSize: size * 0.62,
            color: N.orange,
            opacity: ease(frame, subAt ?? at + 0.5, 0.6),
            transform: `translateY(${(1 - ease(frame, subAt ?? at + 0.5, 0.6)) * 24}px)`,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
};

// One checklist row: icon tile + label, active while it's being spoken, ticked afterwards.
export const Row: React.FC<{at: number; next?: number; icon: React.ReactNode; label: string; tone?: 'good' | 'bad' | 'info'; bonus?: boolean}> = ({
  at,
  next,
  icon,
  label,
  tone = 'info',
  bonus,
}) => {
  const {frame, font, rtl} = useNino();
  const p = sp(frame, at, {damping: 14, stiffness: 150});
  const active = frame >= at * 30 && (next === undefined || frame < next * 30);
  const done = next !== undefined && frame >= next * 30;
  const color = tone === 'bad' ? N.red : tone === 'good' ? N.green : bonus ? N.amber : N.orange;
  const soft = tone === 'bad' ? N.redSoft : tone === 'good' ? N.greenSoft : bonus ? '#F8EBCF' : N.orangeSoft;
  const tick = done ? sp(frame, next!, {damping: 12}) : 0;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 26,
        padding: '18px 26px',
        borderRadius: 28,
        background: N.card,
        border: `3px solid ${active ? color : N.line}`,
        boxShadow: active ? `0 14px 36px ${color}33` : '0 8px 22px rgba(80,60,30,0.08)',
        opacity: p,
        transform: `translateX(${(rtl ? 1 : -1) * (1 - p) * 160}px) scale(${active ? 1.025 : 1})`,
      }}
    >
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: 24,
          flexShrink: 0,
          background: active || done ? color : soft,
          color: active || done ? '#fff' : color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <span style={{flex: 1, fontFamily: font.body, fontWeight: font.bodyWeight + 100, fontSize: 40, lineHeight: 1.2, color: N.ink}}>{label}</span>
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          flexShrink: 0,
          background: tone === 'bad' ? N.red : N.green,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${tick})`,
          fontFamily: 'Jakarta, sans-serif',
          fontWeight: 800,
          fontSize: 32,
        }}
      >
        {tone === 'bad' ? '✕' : '✓'}
      </div>
    </div>
  );
};
