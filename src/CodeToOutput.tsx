import './fonts';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Background} from './components/Background';
import {Captions} from './components/Captions';
import {ProgressBar} from './components/ProgressBar';
import {SceneWrap} from './components/SceneWrap';
import {Binary} from './scenes/Binary';
import {Cpu} from './scenes/Cpu';
import {Interpreter} from './scenes/Interpreter';
import {Intro} from './scenes/Intro';
import {Output} from './scenes/Output';
import {Ram} from './scenes/Ram';
import {Summary} from './scenes/Summary';
import {TOTAL_FRAMES} from './timeline';

export const CodeToOutput: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = interpolate(frame, [TOTAL_FRAMES - 24, TOTAL_FRAMES - 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: '#05081A'}}>
      <Background />
      <SceneWrap id="intro"><Intro /></SceneWrap>
      <SceneWrap id="interp"><Interpreter /></SceneWrap>
      <SceneWrap id="binary"><Binary /></SceneWrap>
      <SceneWrap id="ram"><Ram /></SceneWrap>
      <SceneWrap id="cpu"><Cpu /></SceneWrap>
      <SceneWrap id="output"><Output /></SceneWrap>
      <SceneWrap id="summary"><Summary /></SceneWrap>
      <Captions />
      <ProgressBar />
      <AbsoluteFill style={{background: '#000', opacity: fadeOut}} />
      <Audio src={staticFile('audio/soundtrack.wav')} />
    </AbsoluteFill>
  );
};
