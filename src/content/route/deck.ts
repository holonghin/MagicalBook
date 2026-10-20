import type { Deck } from '../../engine/types';

export const routeDeck: Deck = {
  config: { id: 'routes', coverTitle: 'The Maker’s Journey', subtitle: 'An optional route study', language: 'en', seed: 72 },
  routeGraph: {
    transitions: { enterNode: 'paperBurn', returnToGraph: 'paperBurn' },
    nodes: [
      { id: 'observe', label: 'Observe', x: 18, y: 50, slideIds: ['observation'], unlockStep: 0 },
      { id: 'imagine', label: 'Imagine', x: 50, y: 25, slideIds: ['imagination'], unlockStep: 1 },
      { id: 'make', label: 'Make', x: 82, y: 60, slideIds: ['making'], unlockStep: 2 },
    ],
    edges: [{ id: 'a', from: 'observe', to: 'imagine', unlockStep: 1 }, { id: 'b', from: 'imagine', to: 'make', unlockStep: 2 }],
  },
  sections: [{ id: 'journey', title: 'The journey', slides: [
    ...[0, 1, 2].map(step => ({ id: `route-${step}`, eyebrow: `THE JOURNEY / ${step + 1}`, layout: 'diagram' as const, routeStep: step, blocks: [
      { id: 'title', type: 'title' as const, text: ['Begin with attention.', 'Let a possibility emerge.', 'Bring an idea into the world.'][step] },
      { id: 'map', type: 'diagram' as const, renderer: 'route' },
    ] })),
    ...['observation', 'imagination', 'making'].map((id, i) => ({ id, eyebrow: ['OBSERVE', 'IMAGINE', 'MAKE'][i], layout: 'centered' as const, blocks: [
      { id: 'title', type: 'title' as const, text: ['Look a little closer.', 'Ask “what if?”', 'Try something small.'][i] },
      { id: 'hint', type: 'caption' as const, text: 'Next or Escape returns to the route when entered from a node.' },
    ] })),
  ] }],
  ending: { enabled: true, slides: [
    { id: 'epilogue', eyebrow: 'A FINAL NOTE', layout: 'centered', effect: 'parchmentDrop', blocks: [{ id: 'title', type: 'title', text: 'Begin again, with new eyes.' }] },
    { id: 'epilogue-two', eyebrow: 'ONE MORE THOUGHT', layout: 'centered', effect: 'parchmentDrop', blocks: [{ id: 'title', type: 'title', text: 'Every path leaves a trace.' }] },
    { id: 'saved-map', eyebrow: 'THE COMPLETED JOURNEY', layout: 'diagram', effect: 'parchmentExit', exit: { style: 'drift' }, restoreSceneId: 'route-2', blocks: [] },
  ] },
};
export default routeDeck;
