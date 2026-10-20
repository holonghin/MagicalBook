import type { Deck } from '../../engine/types';

export const wonderDeck: Deck = {
  config: {
    id: 'wonder', coverTitle: 'Atlas of Wonder', subtitle: 'A field guide to the possible',
    author: 'THE EXPLORER’S EDITION', language: 'en', seed: 1729,
    coverNote: { enabled: true, text: 'for the roads not yet taken' },
    timings: { opening: 1900, turn: 540, erase: 430, reveal: 1050, drop: 1300, closing: 1900 },
  },
  sections: [{ id: 'field-notes', title: 'Field notes', slides: [
    { id: 'threshold', eyebrow: '01 / THE THRESHOLD', layout: 'split', blocks: [
      { id: 'title', type: 'title', lines: ['Every journey', 'begins in wonder.'] },
      { id: 'intro', type: 'paragraph', text: 'An open page. An unfamiliar horizon. A small invitation to look again.' },
      { id: 'compass', type: 'diagram', renderer: 'compass' },
      { id: 'caption', type: 'caption', text: 'Let curiosity leave its mark.' },
    ] },
    { id: 'sparks', eyebrow: '02 / THE INSCRIPTION', layout: 'centered', blocks: [
      { id: 'title', type: 'title', text: 'One spark. Many beginnings.' },
      { id: 'three-lines', type: 'quotation', lines: ['Notice what others pass by.', 'Follow the thread of a question.', 'Leave room for the unexpected.'] },
      { id: 'caption', type: 'caption', text: 'Three lines. Scattered origins. A single moment of discovery.' },
    ], notes: 'Replay with R to inspect the simultaneous three-line inscription. P pauses the shared clock.' },
    { id: 'bearing', eyebrow: '03 / THE LIVING ILLUSTRATION', layout: 'split', blocks: [
      { id: 'title', type: 'title', lines: ['A new direction.', 'The same curiosity.'] },
      { id: 'intro', type: 'paragraph', text: 'Move the compass. The illustration changes; the ink stays.' },
      { id: 'compass', type: 'interactive', renderer: 'compass' },
      { id: 'annotation', type: 'caption', text: 'A bearing is an invitation, not a destination.', beat: 1 },
    ] },
    { id: 'letter', eyebrow: '04 / A NOTE FROM THE FIELD', layout: 'centered', effect: 'parchmentDrop',
      drop: { mode: 'content', revealStartDropProgress: .67, targetRevealAtLanding: .85 }, blocks: [
        { id: 'title', type: 'title', text: 'Keep a little wonder.' },
        { id: 'letter', type: 'quotation', lines: ['Carry a question into the world.', 'Return with a story worth sharing.'] },
        { id: 'caption', type: 'caption', text: 'The journey continues beyond this page.' },
      ] },
    { id: 'return', eyebrow: '05 / RETURN TO YOUR BEARING', layout: 'split', effect: 'parchmentExit',
      exit: { duration: 1250, style: 'drift' },
      restoreSceneId: 'bearing', blocks: [], notes: 'The existing letter burns away and drifts off; the same cached illustration emerges behind it.' },
  ] }],
  ending: { enabled: false, slides: [] },
};

/** A second topic with no graph, plug-ins, drop or second act: data swap only. */
export const plainDeck: Deck = {
  config: { id: 'archive', coverTitle: 'The Quiet Archive', subtitle: 'Objects, memory & meaning', language: 'en', seed: 48 },
  sections: [{ id: 'objects', title: 'Objects', slides: [
    { id: 'object', eyebrow: '01 / OBJECT', layout: 'centered', blocks: [
      { id: 'title', type: 'title', text: 'An ordinary object.' },
      { id: 'text', type: 'quotation', text: 'A key holds the memory of a door.' },
    ] },
    { id: 'memory', eyebrow: '02 / MEMORY', layout: 'editorial', blocks: [
      { id: 'title', type: 'title', text: 'What do we keep?' },
      { id: 'comparison', type: 'comparison', columns: [{ title: 'The object', text: 'Material, shape, texture.' }, { title: 'The story', text: 'A person, a place, a moment.' }] },
    ] },
  ] }],
};
