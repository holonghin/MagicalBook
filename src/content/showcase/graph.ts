import type { RouteGraph } from '../../engine/types';
import { nodes } from './nodes/content';
import { connections } from './connections';
export const graph: RouteGraph = {
  title: 'The complete journey', layout: 'horizontal',
  orientation: { mode: 'timeline', initial: 'horizontal', changes: [{ atStep: 'turn-map', to: 'vertical' }] },
  nodes: nodes.map(node => ({ id: node.id, label: node.id[0].toUpperCase() + node.id.slice(1), slideIds: node.slides.map(s => s.id), unlockStep: ['wonder', 'memory'].includes(node.id) ? 0 : node.id === 'attention' ? 1 : node.id === 'sharing' ? 3 : 2 })),
  edges: connections,
};
