import { page } from './builders';
export const ending = [
  ['Point', 'Limits · Continuity'], ['Interval', 'IVT · Existence'], ['Change', 'Derivative · Chain Rule'],
  ['Across an Interval', 'Rolle · MVT · Monotonicity'], ['Graph', 'Extrema · Concavity · Asymptotes · Optimization'],
  ['Approximation', 'Linearization · Differentials · Error'],
].map(([title, caption], i) => ({ ...page(`recap-${i + 1}`, title, '', caption), eyebrow: 'From Local to Global, and Back Again' }));
