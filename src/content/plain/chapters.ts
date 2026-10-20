import type { Slide } from '../../engine/types';
export const chapters: Slide[] = [
  { id: 'object', eyebrow: 'OBJECT', layout: 'centered', blocks: [{ id: 'title', type: 'title', text: 'An ordinary object.' }, { id: 'note', type: 'quotation', text: 'A key holds the memory of a door.' }] },
  { id: 'memory', eyebrow: 'MEMORY', layout: 'centered', blocks: [{ id: 'title', type: 'title', text: 'What do we keep?' }, { id: 'note', type: 'paragraph', text: 'Objects carry the stories we choose to remember.' }] },
];
