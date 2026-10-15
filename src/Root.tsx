import {Composition} from 'remotion';
import {ArabicStory} from './ArabicStory';
import {CodeToOutput} from './CodeToOutput';
import {TIMELINES} from './nino/context';
import {NinoVideo} from './nino/NinoVideo';
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
  <Composition
    id="NinoEnglish"
    component={NinoVideo}
    defaultProps={{lang: 'en' as const}}
    durationInFrames={Math.round(TIMELINES.en.total * 30)}
    fps={30}
    width={1080}
    height={1920}
  />
  <Composition
    id="NinoArabic"
    component={NinoVideo}
    defaultProps={{lang: 'ar' as const}}
    durationInFrames={Math.round(TIMELINES.ar.total * 30)}
    fps={30}
    width={1080}
    height={1920}
  />
  </>
);
