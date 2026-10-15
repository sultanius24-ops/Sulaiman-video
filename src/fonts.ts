import {cancelRender, continueRender, delayRender} from 'remotion';
import {FONT_DATA} from './fontData';

// All fonts used by the compositions, loaded from embedded data (no network requests).
const FONTS: [family: string, file: string, weight: string][] = [
  ['Jakarta', 'plus-jakarta-sans-latin-600-normal', '600'],
  ['Jakarta', 'plus-jakarta-sans-latin-700-normal', '700'],
  ['Jakarta', 'plus-jakarta-sans-latin-800-normal', '800'],
  ['Inter', 'inter-latin-400-normal', '400'],
  ['Inter', 'inter-latin-500-normal', '500'],
  ['Inter', 'inter-latin-600-normal', '600'],
  ['JBMono', 'jetbrains-mono-latin-500-normal', '500'],
  ['JBMono', 'jetbrains-mono-latin-700-normal', '700'],
  ['Cairo', 'cairo-arabic-600-normal', '600'],
  ['Cairo', 'cairo-arabic-700-normal', '700'],
  ['Cairo', 'cairo-arabic-800-normal', '800'],
  ['Cairo', 'cairo-latin-600-normal', '600'],
  ['Cairo', 'cairo-latin-700-normal', '700'],
  ['Cairo', 'cairo-latin-800-normal', '800'],
];

const handle = delayRender('Loading embedded fonts');
Promise.all(
  FONTS.map(([family, file, weight]) =>
    new FontFace(family, `url(data:font/woff2;base64,${FONT_DATA[file]})`, {weight})
      .load()
      .then((face) => document.fonts.add(face)),
  ),
)
  .then(() => continueRender(handle))
  .catch((err) => cancelRender(err));
