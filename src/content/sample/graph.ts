import type { RouteGraph } from '../../engine/types';
export const graph: RouteGraph = {
  layout: 'horizontal',
  orientation: { mode: 'fixed-horizontal' },
  nodes: [{ id: 'begin', label: 'Begin', slideIds: ['begin-page'], unlockStep: 0 }, { id: 'discover', label: 'Discover', slideIds: ['discover-page'], unlockStep: 1 }],
  edges: [{ id: 'thread', from: 'begin', to: 'discover', unlockStep: 1 }],
};
