import type { RouteGraph } from '../../engine/types';
import { nodes } from './nodes/content';
export const graph: RouteGraph = {
  title: 'The Survey', layout: 'horizontal',
  nodes: nodes.map((node, i) => ({ id: node.id, label: node.slides[0].blocks[0].text!, shortLabel: i > 6 ? `Note ${i - 6}` : undefined,
    note: i > 6 ? 'A small field annotation' : 'A thread of the survey', role: i < 7 ? 'branch' : undefined,
    unlockStep: i === 0 ? 0 : i < 7 ? 1 : 2, slideIds: [node.id] })),
  edges: nodes.slice(1).map((node, i) => ({ id: `thread-${i}`, from: i < 6 ? 'atlas' : `route-${Math.floor((i - 6) / 5)}`, to: node.id, unlockStep: i < 6 ? 1 : 2 })),
};
