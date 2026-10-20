import type { RouteGraph, Slide } from './types';
export type GraphOrientation = 'horizontal' | 'vertical';
/** Compile once from authored sequence order, never from DOM/view history. */
export function graphOrientation(graph: RouteGraph, steps: Slide[]) {
  if (new Set(steps.map(s => s.id)).size !== steps.length) throw new Error('Authored graph step IDs must be unique.');
  const valid = (axis: unknown): axis is GraphOrientation => axis === 'horizontal' || axis === 'vertical';
  const initial = graph.layout ?? 'horizontal';
  if (!valid(initial)) throw new Error('Invalid graph layout.');
  const policy = graph.orientation ?? (steps.some(s => s.graphLayout && s.graphLayout !== initial)
    ? { mode: 'timeline' as const, initial, changes: steps.filter(s => s.graphLayout).map(s => ({ atStep: s.id, to: s.graphLayout! })) }
    : { mode: initial === 'vertical' ? 'fixed-vertical' as const : 'fixed-horizontal' as const });
  if (!['fixed-horizontal', 'fixed-vertical', 'timeline'].includes(policy.mode)) throw new Error('Graph orientation mode must be fixed-horizontal, fixed-vertical or timeline.');
  const axes = new Map<string, GraphOrientation>();
  let axis: GraphOrientation;
  if (policy.mode !== 'timeline') {
    if ('initial' in policy || 'changes' in policy) throw new Error('Fixed graph orientation must not declare initial or changes.');
    axis = policy.mode === 'fixed-vertical' ? 'vertical' : 'horizontal';
    if (graph.orientation && steps.some(s => s.graphLayout && s.graphLayout !== axis)) throw new Error('A graph step contradicts the fixed orientation policy.');
    steps.forEach(s => axes.set(s.id, axis));
    return { mode: policy.mode, initial: axis, final: axis, at: (_id: string) => axis };
  }
  if (!valid(policy.initial) || !Array.isArray(policy.changes)) throw new Error('Timeline orientation requires a valid initial state and changes array.');
  let last = -1;
  const changes = new Map<string, GraphOrientation>();
  for (const event of policy.changes) {
    const index = steps.findIndex(s => s.id === event.atStep);
    if (index < 0) throw new Error(`Unknown orientation step: ${event.atStep}`);
    if (index <= last) throw new Error('Orientation changes must reference unique steps in authored order.');
    if (!valid(event.to)) throw new Error(`Invalid orientation at ${event.atStep}`);
    changes.set(event.atStep, event.to); last = index;
  }
  axis = policy.initial;
  for (const step of steps) { axis = changes.get(step.id) ?? axis; axes.set(step.id, axis); }
  return { mode: policy.mode, initial: policy.initial, final: axis, at: (id: string) => axes.get(id) ?? policy.initial };
}
