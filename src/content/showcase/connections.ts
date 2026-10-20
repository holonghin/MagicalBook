import type { RouteGraph } from '../../engine/types';
export const connections: RouteGraph['edges'] = [
  { id: 'first-thread', from: 'wonder', to: 'attention', unlockStep: 1 },
  ...['question', 'pattern', 'story', 'experiment', 'reflection'].map(id => ({ id: `branch-${id}`, from: 'attention', to: id, unlockStep: 2 })),
  ...['question', 'story', 'reflection', 'memory'].map(id => ({ id: `converge-${id}`, from: id, to: 'sharing', unlockStep: 3 })),
];
