import type { ContentNode } from '../../../../engine/content';
export const pattern: ContentNode = { id: 'pattern', slides: [{ id: 'pattern', eyebrow: 'PATTERN', layout: 'centered', blocks: [
  { id: 'title', type: 'title', text: 'Find a recurring shape.' },
  { id: 'formula', type: 'math', tex: String.raw`(a+b)^2=a^2+2ab+b^2` },
] }] };
