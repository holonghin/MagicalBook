import { definePresentation, validateDeck } from '../../engine/content';
import { knowledgeNodes } from './nodes';
import { graph, names } from './knowledge-graph/graph';
import { demos } from './demos';
import { ending } from './slides/ending';
import { teacherOrder, groupOf } from './slides/builders';
import './style.css';

const includeSecondAct = true;
const deck = definePresentation({
  config: { id: 'calculus-1', coverTitle: 'CALCULUS I', language: 'en', seed: 314159, coverNote: { enabled: true, text: 'From Local to Global, and Back Again' } },
  chapters: [], nodes: knowledgeNodes, graph, demos,
  guidedRoute: { steps: [
    { sceneId: 'map-root', nodeId: 'F0', unlock: ['F0'] },
    { sceneId: 'map-goals', nodeId: 'G1', unlock: ['G1'], advanceOnly: true },
    ...teacherOrder.map(id => ({ sceneId: `map-${id}`, nodeId: id, unlock: [groupOf(id)!, id], continuationGroup: ['X1', 'X2', 'X3'].includes(id) ? 'local-approximation' : undefined })),
    { sceneId: 'taught-map', unlock: [] },
  ] },
  sequence: [
    { id: 'map-root', graphStep: 0, title: 'F0 · What is a function?' },
    { id: 'map-goals', graphStep: 1, title: 'How can we understand a function?' },
    ...teacherOrder.map((id, i) => ({ id: `map-${id}`, graphStep: i + 2, title: `${id} · ${names[id][0]}` })),
    { id: 'taught-map', graphStep: 35, title: 'From Local to Global, and Back Again' },
  ],
  secondActEnding: { enabled: includeSecondAct }, ending,
});

const slides = deck.sections[0].slides;
for (const slide of slides.filter(s => s.routeStep !== undefined)) {
  slide.blocks.push({ id: 'semantics', type: 'caption', renderer: 'calc-connections' });
  slide.notes = 'Right enters the selected seal. Within a node, Right advances its demonstration, then pages; the final Right returns and traces the next authorized seal. Left reverses this route. Escape returns without advancing. Home closes directly. G previews the map without unlocking future lessons.';
}

// Compose an existing saved-scene + printed-paper action for this deck's return.
// The normal finalGraph scene stays available for independent Mini-map previews.
if (includeSecondAct) {
  slides.push({ id: 'recap-map-return', eyebrow: 'THE COMPLETE KNOWLEDGE GRAPH', layout: 'diagram', kind: 'finalGraph', routeStep: 35,
    restoreSceneId: 'taught-map', effect: 'parchmentDrop', blocks: [] });
  deck.flow = deck.flow!.filter(id => id !== deck.finalGraphId);
  deck.flow.push('recap-map-return');
}
validateDeck(deck);
export default deck;
