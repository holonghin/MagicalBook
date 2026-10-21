import katex from 'katex';
import { bookDiagram } from '../../../components/book-diagram';
export { demoSequence } from '../../../components/demo-sequence';
import { demoSequence } from '../../../components/demo-sequence';
import type { DemoSequence } from '../../../components/demo-sequence';

/** Content-authored semantic positions, never inferred from buttons/DOM order. */
export function teachingBeats<T extends Record<string, number | boolean>>(w: ReturnType<typeof widget>,
  beats: readonly { label: string; state: T }[], apply: (state: T) => void, sweep: (keyof T)[] = []) {
  const seq = demoSequence(w.figure, beats.length - 1, step => {
    apply(beats[step].state); return sweep.length ? [] : [w.output];
  });
  seq.labels = beats.map(beat => beat.label);
  if (sweep.length) {
    seq.duration = 700;
    seq.transition = (from, to, progress) => {
      const t = progress * progress * (3 - 2 * progress), state = { ...beats[to].state };
      for (const key of sweep) {
        const a = beats[from].state[key], b = beats[to].state[key];
        if (typeof a === 'number' && typeof b === 'number') state[key] = (a + (b - a) * t) as T[keyof T];
      }
      apply(state);
    };
  }
  seq.setStep(0); return seq;
}

export function sequenceControls(host: HTMLElement, sequence: DemoSequence, next = 'Next idea', back = 'Previous idea') {
  button(host, back, () => sequence.request(sequence.step - 1)).dataset.demoDelta = '-1';
  button(host, next, () => sequence.request(sequence.step + 1)).dataset.demoDelta = '1';
  button(host, 'Reset demonstration', () => sequence.request(0));
}

export const esc = (s: string) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
export const fixed = (v: number, digits = 3) => Math.abs(v) < .5 * 10 ** -digits ? '0' : v.toFixed(digits).replace(/\.?0+$/, '');
export function math(el: HTMLElement, tex: string) { katex.render(tex, el, { displayMode: true, throwOnError: true, trust: false }); }
export function widget(name: string) {
  const figure = bookDiagram(name); figure.classList.add('calc-demo');
  const drawing = document.createElement('div'); drawing.className = 'calc-drawing';
  const controls = document.createElement('div'); controls.className = 'calc-controls';
  const output = document.createElement('div'); output.className = 'calc-readout'; output.setAttribute('aria-live', 'polite');
  figure.append(drawing, controls, output);
  return { figure, drawing, controls, output };
}
function explore(host: HTMLElement) {
  const figure = host.closest<HTMLElement>('.calc-demo');
  if (figure) { figure.dataset.demoExploring = 'true'; figure.dispatchEvent(new Event('demo-explore', { bubbles: true })); }
}
export function slider(host: HTMLElement, name: string, min: number, max: number, value: number, update: (n: number) => void, step = .01) {
  const label = document.createElement('label'); label.className = 'calc-slider';
  const text = document.createElement('span'); text.textContent = name;
  const input = document.createElement('input'); input.type = 'range'; input.min = String(min); input.max = String(max); input.step = String(step); input.value = String(value); input.setAttribute('aria-label', name);
  input.addEventListener('input', () => { update(Number(input.value)); explore(host); });
  label.append(text, input); host.append(label); return input;
}
export function button(host: HTMLElement, name: string, run: () => void) {
  const b = document.createElement('button'); b.type = 'button'; b.textContent = name; b.addEventListener('click', () => { explore(host); run(); }); host.append(b); return b;
}
export function choices(host: HTMLElement, names: string[], update: (i: number) => void, initial = 0) {
  let buttons: HTMLButtonElement[] = [];
  buttons = names.map((name, i) => button(host, name, () => { buttons.forEach((b, j) => b.setAttribute('aria-pressed', String(i === j))); update(i); }));
  buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === initial)));
  return buttons;
}
export function reflectChoice(buttons: HTMLButtonElement[] | undefined, active: number) {
  buttons?.forEach((button, i) => button.setAttribute('aria-pressed', String(i === active)));
}

export class Plot {
  readonly w = 900; readonly h = 320;
  constructor(readonly xmin: number, readonly xmax: number, readonly ymin: number, readonly ymax: number) {}
  x(x: number) { return 65 + (x - this.xmin) / (this.xmax - this.xmin) * 785; }
  y(y: number) { return 274 - (y - this.ymin) / (this.ymax - this.ymin) * 250; }
  point(x: number, y: number, label = '', cls = 'calc-point', hollow = false) {
    return `<circle class="${cls}${hollow ? ' hollow' : ''}" cx="${this.x(x)}" cy="${this.y(y)}" r="5.5"/>${label ? this.text(x, y, label, -14) : ''}`;
  }
  text(x: number, y: number, label: string, dy = 0, cls = '') {
    return `<text class="${cls}" x="${this.x(x)}" y="${this.y(y) + dy}" text-anchor="middle">${esc(label)}</text>`;
  }
  line(x1: number, y1: number, x2: number, y2: number, cls = 'calc-guide') {
    return `<path class="${cls}" d="M${this.x(x1)},${this.y(y1)}L${this.x(x2)},${this.y(y2)}"/>`;
  }
  band(x1: number, x2: number, y1: number, y2: number, cls = 'calc-band') {
    return `<rect class="${cls}" x="${this.x(x1)}" y="${this.y(y2)}" width="${this.x(x2) - this.x(x1)}" height="${this.y(y1) - this.y(y2)}"/>`;
  }
  curve(f: (x: number) => number, lo = this.xmin, hi = this.xmax, cls = 'calc-curve', samples = 450) {
    let d = '', pen = false;
    for (let i = 0; i <= samples; i++) {
      const x = lo + (hi - lo) * i / samples, y = f(x);
      if (!Number.isFinite(y)) { pen = false; continue; }
      d += `${pen ? 'L' : 'M'}${this.x(x).toFixed(2)},${this.y(y).toFixed(2)}`; pen = true;
    }
    return `<path class="${cls}" d="${d}"/>`;
  }
  axes() {
    let s = '';
    if (this.ymin <= 0 && this.ymax >= 0) s += this.line(this.xmin, 0, this.xmax, 0, 'calc-axis');
    if (this.xmin <= 0 && this.xmax >= 0) s += this.line(0, this.ymin, 0, this.ymax, 'calc-axis');
    for (let i = 0; i <= 4; i++) {
      const x = this.xmin + (this.xmax - this.xmin) * i / 4, y = this.ymin + (this.ymax - this.ymin) * i / 4;
      s += `<text class="calc-tick" x="${this.x(x)}" y="307" text-anchor="middle">${fixed(x, 2)}</text>`;
      s += `<text class="calc-tick" x="52" y="${this.y(y) + 6}" text-anchor="end">${fixed(y, 2)}</text>`;
    }
    return s + '<text x="876" y="302">x</text><text x="25" y="18">y</text>';
  }
  svg(ink: string, axes = true) {
    // Nested SVG is its own clipping viewport; no shared/duplicate clip IDs.
    return `<svg viewBox="0 0 900 320" role="img" aria-label="Mathematical ink illustration">${axes ? this.axes() : ''}<svg x="65" y="24" width="785" height="250" viewBox="65 24 785 250" overflow="hidden">${ink}</svg></svg>`;
  }
}
