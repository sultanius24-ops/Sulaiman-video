export const N = {
  bg: '#FBF5E9',
  card: '#FFFFFF',
  ink: '#252321',
  muted: '#6E665B',
  line: '#EADFCB',
  orange: '#D9622F',
  orangeSoft: '#F6DCCB',
  blue: '#3E7CB1',
  blueSoft: '#DCE9F5',
  green: '#2F9E6B',
  greenSoft: '#D6EFE2',
  red: '#D9483B',
  redSoft: '#F8DAD5',
  amber: '#E2A33B',
};

export type Lang = 'en' | 'ar';

export const fonts = (lang: Lang) =>
  lang === 'ar'
    ? {head: 'Cairo, sans-serif', body: 'Cairo, sans-serif', headWeight: 800, bodyWeight: 700}
    : {head: 'Jakarta, sans-serif', body: 'Inter, sans-serif', headWeight: 800, bodyWeight: 600};

export const ART_ASPECT: Record<number, number> = {
  1: 1179 / 944,
  2: 1179 / 708,
  3: 1179 / 911,
  4: 1179 / 1022,
  5: 1179 / 896,
  6: 1179 / 901,
  7: 1179 / 1010,
  8: 1179 / 986,
  9: 1179 / 735,
  10: 1179 / 978,
};

export const artTop = (art: number) => 1920 - 1080 / ART_ASPECT[art];
