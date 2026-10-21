import type { BlockRenderer } from '../../../engine/types';
import { demoSequence, math, sequenceControls, widget } from './ink';

const raw = String.raw;

/** Classification stays on the page; each newly introduced form uses common ink. */
export const limitForms: BlockRenderer = () => {
  const w = widget('Seven indeterminate forms contrasted with determined positive-base powers');
  w.drawing.classList.add('calc-form-groups');
  const groups = ['Quotients', 'Products / differences', 'Powers', 'Not indeterminate'];
  const columns = groups.map((name, i) => {
    const column = document.createElement('section'); column.className = 'calc-form-group';
    if (i === 3) column.classList.add('is-determined');
    const heading = document.createElement('h3'); heading.textContent = name; column.append(heading); w.drawing.append(column); return column;
  });
  const forms = [
    [0, raw`0/0`], [0, raw`\infty/\infty`], [1, raw`0\cdot\infty`], [1, raw`\infty-\infty`],
    [2, raw`0^0`], [2, raw`1^\infty`], [2, raw`\infty^0`],
    [3, raw`0^{+\infty}\longrightarrow0`], [3, raw`(+\infty)^{+\infty}\longrightarrow+\infty`],
  ] as const;
  const cards = forms.map(([group, formula]) => {
    const card = document.createElement('div'); card.className = 'calc-form-card'; card.dataset.form = formula;
    card.dataset.classification = group === 3 ? 'determined' : 'indeterminate'; math(card, formula); columns[group].append(card); return card;
  });
  const seq = demoSequence(w.figure, cards.length - 1, step => {
    cards.forEach((card, i) => { card.style.visibility = i <= step ? 'visible' : 'hidden'; card.dataset.active = String(i === step); });
    w.output.textContent = step < 7 ? 'Form alone does not determine the limit.' : 'Positive bases with the indicated limits: these powers are already determined.';
    return [cards[step], w.output];
  });
  seq.labels = ['Indeterminate quotient: 0 / 0', 'Indeterminate quotient: ∞ / ∞', 'Indeterminate product', 'Indeterminate difference',
    'Indeterminate power: 0⁰', 'Indeterminate power: 1^∞', 'Indeterminate power: ∞⁰', 'Determined: positive base → 0, exponent → +∞', 'Determined: base and exponent → +∞'];
  sequenceControls(w.controls, seq, 'Next form'); seq.setStep(0); return w.figure;
};

interface Transformation { label: string; lines: string[]; cues: string[] }
const conversions: Record<'product' | 'difference' | 'power', Transformation[]> = {
  product: [{ label: 'A signed product, x → 0⁺', lines: [
    raw`x\ln x\qquad(0\cdot(-\infty))`,
    raw`x\ln x=\frac{\color{#87602d}{\ln x}}{\color{#405c55}{1/x}}\qquad(-\infty)/(+\infty)`,
    raw`\frac{(\ln x)'}{(1/x)'}=\frac{1/x}{-1/x^2}=-x\longrightarrow0`,
    raw`\therefore\quad\lim_{x\to0^+}x\ln x=0`,
  ], cues: ['A product is not yet a L’Hôpital quotient.', 'Rewrite first. Both functions are differentiable for x > 0; (1/x)′ ≠ 0 there.', 'The quotient is defined; its derivative ratio tends to 0. All conditions now hold.', 'Apply the rule only after the checks—not to the original product.'] }],
  difference: [{ label: 'A difference, x → +∞', lines: [
    raw`\sqrt{x^2+x}-x\qquad(\infty-\infty)`,
    raw`=\frac{(\sqrt{x^2+x}-x)(\sqrt{x^2+x}+x)}{\sqrt{x^2+x}+x}=\frac{x^2+x-x^2}{\sqrt{x^2+x}+x}`,
    raw`=\frac{x}{\sqrt{x^2+x}+x}=\frac{1}{\sqrt{1+1/x}+1}\longrightarrow\frac12`,
  ], cues: ['Use the conjugate, with x > 0.', 'The numerator becomes x by the difference-of-squares identity.', 'Divide by x > 0. Algebra finishes the limit; no differentiation is needed.'] }],
  power: [
    { label: '0⁰ form: x → 0⁺', lines: [raw`y=x^x\quad(x>0)`, raw`\ln y=x\ln x\longrightarrow0`, raw`y=e^{\ln y}\longrightarrow e^0=1`], cues: ['Take logarithms of a positive base.', 'Use the product limit just established.', 'Exponentiate the known logarithmic limit.'] },
    { label: '1^∞ form: x → +∞', lines: [raw`y=(1+1/x)^x\quad(x>0)`, raw`\ln y=\frac{\ln(1+1/x)}{1/x}\longrightarrow1`, raw`y\longrightarrow e^1=e`], cues: ['The base tends to 1; the exponent diverges.', 'Set t = 1/x → 0⁺; ln(1+t)/t → 1. No new L’Hôpital invocation.', 'The logarithmic limit is 1, so the power tends to e.'] },
    { label: '∞⁰ form: x → +∞', lines: [raw`y=x^{1/\ln x}\quad(x>1)`, raw`\ln y=\frac{\ln x}{\ln x}=1`, raw`y=e\quad\text{for every }x>1`], cues: ['Keep ln x nonzero: x > 1.', 'The logarithms cancel exactly.', 'Here the expression equals e even before taking a limit.'] },
  ],
};

/** A stable, cumulative derivation: new lines ignite; established algebra stays. */
export function limitConversion(kind: keyof typeof conversions): BlockRenderer {
  return () => {
    const w = widget(`Convert ${kind} forms before using a quotient theorem`);
    w.drawing.classList.add('calc-transform'); w.figure.dataset.conversion = kind;
    const heading = document.createElement('h3'); w.drawing.append(heading);
    const rows = Array.from({ length: Math.max(...conversions[kind].map(c => c.lines.length)) }, () => {
      const row = document.createElement('div'); row.className = 'calc-transform-row'; w.drawing.append(row); return row;
    });
    const beats = conversions[kind].flatMap((c, ci) => c.lines.map((_, line) => ({ ci, line })));
    const seq = demoSequence(w.figure, beats.length - 1, (step, previous) => {
      const { ci, line } = beats[step], c = conversions[kind][ci], changedCase = ci !== beats[previous].ci;
      heading.textContent = c.label;
      rows.forEach((row, i) => { row.style.visibility = i <= line && i < c.lines.length ? 'visible' : 'hidden'; row.dataset.active = String(i === line); if (c.lines[i]) math(row, c.lines[i]); });
      w.output.textContent = c.cues[line]; w.figure.dataset.case = String(ci);
      return [w.output, ...(changedCase ? [heading, ...rows.slice(0, line + 1)] : [rows[line]])];
    });
    seq.labels = beats.map(({ ci, line }) => conversions[kind][ci].cues[line]);
    sequenceControls(w.controls, seq, 'Transform / conclude'); seq.setStep(0); return w.figure;
  };
}
