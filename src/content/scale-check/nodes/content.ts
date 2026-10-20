import type { ContentNode } from '../../../engine/content';
export const nodes: ContentNode[] = [
  { id: 'atlas', label: 'The Survey', shortLabel: 'Survey', step: 0 },
  ...Array.from({ length: 6 }, (_, b) => ({ id: `route-${b}`, label: `Route ${String.fromCharCode(65 + b)}`, shortLabel: `Route ${String.fromCharCode(65 + b)}`, step: 1 })),
  ...Array.from({ length: 30 }, (_, i) => ({ id: `leaf-${i}`, label: `Observation ${i + 1}`, shortLabel: `Note ${i + 1}`, step: 2 })),
].map(n => ({ id: n.id, slides: [{ id: n.id, eyebrow: 'THE SURVEY', layout: 'centered', blocks: [{ id: 'title', type: 'title', text: n.label }, { id: 'note', type: 'caption', text: 'Return to the same living map.' }] }] }));
