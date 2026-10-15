import './fonts';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {sp} from '../anim';
import {TIMELINES, TimelineProvider, useNino} from './context';
import {MitzLogo} from './Logo';
import {Bag, fxCarport, fxGarden, fxParking, fxWater, Hook, TipScene, Updates, Wadi, Why, Outro} from './Scenes';
import {SceneShell} from './Shell';
import {Lang, N} from './theme';

const Header: React.FC = () => {
  const {frame, tl, t} = useNino();
  const logo = sp(frame, 0.1);
  const idx = tl.scenes.findIndex((s) => t >= s.start && t < s.end);
  return (
    <>
      <div style={{position: 'absolute', top: 104, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: logo, transform: `scale(${0.8 + 0.2 * logo})`}}>
        <MitzLogo height={58} />
      </div>
      <div style={{position: 'absolute', top: 192, left: 250, right: 250, display: 'flex', gap: 8, direction: tl.lang === 'ar' ? 'rtl' : 'ltr'}}>
        {tl.scenes.map((s, i) => {
          const fill = Math.max(0, Math.min(1, (t - s.start) / (s.end - s.start)));
          return (
            <div key={s.id} style={{flex: 1, height: 8, borderRadius: 4, background: N.line, overflow: 'hidden'}}>
              <div style={{width: `${fill * 100}%`, height: '100%', background: i === idx ? N.orange : N.ink, opacity: i <= idx ? 1 : 0}} />
            </div>
          );
        })}
      </div>
    </>
  );
};

const Body: React.FC = () => {
  const {tl, rtl} = useNino();
  const frame = useCurrentFrame();
  const total = Math.round(tl.total * 30);
  const fadeIn = interpolate(frame, [0, 12], [1, 0], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [total - 20, total - 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: N.bg, direction: rtl ? 'rtl' : 'ltr', overflow: 'hidden'}}>
      <SceneShell id="hook"><Hook /></SceneShell>
      <SceneShell id="why"><Why /></SceneShell>
      <SceneShell id="carport"><TipScene id="carport" fx={fxCarport} /></SceneShell>
      <SceneShell id="garden"><TipScene id="garden" fx={fxGarden} /></SceneShell>
      <SceneShell id="water"><TipScene id="water" fx={fxWater} /></SceneShell>
      <SceneShell id="parking"><TipScene id="parking" fx={fxParking} /></SceneShell>
      <SceneShell id="updates"><Updates /></SceneShell>
      <SceneShell id="wadi"><Wadi /></SceneShell>
      <SceneShell id="bag"><Bag /></SceneShell>
      <SceneShell id="outro"><Outro /></SceneShell>
      <Header />
      <AbsoluteFill style={{background: N.bg, opacity: fadeIn}} />
      <AbsoluteFill style={{background: '#000', opacity: fadeOut}} />
      <Audio src={staticFile(`nino/audio/${tl.lang}.m4a`)} />
    </AbsoluteFill>
  );
};

export const NinoVideo: React.FC<{lang: Lang}> = ({lang}) => (
  <TimelineProvider value={TIMELINES[lang]}>
    <Body />
  </TimelineProvider>
);
