import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {scene, f, SceneId} from '../timeline';

// Accent hue per scene so the background subtly shifts through the story.
const accents: [SceneId, string, string][] = [
  ['intro', C.blue, C.violet],
  ['interp', C.violet, C.blue],
  ['binary', C.cyan, C.blue],
  ['ram', C.green, C.cyan],
  ['cpu', C.blue, C.pink],
  ['output', C.green, C.blue],
  ['summary', C.violet, C.cyan],
];

const PARTICLES = new Array(46).fill(0).map((_, i) => ({
  x: random(`px${i}`) * 1080,
  y: random(`py${i}`) * 1920,
  r: 1.5 + random(`pr${i}`) * 3,
  speed: 0.2 + random(`ps${i}`) * 0.7,
  phase: random(`ph${i}`) * Math.PI * 2,
}));

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;

  let a = accents[0][1];
  let b = accents[0][2];
  for (const [id, x, y] of accents) {
    if (frame >= f(scene(id).start) - 10) {
      a = x;
      b = y;
    }
  }

  const blob = (cx: number, cy: number, size: number, color: string, k: number) => (
    <div
      style={{
        position: 'absolute',
        left: cx + Math.sin(t * 0.35 + k) * 90 - size / 2,
        top: cy + Math.cos(t * 0.28 + k * 2) * 120 - size / 2,
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
        opacity: 0.33,
        transition: 'none',
      }}
    />
  );

  const gridShift = (frame * 0.9) % 90;

  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 0%, ${C.bg2} 0%, ${C.bg} 60%)`, overflow: 'hidden'}}>
      {blob(200, 380, 1100, a, 0)}
      {blob(900, 1500, 1200, b, 2)}
      {blob(540, 960, 800, C.violet, 4)}

      {/* Perspective grid floor */}
      <div
        style={{
          position: 'absolute',
          left: -540,
          right: -540,
          bottom: -200,
          height: 900,
          transform: 'perspective(700px) rotateX(62deg)',
          transformOrigin: 'bottom center',
          backgroundImage:
            'linear-gradient(rgba(140,170,255,0.16) 2px, transparent 2px), linear-gradient(90deg, rgba(140,170,255,0.16) 2px, transparent 2px)',
          backgroundSize: '90px 90px',
          backgroundPosition: `0 ${gridShift}px`,
          maskImage: 'linear-gradient(to top, black 10%, transparent 85%)',
          WebkitMaskImage: 'linear-gradient(to top, black 10%, transparent 85%)',
          opacity: 0.55,
        }}
      />

      {/* Dot grid top */}
      <AbsoluteFill
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.10) 1.5px, transparent 1.5px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(70% 45% at 50% 25%, black, transparent)',
          WebkitMaskImage: 'radial-gradient(70% 45% at 50% 25%, black, transparent)',
        }}
      />

      {PARTICLES.map((p, i) => {
        const y = (p.y - frame * p.speed * 2 + 1920 * 2) % 1920;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.3 + p.phase));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.x + Math.sin(t * 0.6 + p.phase) * 18,
              top: y,
              width: p.r * 2,
              height: p.r * 2,
              borderRadius: '50%',
              background: i % 3 === 0 ? a : '#cfd8ff',
              boxShadow: `0 0 ${p.r * 5}px ${i % 3 === 0 ? a : '#9fb2ff'}`,
              opacity: tw * 0.55,
            }}
          />
        );
      })}

      {/* Vignette */}
      <AbsoluteFill style={{background: 'radial-gradient(90% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.65) 100%)'}} />
      <AbsoluteFill
        style={{
          opacity: interpolate(frame, [0, 18], [1, 0], {extrapolateRight: 'clamp'}),
          background: '#000',
        }}
      />
    </AbsoluteFill>
  );
};
