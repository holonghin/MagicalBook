import type { ContentNode } from '../../../engine/content';
export const nodes: ContentNode[] = [
  { id: 'begin', slides: [{ id: 'begin-page', eyebrow: 'BEGIN', layout: 'centered', blocks: [{ id: 'title', type: 'title', text: 'Start with a question.' }] }] },
  { id: 'discover', slides: [{ id: 'discover-page', eyebrow: 'DISCOVER', layout: 'centered', blocks: [{ id: 'title', type: 'title', text: 'Follow what you find.' }] }] },
];
