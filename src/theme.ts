export const C = {
  bg: '#05081A',
  bg2: '#0B1233',
  text: '#F4F6FF',
  muted: '#9AA6CC',
  dim: '#5B6690',
  blue: '#4F8BFF',
  violet: '#8B5CF6',
  cyan: '#22D3EE',
  green: '#34D399',
  amber: '#FBBF24',
  pink: '#F472B6',
  red: '#F87171',
  glass: 'rgba(255,255,255,0.045)',
  stroke: 'rgba(255,255,255,0.10)',
};

export const F = {
  head: 'Jakarta, sans-serif',
  body: 'Inter, sans-serif',
  mono: 'JBMono, monospace',
};

export const gradText = (a: string, b: string): React.CSSProperties => ({
  backgroundImage: `linear-gradient(100deg, ${a}, ${b})`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
});

export const glassCard: React.CSSProperties = {
  background: 'linear-gradient(160deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
  border: `1.5px solid ${C.stroke}`,
  boxShadow: '0 40px 100px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.12)',
  borderRadius: 32,
};
