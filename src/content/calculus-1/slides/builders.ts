import type { ContentBlock, Slide } from '../../../engine/types';

export const tex = String.raw;
export function page(id: string, title: string, formula: string | string[], caption: string, demo?: string, notes?: string): Slide {
  const formulas = typeof formula === 'string' ? [formula] : formula;
  const blocks: ContentBlock[] = [
    { id: 'title', type: 'title', text: title, renderer: 'calc-title' },
    ...formulas.filter(Boolean).map((tex, i): ContentBlock => ({ id: `formula-${i}`, type: 'math', tex })),
  ];
  if (demo) blocks.push({ id: 'illustration', type: 'diagram', renderer: demo });
  if (caption) blocks.push({ id: 'connection', type: 'caption', text: caption });
  return { id, eyebrow: `${id.split('-')[0]} · CALCULUS I`, layout: demo ? 'diagram' : 'centered', blocks, notes };
}

export const teacherOrder = [
  'L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'P1', 'P2',
  'D1', 'P3', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8',
  'P4', 'P5', 'P6', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'X1', 'X2', 'X3',
];
const branchByPrefix: Record<string, string> = { L: 'G1', P: 'G2', D: 'G3', A: 'G4', X: 'G5' };
export const groupOf = (id: string) => branchByPrefix[id[0]];

export const groups = [
  ['G1', 'Evaluate Limits', 'Near a point', 'L1'],
  ['G2', 'Properties of Functions', 'From points to intervals', 'P1'],
  ['G3', 'Find Derivatives & Rates', 'Instantaneous change', 'D1'],
  ['G4', 'Analyze & Optimize Functions', 'Assemble the graph', 'A1'],
  ['G5', 'Approximate a Value', 'Return to one point', 'X1'],
] as const;
