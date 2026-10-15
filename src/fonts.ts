import {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {FONT_DATA} from './fontData';

// All fonts used by the compositions, embedded as data (no network requests).
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

if (typeof document !== 'undefined' && !document.getElementById('embedded-fonts')) {
  const style = document.createElement('style');
  style.id = 'embedded-fonts';
  style.textContent = FONTS.map(
    ([family, file, weight]) =>
      `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;font-display:block;src:url(data:font/woff2;base64,${FONT_DATA[file]}) format('woff2');}`,
  ).join('\n');
  document.head.appendChild(style);
}

// Call from a composition's root component. Holding the render only on pages that actually
// render frames matters: a module-level delayRender() also runs on Remotion's idle
// composition-listing page, where Chrome throttles it until the render times out.
export const useEmbeddedFonts = () => {
  const [handle] = useState(() => delayRender('Loading embedded fonts'));
  useEffect(() => {
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        continueRender(handle);
      }
    };
    Promise.all(FONTS.map(([family, , weight]) => document.fonts.load(`${weight} 40px ${family}`))).then(finish, finish);
    const timer = setTimeout(finish, 5000);
    return () => clearTimeout(timer);
  }, [handle]);
};
