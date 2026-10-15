import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

const files: [string, string, string][] = [
  ['Cairo', 'cairo-arabic-600-normal', '600'],
  ['Cairo', 'cairo-arabic-700-normal', '700'],
  ['Cairo', 'cairo-arabic-800-normal', '800'],
  ['Cairo', 'cairo-latin-600-normal', '600'],
  ['Cairo', 'cairo-latin-700-normal', '700'],
  ['Cairo', 'cairo-latin-800-normal', '800'],
  ['Jakarta', 'plus-jakarta-sans-latin-700-normal', '700'],
  ['Jakarta', 'plus-jakarta-sans-latin-800-normal', '800'],
  ['Inter', 'inter-latin-500-normal', '500'],
  ['Inter', 'inter-latin-600-normal', '600'],
];

for (const [family, file, weight] of files) {
  loadFont({family, url: staticFile(`fonts/${file}.woff2`), weight});
}
