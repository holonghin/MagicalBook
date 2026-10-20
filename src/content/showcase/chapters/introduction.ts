import type { Slide } from '../../../engine/types';
export const introduction: Slide[] = [
  { id: 'threshold', eyebrow: 'THE ATLAS OF SMALL WONDERS', layout: 'split', blocks: [
    { id: 'title', type: 'title', lines: ['Every journey', 'begins in wonder.'] },
    { id: 'thought', type: 'paragraph', text: 'An old book. A living illustration. Follow a question into unfamiliar country.' },
    { id: 'compass', type: 'diagram', renderer: 'compass' },
    { id: 'note', type: 'caption', text: 'Only the ink changes. The parchment remembers.' },
  ] },
  { id: 'sparks', eyebrow: 'SEVERAL SPARKS, ONE MOMENT', layout: 'centered', blocks: [
    { id: 'title', type: 'title', text: 'Wonder leaves a trace.' },
    { id: 'three-lines', type: 'quotation', lines: ['Notice what others pass by.', 'Follow the thread of a question.', 'Leave room for the unexpected.'] },
  ] },
  ...['The first spark.', 'A wandering ember.', 'A new page beneath.'].map((text, i): Slide => ({
    id: `paper-${i + 1}`, kind: 'chapter', eyebrow: 'WHEN PARCHMENT BECOMES ASH', layout: 'centered', blocks: [
      { id: 'title', type: 'title', text },
      { id: 'note', type: 'quotation', text: ['A small flame opens a window.', 'Charred fibers drift beyond the ink.', 'From the old page, another journey.'][i] },
    ],
  })),
];
