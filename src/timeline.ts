import data from './timeline.json';

export const FPS = data.fps;
export const TOTAL_FRAMES = Math.round(data.total * FPS);
export const cue = data.cues as Record<string, number>;
export const words = data.words as {w: string; s: number; e: number; scene: string}[];

export type SceneId = 'intro' | 'interp' | 'binary' | 'ram' | 'cpu' | 'output' | 'summary';

export const scene = (id: SceneId) => {
  const s = data.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scene ${id}`);
  return s;
};

export const f = (sec: number) => sec * FPS;
