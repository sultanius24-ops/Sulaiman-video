import {useCurrentFrame} from 'remotion';
import {ease, sp} from '../anim';
import {C, F, gradText} from '../theme';

// Kicker pill + title with a staggered word-by-word reveal.
export const Heading: React.FC<{
  at: number;
  kicker: string;
  title: string;
  highlight?: string[];
  colors?: [string, string];
  size?: number;
  top?: number;
}> = ({at, kicker, title, highlight = [], colors = [C.cyan, C.violet], size = 80, top = 190}) => {
  const frame = useCurrentFrame();
  const k = sp(frame, at);
  const words = title.split(' ');
  return (
    <div style={{position: 'absolute', top, left: 70, right: 70, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '12px 26px',
          borderRadius: 999,
          border: `1.5px solid ${colors[0]}55`,
          background: `${colors[0]}14`,
          color: colors[0],
          fontFamily: F.body,
          fontWeight: 600,
          fontSize: 26,
          letterSpacing: 5,
          textTransform: 'uppercase',
          opacity: k,
          transform: `translateY(${(1 - k) * 24}px) scale(${0.9 + 0.1 * k})`,
        }}
      >
        <div style={{width: 12, height: 12, borderRadius: 6, background: colors[0], boxShadow: `0 0 16px ${colors[0]}`}} />
        {kicker}
      </div>
      <div
        style={{
          marginTop: 30,
          textAlign: 'center',
          fontFamily: F.head,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 1.08,
          letterSpacing: -2,
          color: C.text,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: size * 0.26,
        }}
      >
        {words.map((w, i) => {
          const p = ease(frame, at + 0.12 + i * 0.06, 0.7);
          const hl = highlight.includes(w);
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                opacity: p,
                transform: `translateY(${(1 - p) * 50}px) rotate(${(1 - p) * 4}deg)`,
                filter: p < 0.98 ? `blur(${(1 - p) * 10}px)` : undefined,
                paddingBottom: 6,
                ...(hl ? gradText(colors[0], colors[1]) : {}),
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
