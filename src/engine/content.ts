import type { BlockRenderer, Deck, DeckConfig, RouteGraph, Slide } from './types';
import { graphOrientation } from './graph-orientation';

export interface ContentNode { id: string; slides: Slide[] }
export type ContentStep = string | { id?: string; graphStep: number; title: string; layout?: 'horizontal' | 'vertical' };
export interface PresentationContent {
  config: DeckConfig;
  chapters: Slide[];
  nodes?: ContentNode[];
  graph?: RouteGraph;
  sequence: ContentStep[];
  /** The single optional presentation-level cinematic choice.
   * Boolean values remain accepted for content authored before the v2 contract. */
  secondActEnding: { enabled: boolean } | boolean;
  ending?: Slide[];
  demos?: Record<string, BlockRenderer>;
}

/** Content authors describe scenes; this compiler owns the presentation grammar. */
export function definePresentation(content: PresentationContent): Deck {
  const normalize = (slide: Slide, kind: Slide['kind']): Slide => {
    const { effect: _effect, paperBurn: _burn, drop: _drop, exit: _exit, ...scene } = slide;
    return { ...scene, kind };
  };
  const chapters = content.chapters.map(s => normalize(s, s.kind === 'chapter' ? 'chapter' : 'ordinary'));
  const nodes = (content.nodes ?? []).flatMap(n => n.slides.map(s => normalize(s, 'node')));
  const scenes: Slide[] = [...chapters, ...nodes];
  const flow = content.sequence.map((step, i) => {
    if (typeof step === 'string') return step;
    if (!content.graph) throw new Error('A graph sequence step requires graph.ts.');
    const id = step.id ?? `@graph-${i}`;
    scenes.push(graphScene(id, step.title, step.graphStep, step.layout));
    return id;
  });
  const secondAct = typeof content.secondActEnding === 'boolean' ? content.secondActEnding : content.secondActEnding.enabled;
  if (secondAct) {
    for (const slide of content.ending ?? []) {
      const recap: Slide = { ...normalize(slide, 'recap'), effect: 'parchmentDrop' };
      scenes.push(recap); flow.push(recap.id);
    }
  }
  const finalGraphId = content.graph ? '@completed-graph' : undefined;
  if (finalGraphId) {
    scenes.push({ ...graphScene(finalGraphId, content.graph?.title ?? content.config.coverTitle, Number.MAX_SAFE_INTEGER, content.graph?.layout), kind: 'finalGraph' });
    flow.push(finalGraphId);
  }
  const deck: Deck = {
    config: content.config, sections: [{ id: 'content', title: content.config.coverTitle, slides: scenes }],
    flow, routeGraph: content.graph, finalGraphId, renderers: content.demos, contentVersion: 2,
  };
  validateDeck(deck);
  return deck;
}

function graphScene(id: string, title: string, routeStep: number, graphLayout?: 'horizontal' | 'vertical'): Slide {
  return { id, eyebrow: 'A THREAD OF KNOWLEDGE', layout: 'diagram', kind: 'graph', routeStep, graphLayout,
    blocks: [{ id: 'title', type: 'title', text: title }, { id: 'map', type: 'diagram', renderer: 'route' }] };
}

export function validateDeck(deck: Deck) {
  const slides = [...deck.sections.flatMap(s => s.slides), ...(deck.ending?.enabled ? deck.ending.slides : [])];
  const ids = new Set<string>();
  for (const slide of slides) {
    if (ids.has(slide.id)) throw new Error(`Duplicate slide ID: ${slide.id}`);
    ids.add(slide.id);
    const blocks = new Set<string>();
    for (const block of slide.blocks) {
      if (blocks.has(block.id)) throw new Error(`Duplicate block ${block.id} in ${slide.id}`);
      blocks.add(block.id);
      if (block.renderer && !['route', 'mathml'].includes(block.renderer) && !deck.renderers?.[block.renderer])
        throw new Error(`Missing demo "${block.renderer}" on slide "${slide.id}". Export it from this content folder's demos entry.`);
    }
    if (slide.restoreSceneId && !slides.some(s => s.id === slide.restoreSceneId)) throw new Error(`Unknown saved scene: ${slide.restoreSceneId}`);
  }
  for (const id of deck.flow ?? []) if (!ids.has(id)) throw new Error(`Unknown sequence slide: ${id}`);
  const graph = deck.routeGraph;
  if (!graph) return;
  const order = deck.flow ? deck.flow.map(id => slides.find(s => s.id === id)!) : slides;
  graphOrientation(graph, order.filter(s => s.routeStep !== undefined && s.kind !== 'finalGraph'));
  const nodeIds = new Set<string>(), edgeIds = new Set<string>();
  for (const node of graph.nodes) {
    if (nodeIds.has(node.id)) throw new Error(`Duplicate graph node: ${node.id}`);
    nodeIds.add(node.id);
    if (!node.slideIds.length) throw new Error(`Node ${node.id} needs at least one slide.`);
    for (const id of node.slideIds) if (!ids.has(id)) throw new Error(`Node ${node.id} references missing slide: ${id}`);
  }
  for (const edge of graph.edges) {
    if (edgeIds.has(edge.id)) throw new Error(`Duplicate edge ID: ${edge.id}`);
    edgeIds.add(edge.id);
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) throw new Error(`Edge ${edge.id} references an unknown node: ${edge.from} → ${edge.to}`);
    const from = graph.nodes.find(n => n.id === edge.from)!, to = graph.nodes.find(n => n.id === edge.to)!;
    if (edge.unlockStep < Math.max(from.unlockStep, to.unlockStep)) throw new Error(`Edge ${edge.id} unlocks before its endpoints.`);
  }
}
