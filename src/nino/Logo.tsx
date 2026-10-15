import {N} from './theme';

// Vector redraw of the "BY Mitz" mark so it stays crisp at 1080p.
export const MitzLogo: React.FC<{height: number}> = ({height}) => (
  <div style={{display: 'flex', alignItems: 'stretch', height, gap: height * 0.06, direction: 'ltr'}}>
    <div
      style={{
        width: height * 0.36,
        background: N.orange,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 3,
      }}
    >
      <span
        style={{
          transform: 'rotate(-90deg)',
          color: '#fff',
          fontFamily: 'Jakarta, sans-serif',
          fontWeight: 800,
          fontSize: height * 0.3,
          letterSpacing: 1,
        }}
      >
        BY
      </span>
    </div>
    <span style={{fontFamily: 'Jakarta, sans-serif', fontWeight: 800, fontSize: height * 1.02, lineHeight: `${height}px`, color: N.ink, letterSpacing: -height * 0.03}}>
      Mitz
    </span>
  </div>
);
