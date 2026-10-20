import { clamp } from './timeline';
import { random } from './random';

const NS = 'http://www.w3.org/2000/svg';
let serial = 0;
interface Origin { x: number; y: number; phase: number; speed: number; contour?: { x: number; y: number }[] }

/** Spatial masks reveal the real, selectable DOM. The gold copy exists only at
 * advancing fronts, so settled glyphs and SVG strokes retain their exact ink. */
export class MagicalReveal {
  private svg = document.createElementNS(NS, 'svg');
  private inkPath = document.createElementNS(NS, 'path');
  private edgePath = document.createElementNS(NS, 'path');
  private glow: HTMLElement;
  private origins: Origin[] = [];
  private width: number;
  private height: number;
  private radii: number[] = [];
  private disposed = false;
  private clip = '';
  private erasePath = document.createElementNS(NS, 'path');
  private mask = '';
  private lastProgress = -1;

  constructor(private target: HTMLElement, seed: number, private mode: 'in' | 'out' = 'in', regions?: 1 | 2 | 3) {
    const rect = target.getBoundingClientRect();
    this.width = target.offsetWidth;
    this.height = target.offsetHeight;
    const scale = rect.width / this.width || 1;
    const rng = random(seed);
    const rows = new Map<number, { left: number; right: number; y: number; height: number }>();
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      if (!walker.currentNode.textContent?.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(walker.currentNode);
      for (const line of range.getClientRects()) {
        const y = (line.top - rect.top) / scale;
        const key = Math.round(y / 6);
        const left = (line.left - rect.left) / scale;
        const right = (line.right - rect.left) / scale;
        const row = rows.get(key);
        rows.set(key, { left: Math.min(row?.left ?? left, left), right: Math.max(row?.right ?? right, right), y: y + line.height / scale / 2, height: line.height / scale });
      }
    }
    // Geometry gets origins over the whole illustration, too.
    if (!rows.size || target.querySelector('svg,img')) {
      for (let y = this.height * .2; y < this.height; y += Math.max(28, this.height * .3))
        rows.set(-y, { left: 0, right: this.width, y, height: this.height * .3 });
    }
    for (const row of rows.values()) {
      const count = regions ?? 2 + Math.floor(rng() * 3);
      for (let i = 0; i < count; i++) {
        const fraction = (i + .08 + rng() * .84) / count;
        this.origins.push({ x: row.left + (row.right - row.left) * fraction, y: row.y + (rng() - .5) * row.height * .65, phase: rng() * Math.PI * 2, speed: .7 + rng() * .6 });
      }
    }
    // Sample the laid-out content regions to map progress to approximate visible
    // area. Parchment landing can therefore target 85% rather than 85% radius.
    for (const row of rows.values()) {
      for (let y = row.y - row.height / 2; y <= row.y + row.height / 2; y += Math.max(3, row.height / 5)) {
        for (let x = row.left; x <= row.right; x += Math.max(4, (row.right - row.left) / 50)) {
          this.radii.push(Math.min(...this.origins.map(o => {
            const dx = x - o.x, dy = (y - o.y) * 1.6;
            const angle = Math.atan2(dy, dx);
            return Math.hypot(dx, dy) / (o.speed * this.ripple(angle, o.phase));
          })));
        }
      }
    }
    this.radii.sort((a, b) => a - b);
    // Seeded front geometry is immutable for a playback. Do its trigonometry
    // once, rather than for three concentric contours on every animation frame.
    this.origins.forEach(origin => this.contour(origin));
    const id = `ink-${++serial}`;
    this.svg.classList.add('effect-defs');
    this.svg.setAttribute('aria-hidden', 'true');
    const defs = document.createElementNS(NS, 'defs');
    for (const [suffix, path] of [['body', this.inkPath], ['edge', this.edgePath]] as const) {
      const clip = document.createElementNS(NS, 'clipPath');
      clip.id = `${id}-${suffix}`;
      clip.setAttribute('clipPathUnits', 'userSpaceOnUse');
      path.setAttribute('clip-rule', suffix === 'edge' ? 'evenodd' : 'nonzero');
      clip.append(path);
      defs.append(clip);
    }
    this.svg.append(defs);
    const mask = document.createElementNS(NS, 'mask');
    mask.id = `${id}-erase`;
    mask.setAttribute('maskUnits', 'userSpaceOnUse');
    mask.setAttribute('x', '0'); mask.setAttribute('y', '0');
    mask.setAttribute('width', String(this.width)); mask.setAttribute('height', String(this.height));
    mask.style.maskType = 'luminance';
    const background = document.createElementNS(NS, 'rect');
    background.setAttribute('width', String(this.width)); background.setAttribute('height', String(this.height));
    background.setAttribute('fill', 'white'); this.erasePath.setAttribute('fill', 'black');
    mask.append(background, this.erasePath); defs.append(mask);
    this.mask = `url(#${id}-erase)`;
    target.parentElement!.append(this.svg);
    this.glow = target.cloneNode(true) as HTMLElement;
    this.glow.removeAttribute('id');
    this.glow.querySelectorAll('[id]').forEach(e => e.removeAttribute('id'));
    this.glow.classList.add('ink-front');
    this.glow.setAttribute('aria-hidden', 'true');
    this.glow.inert = true;
    target.parentElement!.append(this.glow);
    this.clip = `url(#${id}-body)`;
    if (mode === 'in') target.style.clipPath = this.clip;
    else target.style.maskImage = this.mask;
    this.glow.style.clipPath = `url(#${id}-edge)`;
    this.draw(0);
  }
  private ripple(angle: number, phase: number) {
    return 1 + .09 * Math.sin(angle * 5 + phase) + .06 * Math.cos(angle * 9 - phase)
      + .025 * Math.sin(angle * 17 + phase * 2) + .012 * Math.cos(angle * 43 + phase) + .006 * Math.sin(angle * 89 - phase);
  }
  private contour(origin: Origin) {
    return origin.contour ??= Array.from({ length: 160 }, (_, i) => {
      const a = i / 160 * Math.PI * 2;
      const r = origin.speed * this.ripple(a, origin.phase);
      return { x: Math.cos(a) * r, y: Math.sin(a) * r / 1.6 };
    });
  }
  private shape(origin: Origin, radius: number) {
    return this.contour(origin).map((point, i) => `${i ? 'L' : 'M'}${(origin.x + point.x * radius).toFixed(1)},${(origin.y + point.y * radius).toFixed(1)}`).join(' ') + 'Z';
  }
  draw(progress: number) {
    if (this.disposed) return;
    const p = clamp(progress);
    if (p === this.lastProgress) return;
    this.lastProgress = p;
    this.target.dataset.revealProgress = (this.mode === 'in' ? p : 1 - p).toFixed(3);
    this.target.dataset.inkDirection = this.mode;
    this.target.style.opacity = '';
    if (p >= 1) {
      this.target.style.clipPath = '';
      this.target.style.maskImage = '';
      if (this.mode === 'out') this.target.style.opacity = '0';
      this.glow.style.visibility = 'hidden';
      return;
    }
    this.glow.style.visibility = p > 0 ? 'visible' : 'hidden';
    if (this.mode === 'in') this.target.style.clipPath = this.clip;
    else this.target.style.maskImage = this.mask;
    if (p === 0) {
      this.inkPath.setAttribute('d', ''); this.erasePath.setAttribute('d', ''); this.edgePath.setAttribute('d', '');
      return;
    }
    const radius = p === 0 ? 0 : this.radii[Math.min(this.radii.length - 1, Math.floor(p * this.radii.length))] || 0;
    this.inkPath.setAttribute('d', this.origins.map(o => this.shape(o, radius)).join(' '));
    this.erasePath.setAttribute('d', this.inkPath.getAttribute('d')!);
    this.edgePath.setAttribute('d', this.origins.map(o => this.shape(o, radius + 1.8) + this.shape(o, Math.max(0, radius - 2.8))).join(' '));
    this.glow.style.opacity = String(Math.min(1, (1 - p) * 8));
  }
  /** Dense full-map timeout only: resolve remaining ink together. The graph's
   * organic seal and route fronts continue, without dozens of costly glow masks. */
  drawHandoff(progress: number) {
    if (this.disposed) return;
    const p = clamp(progress);
    this.lastProgress = -1;
    this.target.style.clipPath = ''; this.target.style.maskImage = '';
    this.target.style.opacity = String(p);
    this.target.dataset.revealProgress = p.toFixed(3);
    this.glow.style.visibility = 'hidden';
  }
  dispose() {
    this.disposed = true;
    this.target.style.clipPath = '';
    this.target.style.maskImage = '';
    this.target.style.opacity = '';
    this.glow.remove();
    this.svg.remove();
  }
}
