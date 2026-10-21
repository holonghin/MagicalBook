import type { RouteGraph } from '../../../engine/types';
import { knowledgeNodes } from '../nodes';
import { groups } from '../slides/builders';
import { connections, stepOf } from './connections';

export const names: Record<string, [string, string]> = {
  F0: ['Function', 'Domain · range'],
  L1: ['Limit Laws & Substitution', 'Near a point'], L2: ['One-Sided Limits', 'Compare available sides'], L3: ['Algebraic Techniques', 'Cancel · conjugate · dominant power'], L4: ['Special Limits', 'Normalize the local pattern'], L5: ['Squeeze Theorem', 'Control by bounds'], L6: ['L’Hôpital’s Rule', 'Hypotheses before calculation'], L7: ['Precise Limits', 'ε–δ guarantee'],
  P1: ['Continuity', 'Value meets limit'], P2: ['Intermediate Value Theorem', 'Existence across an interval'], P3: ['Differentiability ⇒ Continuity', 'Finite slope; converse fails'], P4: ['Rolle’s Theorem', 'Equal heights; horizontal tangent'], P5: ['Mean Value Theorem', 'Instantaneous = interval rate'], P6: ['Monotonicity', 'From local slopes to all pairs'],
  D1: ['Derivative Definition', 'Limit of average slopes'], D2: ['Differentiation Rules', 'Algebra · exponential · trig'], D3: ['Chain Rule', 'Five nested rates'], D4: ['Logarithmic Differentiation', 'Variable powers'], D5: ['Implicit Differentiation', 'Local branches and rates'], D6: ['Inverse Derivative', 'Reciprocal nonzero slopes'], D7: ['Inverse Trigonometry', 'Principal branches'], D8: ['Related Rates', 'Differentiate in time'],
  A1: ['Domain & Boundaries', 'Respect the domain first'], A2: ['Critical Numbers', 'Candidates, not verdicts'], A3: ['Extreme Value Theorem', 'Attainment on a compact interval'], A4: ['Fermat’s Theorem', 'Interior smooth extrema are flat'], A5: ['First Derivative Test', 'Signs across a candidate'], A6: ['Concavity & Inflection', 'How the slope changes'], A7: ['Asymptotes', 'Boundary and far-away guides'], A8: ['Curve Sketching', 'Assemble a coherent shape'], A9: ['Optimization', 'Constraints and global proof'],
  X1: ['Linear Approximation', 'First-order local model'], X2: ['Differentials', 'Rate ≠ predicted change ≠ actual change'], X3: ['Approximation Error', 'Signed gap and bound'],
};
const short: Record<string, string> = { L1: 'Laws', L2: 'Sides', L3: 'Algebra', L4: 'Patterns', L5: 'Squeeze', L6: 'L’Hôp.', L7: 'ε–δ', P1: 'Cont.', P2: 'IVT', P3: 'Diff.', P4: 'Rolle', P5: 'MVT', P6: 'Mono.', D1: 'Slope', D2: 'Rules', D3: 'Chain', D4: 'Log', D5: 'Impl.', D6: 'Inv.', D7: 'Trig', D8: 'Rates', A1: 'Domain', A2: 'Crit.', A3: 'EVT', A4: 'Fermat', A5: 'Signs', A6: 'Concave', A7: 'Asymp.', A8: 'Graph', A9: 'Opt.', X1: 'Local', X2: 'dy', X3: 'Error' };
export const graph: RouteGraph = {
  id: 'calculus-map', title: 'From Local to Global, and Back Again', layout: 'horizontal', orientation: { mode: 'fixed-horizontal' },
  nodes: [
    { id: 'F0', label: 'F0 · Function', shortLabel: 'Function', note: names.F0[1], x: 1, y: 50, unlockStep: 0, slideIds: knowledgeNodes[0].slides.map(s => s.id) },
    ...groups.map(([id, title, bridge], i) => ({ id, label: `${id} · ${title}`, shortLabel: `${id} · ${['Limits', 'Properties', 'Derivatives', 'Analysis', 'Approximation'][i]}`, note: bridge, role: 'branch' as const, x: 16, y: 10 + i * 20, unlockStep: 1, slideIds: [] })),
    ...knowledgeNodes.filter(n => n.id !== 'F0').map(node => {
      const prefixes = ['L', 'P', 'D', 'A', 'X'], row = prefixes.indexOf(node.id[0]);
      const count = [7, 6, 8, 9, 3][row], index = Number(node.id.slice(1)) - 1;
      return { id: node.id, label: `${node.id} · ${names[node.id][0]}`, shortLabel: `${node.id} ${short[node.id]}`, note: names[node.id][1], x: 32 + index * 62 / Math.max(1, count - 1), y: 10 + row * 20 + (index % 2 === 0 ? -4.5 : 4.5), slideIds: node.slides.map(s => s.id), unlockStep: stepOf(node.id) };
    }),
  ],
  edges: connections,
};
