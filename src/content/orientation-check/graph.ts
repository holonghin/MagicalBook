import type { RouteGraph, GraphOrientationPolicy } from '../../engine/types';
import { nodes } from './nodes';
import { connections } from './connections';
const policies: Record<string, GraphOrientationPolicy> = {
  FH: { mode: 'fixed-horizontal' }, FV: { mode: 'fixed-vertical' },
  THV: { mode: 'timeline', initial: 'horizontal', changes: [{ atStep: 'branch', to: 'vertical' }] },
  TVH: { mode: 'timeline', initial: 'vertical', changes: [{ atStep: 'branch', to: 'horizontal' }] },
  THVH: { mode: 'timeline', initial: 'horizontal', changes: [{ atStep: 'branch', to: 'vertical' }, { atStep: 'settle', to: 'horizontal' }] },
  TVHV: { mode: 'timeline', initial: 'vertical', changes: [{ atStep: 'branch', to: 'horizontal' }, { atStep: 'settle', to: 'vertical' }] },
};
// QA content only: each case is an ordinary author-declared orientation policy.
export const caseId = new URLSearchParams(location.search).get('case') ?? 'THVH';
if (!policies[caseId]) throw new Error(`Unknown orientation specimen: ${caseId}`);
export const graph: RouteGraph = {
  id: 'survey', title: 'One map, many directions', orientation: policies[caseId],
  nodes: nodes.map((n, i) => ({ id: n.id, label: n.id[0].toUpperCase() + n.id.slice(1), slideIds: n.slides.map(s => s.id), unlockStep: i < 2 ? 0 : i === 2 ? 1 : i < 5 ? 2 : 3 })),
  edges: connections,
};
