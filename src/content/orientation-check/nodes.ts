import type { ContentNode } from '../../engine/content';
export const nodes: ContentNode[] = ['seed', 'memory', 'thread', 'east', 'west', 'gather'].map(id => ({ id, slides: [
  { id: `note-${id}`, eyebrow: 'FIELD NOTES', layout: 'centered', blocks: [{ id: 'title', type: 'title', text: `The ${id} note.` }] },
] }));
