import { definePresentation } from '../../engine/content';
import { introduction } from './chapters/introduction';
import { nodes } from './nodes/content';
import { graph } from './graph';
import { compass } from './nodes/compass/demo';
import { ending } from './ending/content';

export default definePresentation({
  config: { id: 'showcase', coverTitle: 'Atlas of Wonder', coverNote: { enabled: true, text: 'for the roads not yet taken' }, language: 'en', seed: 1729 },
  chapters: introduction, nodes, graph, demos: { compass },
  sequence: [
    ...introduction.map(s => s.id),
    { graphStep: 0, title: 'Two beginnings.' },
    { graphStep: 1, title: 'Follow a single thread.' },
    { graphStep: 2, title: 'Five possibilities, one moment.' },
    { graphStep: 3, title: 'The threads converge.' },
    { id: 'turn-map', graphStep: 3, title: 'Another direction. The same journey.' },
    { graphStep: 2, title: 'Retrace the last thread.' },
    { graphStep: 1, title: 'Return to the branching point.' },
    { graphStep: 3, title: 'A shared destination.' },
  ],
  secondActEnding: { enabled: true },
  ending,
});

