import { definePresentation } from '../../engine/content';
import { graph } from './graph';
import { nodes } from './nodes/content';
import { welcome } from './chapters/welcome';
export default definePresentation({
  config: { id: 'sample', coverTitle: 'An Unwritten Atlas', language: 'en', seed: 42 },
  chapters: [welcome], nodes, graph,
  sequence: ['welcome', { graphStep: 0, title: 'Begin.' }, { graphStep: 1, title: 'Discover.' }],
  secondActEnding: { enabled: false },
});
