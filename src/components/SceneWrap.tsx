import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {f, scene, SceneId, TOTAL_FRAMES} from '../timeline';

const IN = 16;
const OUT = 10;

// Shows its children only during the scene's window, with a cinematic
// scale/blur entrance and exit plus a slow push-in while on screen.
export const SceneWrap: React.FC<{id: SceneId; children: React.ReactNode}> = ({id, children}) => {
  const frame = useCurrentFrame();
  const s = scene(id);
  const start = Math.round(f(s.start));
  const end = Math.min(Math.round(f(s.end)), TOTAL_FRAMES);
  const isLast = end >= TOTAL_FRAMES;
  if (frame < start - 2 || frame > end + 4) return null;

  const ez = Easing.bezier(0.16, 1, 0.3, 1);
  const pin = interpolate(frame, [start - 2, start + IN], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ez});
  const pout = isLast
    ? 0
    : interpolate(frame, [end - OUT, end + 4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic)});

  const push = interpolate(frame, [start, end], [1, 1.035]);
  const scale = (1.08 - 0.08 * pin) * (1 - 0.06 * pout) * push;
  const blur = 14 * (1 - pin) + 12 * pout;
  const y = 40 * (1 - pin) - 50 * pout;

  return (
    <AbsoluteFill
      style={{
        opacity: pin * (1 - pout),
        transform: `translateY(${y}px) scale(${scale})`,
        filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
