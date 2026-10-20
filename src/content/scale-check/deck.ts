import { definePresentation } from '../../engine/content';
import { nodes } from './nodes/content';
import { graph } from './graph';
export default definePresentation({
  config: { id: 'scale-check', coverTitle: 'The Survey', language: 'en', seed: 37 },
  chapters: [{ id: 'survey-intro', eyebrow: 'THE SURVEY', layout: 'centered', blocks: [{ id: 'title', type: 'title', text: 'A world of observations.' }] }], nodes, graph,
  sequence: ['survey-intro', { graphStep: 0, title: 'One beginning.' }, { graphStep: 1, title: 'Six routes.' }, { graphStep: 2, title: 'Thirty observations.' }], secondActEnding: { enabled: false },
});
