import { definePresentation } from '../../engine/content';
import { graph, caseId } from './graph';
import { nodes } from './nodes';
export default definePresentation({
  config: { id: `orientation-${caseId}`, coverTitle: 'The Turning Atlas', language: 'en', seed: 606 },
  chapters: [{ id: 'welcome', eyebrow: 'A FIELD ATLAS', layout: 'centered', blocks: [{ id: 'title', type: 'title', text: 'Follow the same thread.' }] }],
  nodes, graph,
  sequence: ['welcome', ...['seed', 'trace', 'branch', 'gather', 'settle'].map((id, i) => ({ id, graphStep: Math.min(i, 3), title: `${id[0].toUpperCase() + id.slice(1)}.` }))],
  secondActEnding: { enabled: false },
});
