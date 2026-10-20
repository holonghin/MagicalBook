import { clamp } from './timeline';
import { random } from './random';
const NS = 'http://www.w3.org/2000/svg';
let serial = 0;
type Origin = { x: number; y: number; phase: number; speed: number; delay: number; grain: number[][] };
type Particle = { origin: number; angle: number; born: number; life: number; drift: number; size: number; spin: number };

/** Seeded whole-paper combustion. SVG subtraction preserves the real outgoing
 * DOM; canvas only draws transient flame tongues, fibers and drifting ash. */
export class PaperBurnThrough {
  private svg = document.createElementNS(NS, 'svg');
  private rim = document.createElementNS(NS, 'svg');
  private holes = document.createElementNS(NS, 'path');
  private rims: SVGPathElement[] = [];
  private canvas = document.createElement('canvas');
  private ctx: CanvasRenderingContext2D | null;
  private origins: Origin[] = [];
  private particles: Particle[] = [];
  private width: number;
  private height: number;
  private disposed = false;
  readonly count: number;

  constructor(private outgoing: HTMLElement, seed: number, count?: number, charWidth = 10) {
    this.width = Math.max(1, outgoing.offsetWidth); this.height = Math.max(1, outgoing.offsetHeight);
    const rng = random(seed);
    this.count = Math.max(1, Math.min(3, Math.round(count ?? 1 + Math.floor(rng() * 3))));
    for (let i = 0; i < this.count; i++) {
      let x = .5, y = .5;
      for (let tries = 0; tries < 80; tries++) {
        x = .18 + .64 * rng(); y = .18 + .64 * rng();
        if (this.origins.every(o => Math.hypot(x - o.x / this.width, y - o.y / this.height) > .28)) break;
      }
      this.origins.push({ x: x * this.width, y: y * this.height, phase: rng() * Math.PI * 2, speed: .85 + rng() * .30, delay: i === 0 ? 0 : rng() * .10,
        grain: [19, 73, 251, 509].map(n => Array.from({ length: n }, () => rng() * 2 - 1)) });
    }
    for (let i = 0; i < 96; i++) this.particles.push({ origin: i % this.count, angle: rng() * Math.PI * 2, born: Math.max(this.origins[i % this.count].delay + .055, .09 + rng() * .70), life: .12 + rng() * .22, drift: (rng() - .5) * 86, size: .6 + rng() * 2.5, spin: rng() * 6 });
    const id = `paper-burn-${++serial}`;
    this.svg.classList.add('paper-burn-defs'); this.svg.setAttribute('aria-hidden', 'true');
    const defs = document.createElementNS(NS, 'defs'), mask = document.createElementNS(NS, 'mask'), paper = document.createElementNS(NS, 'rect');
    mask.id = id; mask.setAttribute('maskUnits', 'userSpaceOnUse'); mask.setAttribute('maskContentUnits', 'userSpaceOnUse'); mask.style.maskType = 'luminance';
    for (const [key, value] of Object.entries({ x: 0, y: 0, width: this.width, height: this.height })) mask.setAttribute(key, String(value));
    paper.setAttribute('width', String(this.width)); paper.setAttribute('height', String(this.height)); paper.setAttribute('fill', 'white');
    this.holes.setAttribute('fill', 'black'); mask.append(paper, this.holes); defs.append(mask); this.svg.append(defs);
    this.rim.classList.add('paper-burn-rim'); this.rim.setAttribute('aria-hidden', 'true');
    this.rim.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`); this.rim.setAttribute('preserveAspectRatio', 'none');
    this.rim.dataset.origins = String(this.count);
    const stains = document.createElementNS(NS, 'defs');
    for (const [name, deviation] of [['halo', 4], ['scorch', 1.25]] as const) {
      const filter = document.createElementNS(NS, 'filter'), blur = document.createElementNS(NS, 'feGaussianBlur');
      filter.id = `${id}-${name}`; filter.setAttribute('filterUnits', 'userSpaceOnUse');
      filter.setAttribute('x', '0'); filter.setAttribute('y', '0'); filter.setAttribute('width', String(this.width)); filter.setAttribute('height', String(this.height));
      blur.setAttribute('stdDeviation', String(deviation)); filter.append(blur); stains.append(filter);
    }
    this.rim.append(stains);
    // Rim strokes sit on the surviving paper side of the subtraction mask.
    // Thin, translucent heat staining, then broken carbon fibers. No solid black ring.
    const sw = Math.max(.6, Math.min(1.5, charWidth / 10));
    for (const [color, width, dash] of [['#89502230', sw * 24, ''], ['#58331c94', sw * 8, ''], ['#231913ed', sw * 2.1, '.8 1.1 3 .7 1.4 2.3'], ['#bd753aaa', sw * .9, '.5 4 1.2 7']] as const) {
      const path = document.createElementNS(NS, 'path'); path.setAttribute('fill', 'none'); path.setAttribute('stroke', color); path.setAttribute('stroke-width', String(width)); path.setAttribute('stroke-linejoin', 'round'); if (dash) path.setAttribute('stroke-dasharray', dash);
      if (this.rims.length < 2) path.setAttribute('filter', `url(#${id}-${this.rims.length ? 'scorch' : 'halo'})`);
      this.rim.append(path); this.rims.push(path);
    }
    this.rim.style.maskImage = `url(#${id})`;
    this.canvas.className = 'paper-burn-particles'; this.canvas.setAttribute('aria-hidden', 'true');
    const ratio = Math.min(1.5, window.devicePixelRatio || 1);
    this.canvas.width = Math.ceil(this.width * ratio); this.canvas.height = Math.ceil(this.height * ratio);
    this.ctx = this.canvas.getContext('2d'); this.ctx?.scale(ratio, ratio);
    outgoing.parentElement!.append(this.svg, this.rim, this.canvas);
    outgoing.style.maskImage = `url(#${id})`; outgoing.dataset.paperBurn = 'active'; outgoing.dataset.ignitions = String(this.count);
    this.draw(0);
  }
  private radius(origin: Origin, p: number) {
    const t = clamp((p - origin.delay) / (.92 - origin.delay));
    // Leave a perceptible middle interval for fronts to travel and merge, then
    // accelerate the last surviving corners instead of dwelling on islands.
    return Math.hypot(this.width, this.height) * (.58 * Math.pow(t, 2.1) + 1.4 * Math.pow(t, 9)) * origin.speed;
  }
  private grain(values: number[], turn: number) {
    const u = ((turn % 1 + 1) % 1) * values.length, i = Math.floor(u), t = u - i;
    return values[i] * (1 - t) + values[(i + 1) % values.length] * t;
  }
  private point(origin: Origin, angle: number, radius: number) {
    const turn = angle / (Math.PI * 2), [macro, fiber, tear, tooth] = origin.grain;
    // Coarse asymmetry varies local combustion speed; fine fibers stay paper-sized
    // rather than inflating into cloud-shaped scallops as the hole grows.
    const r = Math.max(0, radius * (1 + .13 * this.grain(macro, turn) + .02 * Math.sin(radius / 90 + angle * 3 + origin.phase)) + Math.min(radius * .07, 8) * this.grain(fiber, turn)
      + Math.min(radius * .055, 5.5) * this.grain(tear, turn) + Math.min(radius * .03, 3.2) * this.grain(tooth, turn));
    return { x: origin.x + Math.cos(angle) * r, y: origin.y + Math.sin(angle) * r * (.81 + .06 * Math.sin(angle + origin.phase)) };
  }
  private outline(origin: Origin, radius: number) {
    if (radius <= 0) return '';
    const points: string[] = [];
    for (let i = 0; i < 768; i++) { const point = this.point(origin, i / 768 * Math.PI * 2, radius); points.push(`${i ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`); }
    return points.join(' ') + 'Z';
  }
  draw(progress: number) {
    if (this.disposed) return;
    const p = clamp(progress); this.outgoing.dataset.paperBurnProgress = p.toFixed(3);
    this.outgoing.style.visibility = p >= .98 ? 'hidden' : '';
    const d = this.origins.map(o => this.outline(o, this.radius(o, p))).join(' ');
    this.holes.setAttribute('d', d); this.rims.forEach(path => path.setAttribute('d', d));
    this.rim.style.visibility = p > 0 && p < .98 ? 'visible' : 'hidden';
    const ctx = this.ctx; if (!ctx) return;
    ctx.clearRect(0, 0, this.width, this.height);
    let live = 0;
    // Flame tongues follow the moving boundary, never the full page or a halo.
    if (p > 0 && p < .88) for (const origin of this.origins) {
      const radius = this.radius(origin, p); if (!radius) continue;
      for (let i = 0; i < 95; i++) {
        const angle = i / 95 * Math.PI * 2 + origin.phase;
        const point = this.point(origin, angle, radius);
        if (point.x < 0 || point.y < 0 || point.x > this.width || point.y > this.height) continue;
        // Suppress internal fronts where separate holes have merged.
        if (this.origins.some(other => other !== origin && Math.hypot(point.x - other.x, (point.y - other.y) / .78) < this.radius(other, p) * .80)) continue;
        const heat = this.grain(origin.grain[1], angle / (Math.PI * 2) + p * .17);
        // Dry, branching fibers protrude from the consumed material. Their
        // lengths stay in paper pixels, not a scaling black rubber contour.
        if (i % 3 === 0) {
          const fiber = 2 + Math.abs(heat) * 5, nx = Math.cos(angle), ny = Math.sin(angle);
          ctx.globalAlpha = .6; ctx.strokeStyle = '#4b2e1b'; ctx.lineWidth = .65;
          ctx.beginPath(); ctx.moveTo(point.x, point.y); ctx.lineTo(point.x + nx * fiber, point.y + ny * fiber);
          ctx.lineTo(point.x + nx * fiber + ny * 1.8, point.y + ny * fiber - nx * 1.8); ctx.stroke();
        }
        if (heat < .16) continue; // separate hot patches, never a continuous neon perimeter
        const flicker = .5 + .5 * Math.sin(i * 2.7 + p * 133 + origin.phase);
        const length = 5 + flicker * 23 * heat, breadth = .7 + flicker * 1.3, sway = Math.sin(i + p * 79) * 4;
        ctx.globalAlpha = .4 + heat * .5;
        ctx.fillStyle = i % 3 ? '#c47b35' : '#e5aa55';
        ctx.beginPath(); ctx.moveTo(point.x - breadth, point.y + 1);
        ctx.quadraticCurveTo(point.x + sway - breadth, point.y - length * .5, point.x + sway, point.y - length);
        ctx.quadraticCurveTo(point.x + breadth + sway * .4, point.y - length * .35, point.x + breadth, point.y + 1); ctx.fill();
        ctx.fillStyle = '#ffe7b2'; ctx.fillRect(point.x, point.y - 1, .8, 1.4);
      }
    }
    for (const ash of this.particles) {
      const age = (p - ash.born) / ash.life; if (age < 0 || age > 1) continue;
      const origin = this.origins[ash.origin], point = this.point(origin, ash.angle, this.radius(origin, ash.born));
      const x = point.x + age * ash.drift + Math.sin(age * 11 + ash.spin) * age * 8, y = point.y + age * age * 90 - Math.sin(age * Math.PI) * 12;
      if (x < 0 || y < 0 || x > this.width || y > this.height) continue;
      ctx.save(); ctx.translate(x, y); ctx.rotate(ash.spin + age * 3); ctx.globalAlpha = (1 - age) * .85;
      ctx.fillStyle = age < .12 ? '#c69b60' : ash.spin > 3 ? '#81776a' : '#3c352c';
      ctx.beginPath(); ctx.moveTo(-ash.size, 0); ctx.lineTo(ash.size * .4, -ash.size * .5); ctx.lineTo(ash.size, ash.size * .4); ctx.lineTo(0, ash.size * .3); ctx.closePath(); ctx.fill(); ctx.restore(); live++;
    }
    ctx.globalAlpha = 1; this.canvas.dataset.liveAsh = String(live);
  }
  dispose() {
    if (this.disposed) return; this.disposed = true;
    this.outgoing.style.maskImage = ''; this.outgoing.style.visibility = '';
    delete this.outgoing.dataset.paperBurn; delete this.outgoing.dataset.paperBurnProgress; delete this.outgoing.dataset.ignitions;
    this.svg.remove(); this.rim.remove(); this.canvas.remove();
  }
}
