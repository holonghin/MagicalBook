import { teacherOrder, groupOf, groups } from '../slides/builders';
export type ConnectionKind = 'prerequisite' | 'implication' | 'application' | 'conceptual relation';
export interface Connection { id: string; from: string; to: string; unlockStep: number; kind: ConnectionKind; meaning: string; layoutConstraint?: boolean }
export const stepOf = (id: string) => id === 'F0' ? 0 : id.startsWith('G') ? 1 : teacherOrder.indexOf(id) + 2;
const links: [string, string, ConnectionKind, string][] = [
  ['F0', 'D6', 'prerequisite', 'An injective function has an inverse on its range.'],
  ['F0', 'P6', 'conceptual relation', 'Strict monotonicity is defined first; MVT later gives derivative criteria.'],
  ['P6', 'D6', 'application', 'Monotone restrictions provide inverses; the derivative formula also needs nonzero slope and a continuous local inverse.'],
  ['P6', 'D7', 'application', 'Restrict a trig function to a principal monotone branch before inverting.'],
  ['L1', 'P1', 'application', 'Continuity licenses direct substitution; a limit alone does not give continuity.'],
  ['L2', 'P1', 'prerequisite', 'Compare one-sided limits at an interior joining point.'],
  ['L2', 'P3', 'prerequisite', 'Compare one-sided difference quotients at a join.'],
  ['P1', 'P2', 'prerequisite', 'IVT requires continuity on the entire closed interval.'],
  ['D1', 'P3', 'implication', 'A finite derivative at a point forces continuity there.'],
  ['P4', 'P5', 'conceptual relation', 'Rolle is equal-endpoint MVT; subtracting a secant reduces MVT to Rolle.'],
  ['P5', 'P6', 'implication', 'MVT turns derivative signs throughout an interval into monotonicity.'],
  ['P6', 'A5', 'application', 'Signs on neighboring intervals determine local turning under continuity at the candidate.'],
  ['P2', 'P6', 'application', 'Root strategy: IVT gives at least one; strict monotonicity gives at most one.'],
  ['D2', 'L6', 'application', 'Rules calculate derivative quotients only after L’Hôpital hypotheses are checked.'],
  ['D3', 'L6', 'application', 'Chain Rule calculates derivative quotients; it does not supply L’Hôpital hypotheses.'],
  ['P5', 'L6', 'conceptual relation', 'Cauchy’s MVT is the theoretical bridge; ordinary MVT alone is not L’Hôpital.'],
  ['D3', 'D4', 'application', 'Logarithmic differentiation uses Chain Rule on ln y.'],
  ['D3', 'D5', 'application', 'Every y(x) term carries its inner rate.'],
  ['D3', 'D8', 'application', 'Differentiate linked quantities with respect to time.'],
  ['D5', 'X1', 'application', 'A finite implicit slope can define a local linearization.'],
  ['A2', 'A9', 'application', 'Critical numbers supply candidates, not automatic optima.'],
  ['A3', 'A9', 'application', 'EVT guarantees attainment for continuous objectives on closed bounded intervals.'],
  ['A4', 'A9', 'application', 'Interior differentiable extrema must be stationary; inspect allowed boundaries too.'],
  ['A5', 'A8', 'application', 'Slope sign intervals constrain graph shape.'],
  ['A6', 'A8', 'application', 'Concavity and genuine inflections constrain graph shape.'],
  ['A7', 'A8', 'application', 'One-sided and infinite limits supply boundary guides.'],
  ['A8', 'X1', 'conceptual relation', 'From the whole shape, return to a point and its tangent.'],
  ['D1', 'X1', 'conceptual relation', 'Differentiability means first-order linear behavior.'],
  ['X1', 'X2', 'application', 'The linear model predicts dy=f′(a)dx.'],
  ['X2', 'X3', 'conceptual relation', 'Actual change minus predicted change is the signed error.'],
  ['A6', 'X3', 'application', 'Concavity throughout the segment controls which side of the tangent the graph occupies.'],
  ['P5', 'X3', 'conceptual relation', 'Mean-value ideas yield error bounds with additional smoothness.'],
  ['P5', 'L5', 'application', 'A bound on |f′|, with MVT hypotheses, bounds changes and enables squeeze estimates.'],
];
export const connections: Connection[] = [
  ...groups.map(([id, title]): Connection => ({ id: `goal-${id}`, from: 'F0', to: id, unlockStep: 1, kind: 'conceptual relation', meaning: title })),
  ...teacherOrder.map(id => ({ id: `branch-${id}`, from: groupOf(id)!, to: id, unlockStep: stepOf(id), kind: 'conceptual relation' as const, meaning: 'A question within this branch; not a logical implication.' })),
  ...links.map(([from, to, kind, meaning]) => ({ id: `link-${from}-${to}`, from, to, kind, meaning, unlockStep: Math.max(stepOf(from), stepOf(to)) + 1, layoutConstraint: false })),
];
