import { clamp } from '../effects/timeline';
import { hash } from '../effects/random';
const NS = 'http://www.w3.org/2000/svg';
let serial = 0;
const fills = new WeakMap<HTMLElement, { path: SVGPathElement; heat: SVGPathElement; phase: number; last: number }>();
const border = 'M12 10 Q55 6 92 8 L174 7 Q190 8 191 19 L193 55 Q190 68 175 68 L34 70 Q10 71 8 57 L7 26 Q6 15 12 10Z';
// Seal outlines repeat across nodes and layouts. Cache in SVG units, then apply
// current DOM dimensions so resizing/reflow keeps exact physical attachments.
const anchorGeometry = new Map<string, { x: number; y: number }>();
export function graphNode(label: string, detail: { shortLabel?: string; note?: string } = {}): HTMLButtonElement {
  const button = document.createElement('button'); button.className = 'route-node';
  const seal = document.createElementNS(NS, 'svg'); seal.classList.add('node-seal'); seal.setAttribute('viewBox', '0 0 200 78'); seal.setAttribute('preserveAspectRatio', 'none'); seal.setAttribute('aria-hidden', 'true');
  const defs = document.createElementNS(NS, 'defs'), clip = document.createElementNS(NS, 'clipPath'), fill = document.createElementNS(NS, 'path');
  clip.id = `seal-fill-${++serial}`; clip.setAttribute('clipPathUnits', 'userSpaceOnUse'); clip.append(fill); defs.append(clip); seal.append(defs);
  const boundary = document.createElementNS(NS, 'clipPath'), borderPath = document.createElementNS(NS, 'path'), heat = document.createElementNS(NS, 'path');
  boundary.id = `seal-border-${serial}`; borderPath.setAttribute('d', border); boundary.append(borderPath); defs.append(boundary);
  heat.classList.add('node-heat'); heat.setAttribute('clip-path', `url(#${boundary.id})`);
  fills.set(button, { path: fill, heat, phase: hash(label) / 0xffffffff * Math.PI * 2, last: NaN });
  for (const [name, d] of [['node-scorch', border], ['node-paper', border], ['node-outline', border], ['node-fiber', 'M16 14 Q60 10 95 12 L177 11 M187 25 L189 54 Q186 64 176 64 L35 66 M13 54 L12 29'], ['node-marks', 'M18 4l-1 13 M5 21l15-1 M181 62l-1 12 M184 59l14-1']] as const) {
    const path = document.createElementNS(NS, 'path'); path.classList.add(name); path.setAttribute('d', d); path.setAttribute('pathLength', '1'); seal.append(path);
    if (name === 'node-paper') path.setAttribute('clip-path', `url(#${clip.id})`);
    if (name === 'node-paper') seal.append(heat);
  }
  const holder = document.createElement('span'); holder.className = 'node-label';
  const text = document.createElement('span'); text.className = 'node-ink';
  const title = document.createElement('span');
  title.className = 'node-title node-compact'; title.textContent = label;
  button.dataset.fullLabel = label; button.dataset.shortLabel = detail.shortLabel ?? label;
  text.append(title);
  if (detail.note) { const note = document.createElement('span'); note.className = 'node-note'; note.textContent = detail.note; text.append(note); }
  button.setAttribute('aria-label', label); if (detail.note) button.setAttribute('aria-description', detail.note);
  button.title = detail.note ? `${label} — ${detail.note}` : label;
  holder.append(text);
  button.append(seal, holder); return button;
}
/** Intersect a cardinal attachment ray with the very same painted SVG seal.
 * Button padding never participates in connector geometry. */
export function sealAnchor(button: HTMLElement, side: 'left' | 'right' | 'top' | 'bottom') {
  const path = button.querySelector<SVGPathElement>('.node-outline')!;
  const key = `${path.getAttribute('d')}:${side}`, cached = anchorGeometry.get(key);
  if (cached) return { x: (cached.x / 200 - .5) * button.offsetWidth, y: (cached.y / 78 - .5) * button.offsetHeight };
  const length = path.getTotalLength(), horizontal = side === 'left' || side === 'right';
  const intersections: { x: number; y: number }[] = [];
  const value = (p: DOMPoint) => horizontal ? p.y - 39 : p.x - 100;
  for (let i = 0; i < 64; i++) {
    let lo = length * i / 64, hi = length * (i + 1) / 64;
    if (value(path.getPointAtLength(lo)) * value(path.getPointAtLength(hi)) > 0) continue;
    const sign = Math.sign(value(path.getPointAtLength(lo)));
    for (let j = 0; j < 12; j++) { const mid = (lo + hi) / 2; if (Math.sign(value(path.getPointAtLength(mid))) === sign) lo = mid; else hi = mid; }
    intersections.push(path.getPointAtLength((lo + hi) / 2));
  }
  intersections.sort((a, b) => horizontal ? a.x - b.x : a.y - b.y);
  const p = (side === 'left' || side === 'top' ? intersections[0] : intersections.at(-1)) ?? { x: 100, y: 39 };
  anchorGeometry.set(key, { x: p.x, y: p.y });
  return { x: (p.x / 200 - .5) * button.offsetWidth, y: (p.y / 78 - .5) * button.offsetHeight };
}
/** Scorch -> drawn seal -> paper/ink -> title. No finished pill is unhidden. */
export function drawGraphNode(button: HTMLElement, progress: number) {
  const p = clamp(progress);
  const fill = fills.get(button);
  if (fill?.last === p) return;
  if (fill) fill.last = p;
  button.style.setProperty('--node-scorch', String(Math.sin(p * Math.PI) * .42));
  const spread = clamp((p - .22) / .53);
  button.style.setProperty('--node-paper', spread > 0 ? '1' : '0');
  if (fill) {
    const radius = spread * 145;
    const d = [57, 143].map((x, j) => Array.from({ length: 48 }, (_, i) => {
      const a = i / 48 * Math.PI * 2, r = radius * (1 + .09 * Math.sin(a * 7 + fill.phase + j) + .04 * Math.cos(a * 17 + fill.phase));
      return `${i ? 'L' : 'M'}${(x + Math.cos(a) * r).toFixed(1)} ${(39 + Math.sin(a) * r * .7).toFixed(1)}`;
    }).join(' ') + 'Z').join(' ');
    fill.path.setAttribute('d', d); fill.heat.setAttribute('d', d);
    fill.heat.style.opacity = String(Math.sin(spread * Math.PI) * .7);
  }
  const outline = clamp((p - .10) / .55);
  button.style.setProperty('--node-outline', String(outline));
  button.querySelectorAll<SVGPathElement>('.node-outline,.node-fiber,.node-marks').forEach(path => {
    path.style.strokeDasharray = '1'; path.style.strokeDashoffset = String(1 - outline);
    path.style.visibility = p > .1 ? 'visible' : 'hidden';
  });
  button.dataset.nodeStage = p === 1 ? 'settled' : p < .1 ? 'scorch' : p < .6 ? 'seal' : 'inscription';
}
