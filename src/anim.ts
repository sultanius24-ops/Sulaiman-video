import {Easing, interpolate, spring} from 'remotion';
import {FPS, f} from './timeline';

// Spring that starts at `at` seconds (global timeline).
export const sp = (
  frame: number,
  at: number,
  config: {damping?: number; stiffness?: number; mass?: number} = {},
) =>
  spring({
    frame: frame - f(at),
    fps: FPS,
    config: {damping: 15, stiffness: 140, mass: 0.8, ...config},
  });

const outExpo = Easing.bezier(0.16, 1, 0.3, 1);

// Eased 0→1 progress from `at` over `dur` seconds.
export const ease = (frame: number, at: number, dur: number, easing = outExpo) =>
  interpolate(frame, [f(at), f(at + dur)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

export const mix = (p: number, a: number, b: number) => a + (b - a) * p;
