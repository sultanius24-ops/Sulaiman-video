import {Check, X} from 'lucide-react';
import {Img, interpolate, random, staticFile} from 'remotion';
import {ease, sp} from '../anim';
import {useNino} from './context';
import {ART_ASPECT, N} from './theme';

// Illustration from the PDF, full width at the bottom, with a slow push-in and weather overlays.
export const Art: React.FC<{art: number; start: number; end: number; children?: React.ReactNode}> = ({art, start, end, children}) => {
  const {frame} = useNino();
  const h = 1080 / ART_ASPECT[art];
  const zoom = interpolate(frame, [start * 30, end * 30], [1.0, 1.06], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 0, bottom: 0, width: 1080, height: h, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '50% 100%'}}>
        <Img src={staticFile(`nino/art/slide${art}.jpg`)} style={{width: '100%', height: '100%', display: 'block'}} />
        {children}
      </div>
      {/* soften the top edge into the page */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 70, background: `linear-gradient(${N.bg}, rgba(251,245,233,0))`}} />
    </div>
  );
};

// Pulsing callout ring on a point of the illustration (x, y as 0..1 of the art box).
export const Spot: React.FC<{x: number; y: number; at: number; until?: number; tone?: 'good' | 'bad' | 'info'}> = ({x, y, at, until, tone = 'info'}) => {
  const {frame} = useNino();
  const p = sp(frame, at, {damping: 11, stiffness: 160});
  if (p <= 0.001) return null;
  const fadeOut = until ? 1 - ease(frame, until, 0.4) : 1;
  const color = tone === 'good' ? N.green : tone === 'bad' ? N.red : N.orange;
  const pulse = ((frame - at * 30) % 36) / 36;
  return (
    <div style={{position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, width: 0, height: 0, opacity: fadeOut * Math.min(1, p * 1.5)}}>
      <div
        style={{
          position: 'absolute',
          width: 150,
          height: 150,
          left: -75,
          top: -75,
          borderRadius: '50%',
          border: `5px solid ${color}`,
          transform: `scale(${0.6 + pulse * 0.7})`,
          opacity: 1 - pulse,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 110,
          height: 110,
          left: -55,
          top: -55,
          borderRadius: '50%',
          border: `6px solid ${color}`,
          background: `${color}22`,
          transform: `scale(${p})`,
          boxShadow: `0 0 0 6px #ffffffaa`,
        }}
      />
      {tone !== 'info' && (
        <div
          style={{
            position: 'absolute',
            left: 30,
            top: -85,
            width: 58,
            height: 58,
            borderRadius: 29,
            background: color,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${p})`,
            boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
          }}
        >
          {tone === 'good' ? <Check size={36} strokeWidth={3.5} /> : <X size={36} strokeWidth={3.5} />}
        </div>
      )}
    </div>
  );
};

// ---------- weather overlays (drawn inside the art box) ----------
export const Rain: React.FC<{from: number; to?: number; density?: number; area?: [number, number]; opacity?: number}> = ({from, to, density = 70, area = [0, 1], opacity = 0.6}) => {
  const {frame} = useNino();
  const k = ease(frame, from, 1.2) * (to ? 1 - ease(frame, to, 0.8) : 1);
  if (k <= 0) return null;
  return (
    <svg style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: k * opacity}} viewBox="0 0 1000 1000" preserveAspectRatio="none">
      {new Array(density).fill(0).map((_, i) => {
        const x0 = (area[0] + random(`rx${i}`) * (area[1] - area[0])) * 1000;
        const speed = 22 + random(`rs${i}`) * 14;
        const y = ((frame * speed + random(`ry${i}`) * 1200) % 1200) - 150;
        return <line key={i} x1={x0} y1={y} x2={x0 - 14} y2={y + 60} stroke="#ffffff" strokeWidth={3} strokeLinecap="round" opacity={0.55 + random(`ro${i}`) * 0.45} />;
      })}
    </svg>
  );
};

export const WindLines: React.FC<{from: number; y?: number; count?: number}> = ({from, y = 0.2, count = 4}) => {
  const {frame} = useNino();
  const k = ease(frame, from, 1);
  if (k <= 0) return null;
  return (
    <svg style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: k}} viewBox="0 0 1000 1000" preserveAspectRatio="none">
      {new Array(count).fill(0).map((_, i) => {
        const yy = (y + i * 0.05) * 1000;
        const off = ((frame * (14 + i * 3) + i * 300) % 1600) - 400;
        return (
          <path
            key={i}
            d={`M${off - 300} ${yy} q 120 -40 240 0 t 240 0 q 60 20 90 -10`}
            stroke="#8FA9BF"
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
            opacity={0.75}
          />
        );
      })}
    </svg>
  );
};

export const Flash: React.FC<{times: number[]}> = ({times}) => {
  const {frame} = useNino();
  let o = 0;
  for (const tt of times) {
    const d = frame - tt * 30;
    if (d >= 0 && d < 12) o = Math.max(o, d < 2 ? 0.85 : d < 4 ? 0.2 : d < 6 ? 0.7 : (12 - d) / 12 * 0.4);
  }
  return o > 0 ? <div style={{position: 'absolute', inset: 0, background: '#fff', opacity: o}} /> : null;
};

export const Darken: React.FC<{from: number; amount?: number}> = ({from, amount = 0.35}) => {
  const {frame} = useNino();
  const k = ease(frame, from, 1.5);
  return k > 0 ? <div style={{position: 'absolute', inset: 0, background: `rgba(40,55,80,${k * amount})`, mixBlendMode: 'multiply'}} /> : null;
};

export const SunGlow: React.FC<{x: number; y: number; fadeAt?: number}> = ({x, y, fadeAt}) => {
  const {frame} = useNino();
  const pulse = 0.5 + 0.5 * Math.sin(frame / 12);
  const fade = fadeAt ? 1 - ease(frame, fadeAt, 1.5) : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: 420,
        height: 420,
        marginLeft: -210,
        marginTop: -210,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,214,120,0.7) 0%, rgba(255,214,120,0) 65%)',
        opacity: (0.55 + 0.35 * pulse) * fade,
      }}
    />
  );
};

export const Cloud: React.FC<{from: number; x0: number; x1: number; y: number; scale?: number; dark?: boolean}> = ({from, x0, x1, y, scale = 1, dark = true}) => {
  const {frame} = useNino();
  const p = ease(frame, from, 3.5);
  if (p <= 0) return null;
  const x = x0 + (x1 - x0) * p;
  const c = dark ? '#6B7F95' : '#C9D6E2';
  return (
    <svg style={{position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, width: 420 * scale, opacity: Math.min(1, p * 2)}} viewBox="0 0 420 180">
      <path d="M60 150 Q10 150 20 110 Q30 70 80 80 Q90 30 150 35 Q190 0 240 30 Q300 10 320 60 Q380 55 390 100 Q410 150 350 150 Z" fill={c} stroke="#4D5D70" strokeWidth={4} />
    </svg>
  );
};
