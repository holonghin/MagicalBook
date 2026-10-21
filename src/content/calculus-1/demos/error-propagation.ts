import type { BlockRenderer } from '../../../engine/types';
import { demoSequence, fixed, math, sequenceControls, slider, widget } from './ink';

const raw = String.raw;
export const errorQuantities: BlockRenderer = () => {
  const w = widget('Absolute, relative and percentage measurement-error magnitudes');
  w.drawing.classList.add('calc-error-quantities');
  const formulas = [
    raw`\text{Absolute error:}\quad|\Delta y|\approx|dy|=|f'(x)dx|`,
    raw`\text{Relative error:}\quad\left|\frac{\Delta y}{y}\right|\approx\left|\frac{dy}{y}\right|=\left|\frac{f'(x)dx}{f(x)}\right|`,
    raw`\text{Percentage error:}\quad\left|\frac{\Delta y}{y}\right|\!\times100\%\approx\left|\frac{dy}{y}\right|\!\times100\%`,
  ];
  const rows = formulas.map(formula => { const row = document.createElement('div'); row.className = 'calc-transform-row'; math(row, formula); w.drawing.append(row); return row; });
  const cues = ['Output perturbation magnitude—not the tangent residual E = Δy − dy.', 'Divide by the nonzero reference output. Relative error is undefined when y = 0.', 'For small input perturbations, use the differential to estimate these magnitudes.'];
  const seq = demoSequence(w.figure, 2, step => {
    rows.forEach((row, i) => { row.style.visibility = i <= step ? 'visible' : 'hidden'; row.dataset.active = String(i === step); });
    w.output.textContent = cues[step]; return [rows[step], w.output];
  });
  seq.labels = cues; sequenceControls(w.controls, seq, 'Next error quantity'); seq.setStep(0); return w.figure;
};

/** Signed exact changes and their differential predictions, with r > 0. */
export function circleAreaChange(relativeRadius: number, radius = 10) {
  const area = Math.PI * radius * radius, dr = radius * relativeRadius;
  return { radius, dr, area, differential: 2 * Math.PI * radius * dr,
    actual: Math.PI * (2 * radius * dr + dr * dr), relativeDifferential: 2 * relativeRadius,
    relativeActual: 2 * relativeRadius + relativeRadius * relativeRadius };
}

export const circlePropagation: BlockRenderer = () => {
  const w = widget('A small radius uncertainty propagates to circle area');
  w.figure.classList.add('calc-area-propagation');
  const illustration = document.createElement('div'); illustration.className = 'calc-area-illustration';
  // Geometry is persistent; neither the circle nor its page is replaced by beats.
  illustration.innerHTML = '<svg viewBox="0 0 440 320" role="img" aria-label="True-scale radius perturbation and shaded area change"><circle class="calc-area-base" cx="150" cy="150" r="110"/><circle class="calc-area-ring" cx="150" cy="150" r="110"/><circle class="calc-area-new" cx="150" cy="150" r="110"/><path class="calc-change-dx" d="M150 150H260"/><path class="calc-change-actual"/><circle class="calc-point" cx="150" cy="150" r="3"/><text x="166" y="139">r = 10 cm</text><g class="calc-area-inset" aria-label="Separate local radial gap magnified ten times"><text x="350" y="54" text-anchor="middle">edge ×10</text><path class="calc-guide" d="M350 80V220"/><path class="calc-area-gap calc-change-actual"/><text x="350" y="250" text-anchor="middle">local gap</text></g><text x="220" y="304" text-anchor="middle">Circle at true scale · gap inset ×10</text></svg>';
  const panel = document.createElement('div'); panel.className = 'calc-area-equations';
  const formulas = [raw`A=\pi r^2`, raw`dA=2\pi r\,dr,\qquad\frac{dA}{A}=2\frac{dr}{r}`, raw`\Delta A=2\pi r\Delta r+\pi(\Delta r)^2`];
  const rows = formulas.map(tex => { const row = document.createElement('div'); math(row, tex); panel.append(row); return row; });
  w.drawing.append(illustration, panel); w.drawing.classList.add('calc-area-drawing');
  const svg = illustration.querySelector('svg')!, ring = svg.querySelector('.calc-area-ring')!, edge = svg.querySelector('.calc-area-new')!, radiusLine = svg.querySelector('.calc-change-actual')!, gap = svg.querySelector('.calc-area-gap')!;
  let fraction = 0, fromFraction = 0, targetFraction = 0, stage = 0;
  const draw = () => {
    const v = circleAreaChange(fraction), r = 110 * (1 + fraction);
    ring.setAttribute('r', String((110 + r) / 2)); ring.setAttribute('stroke-width', String(Math.abs(r - 110))); edge.setAttribute('r', String(r));
    radiusLine.setAttribute('d', `M150 150L${150 + r / Math.sqrt(2)} ${150 - r / Math.sqrt(2)}`);
    gap.setAttribute('d', `M${350 + fraction * 110 * 10} 80V220`);
    Object.assign(w.figure.dataset, { relativeRadius: String(fraction), relativeActual: String(v.relativeActual), relativeDifferential: String(v.relativeDifferential), actualArea: String(v.actual), differentialArea: String(v.differential) });
    math(w.output, raw`\frac{\Delta r}{r}=` + fixed(100 * fraction, 2) + raw`\%:\quad\underbrace{\frac{dA}{A}=` + fixed(100 * v.relativeDifferential, 3) + raw`\%}_{\text{linear prediction}}\quad\underbrace{\frac{\Delta A}{A}=` + fixed(100 * v.relativeActual, 4) + raw`\%}_{\text{exact change}}`);
    rows.forEach((row, i) => row.style.visibility = i <= stage ? 'visible' : 'hidden');
  };
  const control = slider(w.controls, 'Radius change (%)', -5, 5, 0, value => {
    fraction = value / 100; draw();
    // Native exploration uses the same sequence event and magical inscription.
    exploring = true; seq.request(seq.step);
  }, .1);
  let exploring = false;
  const poses = [0, .01, -.01, .005];
  const seq = demoSequence(w.figure, 3, step => {
    fromFraction = fraction; targetFraction = exploring ? fraction : poses[step]; exploring = false; stage = Math.min(2, step);
    fraction = targetFraction; control.value = String(100 * fraction); draw();
    return [w.output, ...(step === 1 ? [rows[1]] : step === 2 ? [rows[2]] : [])];
  });
  seq.duration = 850; seq.revealAfterMotion = true;
  seq.transition = (_from, _to, progress) => { const t = progress * progress * (3 - 2 * progress); fraction = progress >= 1 ? targetFraction : progress <= 0 ? fromFraction : fromFraction + (targetFraction - fromFraction) * t; draw(); };
  seq.labels = ['Reference circle: r = 10 cm', 'Increase radius by 1%: predict 2% area change', 'Decrease by 1%: compare exact and linear changes', 'Halve the uncertainty: compare 1% with 1.0025%'];
  sequenceControls(w.controls, seq, 'Perturb / compare'); seq.setStep(0); return w.figure;
};
