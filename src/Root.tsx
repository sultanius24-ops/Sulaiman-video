import {Composition} from 'remotion';
import {CodeToOutput} from './CodeToOutput';
import {FPS, TOTAL_FRAMES} from './timeline';

export const Root: React.FC = () => (
  <Composition
    id="CodeToOutput"
    component={CodeToOutput}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
