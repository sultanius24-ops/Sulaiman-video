import {Composition} from 'remotion';
import {ArabicStory} from './ArabicStory';
import {CodeToOutput} from './CodeToOutput';
import {FPS, TOTAL_FRAMES} from './timeline';

export const Root: React.FC = () => (
  <>
  <Composition
    id="CodeToOutput"
    component={CodeToOutput}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1080}
    height={1920}
  />
  <Composition
    id="ArabicStory"
    component={ArabicStory}
    durationInFrames={172 * 30}
    fps={30}
    width={1080}
    height={1920}
  />
  </>
);
