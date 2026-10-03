import {AbsoluteFill, Audio, OffthreadVideo, staticFile} from 'remotion';

// The original animated story with the new Arabic narration, sound design and score.
export const ArabicStory: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <OffthreadVideo src={staticFile('arabic-story/source.mp4')} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    <Audio src={staticFile('arabic-story/soundtrack.m4a')} />
  </AbsoluteFill>
);
