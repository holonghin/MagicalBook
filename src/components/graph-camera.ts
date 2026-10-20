import { clamp, ease } from '../effects/timeline';
export interface CameraPose { x: number; y: number; scale: number }
export interface GraphPoint { x: number; y: number }
export interface GraphBounds { left: number; top: number; right: number; bottom: number }

/** Graph-local camera. The outer book camera remains independent and shared by
 * the physical page. All graph geometry and labels inherit this one transform. */
export class GraphCamera {
  pose: CameraPose = { x: 0, y: 0, scale: 1 };
  fitPose: CameraPose = { ...this.pose };
  locked = true;
  onChange?: () => void;
  private width = 0;
  private height = 0;
  private worldWidth = 1;
  private worldHeight = 1;
  private fitted = true;
  private bounds?: GraphBounds;
  private pointers = new Map<number, { x: number; y: number; startX: number; startY: number }>();
  private dragged = false;
  private suppressUntil = 0;
  private wheelFrame = 0;
  private wheelTarget?: CameraPose;
  constructor(readonly viewport: HTMLElement, private world: HTMLElement, private root: HTMLElement) {
    viewport.addEventListener('wheel', event => {
      event.preventDefault();
      if (this.locked) return;
      const point = this.local(event.clientX, event.clientY);
      const from = { ...this.pose }, basis = this.wheelTarget ?? from;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? this.height : 1;
      this.wheelTarget = this.zoomPose(basis, Math.exp(-event.deltaY * unit * .0016), point, point);
      const to = this.wheelTarget, start = performance.now();
      cancelAnimationFrame(this.wheelFrame);
      const tick = (now: number) => {
        const p = clamp((now - start) / 140);
        this.interpolate(from, to, p);
        if (p < 1) this.wheelFrame = requestAnimationFrame(tick);
        else { this.wheelTarget = undefined; this.wheelFrame = 0; }
      };
      this.wheelFrame = requestAnimationFrame(tick);
    }, { passive: false });
    viewport.addEventListener('pointerdown', event => {
      if (this.locked || event.pointerType === 'mouse' && event.button !== 0) return;
      this.stopWheel();
      const point = this.local(event.clientX, event.clientY);
      if (!this.pointers.size) this.dragged = false;
      this.pointers.set(event.pointerId, { ...point, startX: point.x, startY: point.y });
      if (this.pointers.size > 1) { this.dragged = true; this.capturePointers(); }
    });
    viewport.addEventListener('pointermove', event => {
      const pointer = this.pointers.get(event.pointerId);
      if (!pointer || this.locked) return;
      const old = [...this.pointers.values()].slice(0, 2).map(p => ({ ...p }));
      const previous = { ...pointer }, point = this.local(event.clientX, event.clientY);
      pointer.x = point.x; pointer.y = point.y;
      if (this.pointers.size > 1) {
        const current = [...this.pointers.values()].slice(0, 2);
        const center = (ps: GraphPoint[]) => ({ x: (ps[0].x + ps[1].x) / 2, y: (ps[0].y + ps[1].y) / 2 });
        const distance = (ps: GraphPoint[]) => Math.max(1, Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y));
        this.set(this.zoomPose(this.pose, distance(current) / distance(old), center(old), center(current)));
        this.dragged = true;
      } else if (this.dragged || Math.hypot(point.x - pointer.startX, point.y - pointer.startY) > 6) {
        this.dragged = true;
        this.set({ ...this.pose, x: this.pose.x + point.x - previous.x, y: this.pose.y + point.y - previous.y });
      }
      if (this.dragged) { event.preventDefault(); this.capturePointers(); this.root.dataset.dragging = 'true'; }
    });
    const end = (event: PointerEvent) => {
      if (!this.pointers.has(event.pointerId)) return;
      if (this.dragged) this.suppressUntil = performance.now() + 400;
      this.pointers.delete(event.pointerId);
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
      if (!this.pointers.size) { this.dragged = false; this.root.dataset.dragging = 'false'; }
    };
    viewport.addEventListener('pointerup', end); viewport.addEventListener('pointercancel', end);
    viewport.addEventListener('lostpointercapture', event => {
      // Touch starts with implicit capture on the touched node. Its loss
      // bubbles when we transfer capture to the viewport; keep that gesture.
      if (event.target === viewport && !viewport.hasPointerCapture(event.pointerId)) {
        this.pointers.delete(event.pointerId);
        if (!this.pointers.size) this.root.dataset.dragging = 'false';
      }
    });
    viewport.addEventListener('click', event => {
      if (this.locked || event.detail > 0 && performance.now() < this.suppressUntil) {
        event.preventDefault(); event.stopImmediatePropagation();
      }
    }, true);
  }
  private local(x: number, y: number): GraphPoint {
    const rect = this.viewport.getBoundingClientRect();
    return { x: (x - rect.left) * this.viewport.clientWidth / rect.width, y: (y - rect.top) * this.viewport.clientHeight / rect.height };
  }
  private capturePointers() { for (const id of this.pointers.keys()) { try { this.viewport.setPointerCapture(id); } catch { /* pointer may have ended */ } } }
  private stopWheel() { cancelAnimationFrame(this.wheelFrame); this.wheelFrame = 0; this.wheelTarget = undefined; }
  cancelInput() {
    this.stopWheel();
    if (this.pointers.size) this.suppressUntil = performance.now() + 400;
    for (const id of this.pointers.keys()) if (this.viewport.hasPointerCapture(id)) this.viewport.releasePointerCapture(id);
    this.pointers.clear(); this.dragged = false; this.root.dataset.dragging = 'false';
  }
  private zoomPose(pose: CameraPose, factor: number, anchor: GraphPoint, destination: GraphPoint): CameraPose {
    const scale = Math.max(Math.max(.12, this.fitPose.scale * .65), Math.min(3.5, pose.scale * factor));
    const ratio = scale / pose.scale;
    return { scale, x: destination.x - (anchor.x - pose.x) * ratio, y: destination.y - (anchor.y - pose.y) * ratio };
  }
  resize(worldWidth: number, worldHeight: number) {
    const width = this.viewport.clientWidth, height = this.viewport.clientHeight;
    if (!width || !height) return;
    if (width === this.width && height === this.height && worldWidth === this.worldWidth && worldHeight === this.worldHeight) return;
    this.cancelInput();
    const center = { x: (this.width / 2 - this.pose.x) / this.pose.scale / this.worldWidth, y: (this.height / 2 - this.pose.y) / this.pose.scale / this.worldHeight };
    const first = !this.width;
    this.width = width; this.height = height; this.worldWidth = worldWidth; this.worldHeight = worldHeight;
    this.fitPose = this.frameBounds(this.bounds ?? { left: 0, top: 0, right: worldWidth, bottom: worldHeight });
    if (first || this.fitted) this.fit();
    else this.set({ scale: this.pose.scale, x: width / 2 - center.x * worldWidth * this.pose.scale, y: height / 2 - center.y * worldHeight * this.pose.scale });
  }
  set(pose: CameraPose, fitted = false) {
    this.pose = { ...pose }; this.fitted = fitted;
    this.world.style.transform = `translate(${pose.x}px, ${pose.y}px) scale(${pose.scale})`;
    this.root.dataset.cameraX = pose.x.toFixed(2); this.root.dataset.cameraY = pose.y.toFixed(2); this.root.dataset.zoom = pose.scale.toFixed(4);
    this.onChange?.();
  }
  fit() { this.cancelInput(); this.set(this.fitPose, true); }
  setBounds(bounds: GraphBounds, scope: 'visible' | 'full') {
    this.bounds = bounds;
    this.fitPose = this.frameBounds(bounds);
    this.root.dataset.fitScope = scope;
    this.root.dataset.fitBounds = JSON.stringify(bounds);
    if (this.fitted && !this.locked) this.fit();
  }
  frameBounds(bounds: GraphBounds, maxScale = 1.85): CameraPose {
    const { left, right, top, bottom } = bounds;
    const scale = Math.min(maxScale, this.width * .89 / Math.max(1, right - left + 64), this.height * .88 / Math.max(1, bottom - top + 64));
    return { scale, x: this.width / 2 - (left + right) / 2 * scale, y: this.height / 2 - (top + bottom) / 2 * scale };
  }
  frame(points: GraphPoint[], maxScale = 1.85): CameraPose {
    if (!points.length) return this.fitPose;
    const left = Math.min(...points.map(p => p.x)) - 100, right = Math.max(...points.map(p => p.x)) + 100;
    const top = Math.min(...points.map(p => p.y)) - 44, bottom = Math.max(...points.map(p => p.y)) + 44;
    return this.frameBounds({ left, right, top, bottom }, maxScale);
  }
  interpolate(from: CameraPose, to: CameraPose, progress: number) {
    const p = ease(clamp(progress));
    this.set({ x: from.x + (to.x - from.x) * p, y: from.y + (to.y - from.y) * p, scale: from.scale + (to.scale - from.scale) * p });
  }
  zoom(factor: number) {
    if (this.locked) return;
    this.stopWheel();
    const center = { x: this.width / 2, y: this.height / 2 };
    this.set(this.zoomPose(this.pose, factor, center, center));
  }
  lock(locked: boolean) {
    if (locked) this.cancelInput();
    this.locked = locked; this.root.dataset.cameraLocked = String(locked);
    this.viewport.setAttribute('aria-busy', String(locked));
    this.root.querySelectorAll<HTMLButtonElement>('.graph-tools button').forEach(button => button.disabled = locked);
  }
}
