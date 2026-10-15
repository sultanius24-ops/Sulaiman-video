import {createContext, useContext} from 'react';
import {useCurrentFrame} from 'remotion';
import en from './timeline.en.json';
import ar from './timeline.ar.json';
import {fonts, Lang} from './theme';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Timeline = {
  lang: Lang;
  fps: number;
  total: number;
  scenes: {id: string; start: number; end: number; cues: Record<string, number>}[];
  content: any[];
};

export const TIMELINES: Record<Lang, Timeline> = {en: en as unknown as Timeline, ar: ar as unknown as Timeline};

const Ctx = createContext<Timeline>(TIMELINES.en);
export const TimelineProvider = Ctx.Provider;

export const useNino = () => {
  const tl = useContext(Ctx);
  const frame = useCurrentFrame();
  const lang = tl.lang;
  return {
    tl,
    lang,
    frame,
    t: frame / tl.fps,
    rtl: lang === 'ar',
    font: fonts(lang),
    scene: (id: string) => tl.scenes.find((s) => s.id === id)!,
    content: (id: string) => tl.content.find((c) => c.id === id),
    // seconds of a cue in a scene; falls back to the scene start
    cue: (id: string, name: string) => {
      const s = tl.scenes.find((x) => x.id === id)!;
      return s.cues[name] ?? s.start;
    },
  };
};
