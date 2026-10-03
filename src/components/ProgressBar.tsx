import {useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {TOTAL_FRAMES} from '../timeline';

export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: 'rgba(255,255,255,0.06)'}}>
      <div
        style={{
          height: '100%',
          width: `${(frame / TOTAL_FRAMES) * 100}%`,
          background: `linear-gradient(90deg, ${C.cyan}, ${C.violet}, ${C.pink})`,
          boxShadow: `0 0 20px ${C.violet}`,
        }}
      />
    </div>
  );
};
