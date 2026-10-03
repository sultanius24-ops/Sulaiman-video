import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

const files: [family: string, file: string, weight: string][] = [
  ['Jakarta', 'plus-jakarta-sans-latin-600-normal', '600'],
  ['Jakarta', 'plus-jakarta-sans-latin-700-normal', '700'],
  ['Jakarta', 'plus-jakarta-sans-latin-800-normal', '800'],
  ['Inter', 'inter-latin-400-normal', '400'],
  ['Inter', 'inter-latin-500-normal', '500'],
  ['Inter', 'inter-latin-600-normal', '600'],
  ['JBMono', 'jetbrains-mono-latin-500-normal', '500'],
  ['JBMono', 'jetbrains-mono-latin-700-normal', '700'],
];

for (const [family, file, weight] of files) {
  loadFont({family, url: staticFile(`fonts/${file}.woff2`), weight});
}
