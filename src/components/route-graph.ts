import type { BlockRenderer, RouteGraph } from '../engine/types';
import { bookDiagram } from './book-diagram';
import { graphRanks, layoutGraph } from './graph-layout';
import { clamp } from '../effects/timeline';
import { MagicalReveal } from '../effects/magical-reveal';
import { hash } from '../effects/random';
import { GraphCamera, type CameraPose, type GraphBounds } from './graph-camera';
import { graphNode, drawGraphNode, sealAnchor } from './graph-node';
import { GraphDetail } from './graph-detail';
import { GraphState, type GraphOrientation } from '../engine/graph-state';
import { ease } from '../effects/timeline';
import { samplePaths, reflowPaths } from './graph-reflow';
import { fullGraphRevealDuration, FULL_GRAPH_HANDOFF_MS, MAX_FULL_GRAPH_REVEAL_MS } from '../effects/graph-reveal-timing';

const NS = 'http://www.w3.org/2000/svg';
const controllers = new WeakMap<HTMLElement, GraphView>();
export const getGraphView = (root: HTMLElement) => controllers.get(root.matches('.route-diagram') ? root : root.querySelector<HTMLElement>('.route-diagram')!);
type EdgeView = { path: SVGPathElement; heat: SVGPathElement; scorch: SVGPathElement; flame: SVGPathElement; ash: SVGCircleElement[]; ember: SVGCircleElement; length: number; duration: number };

export class GraphView {
  readonly element = bookDiagram('Presentation route');
  private world = document.createElement('div');
  private scroll = document.createElement('div');
  private sizer = document.createElement('div');
  private svg = document.createElementNS(NS, 'svg');
  private nodes = new Map<string, HTMLButtonElement>();
  private edges = new Map<string, EdgeView>();
  private ink = new Map<string, MagicalReveal>();
  private previous = -1;
  private target = -1;
  private orientation: GraphOrientation;
  get axis() { return this.orientation; }
  get visibleStep() { return this.target; }
  private active = false;
  readonly camera: GraphCamera;
  private detail: GraphDetail;
  private focusFrom: CameraPose = { x: 0, y: 0, scale: 1 };
  private focusTo: CameraPose = { ...this.focusFrom };
  private focusSource: CameraPose = { ...this.focusFrom };
  private base = -1;
  private extent = -1;
  private reverse = false;
  private reverseTraceWindow = 0;
  private points = new Map<string, { x: number; y: number }>();
  private whole = false;
  private readonly focusTime = 430;
  private focusDelay = this.focusTime;
  private travelTime = 720;
  private readonly nodeTime = 600;
  private dimensions = { width: 1000, height: 400 };
  private fullBounds?: GraphBounds;
  private arrivals = new Map<string, number>();
  private starts = new Map<string, number>();
  private eventLength = 1250;
  private get naturalDuration() { return this.eventLength + (this.reflow && this.followingGrowth ? 850 : 0); }
  get duration() { return this.whole ? fullGraphRevealDuration(this.naturalDuration) : this.naturalDuration; }
  playbackDuration(tempo: number) { return this.whole ? fullGraphRevealDuration(this.duration, tempo) : this.duration / tempo; }
  get fullOverview() { return this.whole; }
  private activationBases = new Map<number, number>();
  private teachingPath?: EdgeView;
  private teachingContext?: CameraPose;
  private teachingPoses = new Map<number, CameraPose>();
  private viewportSize = { width: 0, height: 0 };
  private followingGrowth = false;
  private reflowDestination = false;
  private reflow?: { from: Map<string, { x: number; y: number }>; to: Map<string, { x: number; y: number }>; paintPaths: ReturnType<typeof reflowPaths>; cameraFrom: CameraPose; cameraTo: CameraPose };
  private observer: ResizeObserver;

  constructor(private graph: RouteGraph, private state: GraphState, visit: (id: string) => void) {
    this.orientation = state.policy.initial;
    this.element.classList.add('route-diagram'); this.element.dataset.axis = this.axis; this.element.dataset.graphId = state.id;
    this.scroll.className = 'graph-scroll'; this.sizer.className = 'graph-sizer'; this.world.className = 'graph-world';
    this.svg.setAttribute('aria-hidden', 'true');
    for (const edge of graph.edges) {
      const path = document.createElementNS(NS, 'path'), heat = document.createElementNS(NS, 'path'), ember = document.createElementNS(NS, 'circle');
      const scorch = document.createElementNS(NS, 'path'), flame = document.createElementNS(NS, 'path');
      scorch.classList.add('route-scorch'); flame.classList.add('route-flame');
      const ash = Array.from({ length: 3 }, (_, i) => { const dot = document.createElementNS(NS, 'circle'); dot.classList.add('route-cinder'); dot.setAttribute('r', String(.7 + i * .2)); return dot; });
      path.classList.add('route-edge'); path.dataset.edge = edge.id;
      heat.classList.add('route-heat'); ember.classList.add('route-ember'); ember.setAttribute('r', '4');
      this.svg.append(scorch, path, heat, flame, ...ash, ember);
      this.edges.set(edge.id, { path, heat, scorch, flame, ash, ember, length: 1, duration: 800 });
    }
    this.world.append(this.svg);
    for (const node of graph.nodes) {
      const button = graphNode(node.label, node); button.dataset.node = node.id;
      button.dataset.hasContent = String(node.slideIds.length > 0);
      button.style.visibility = 'hidden';
      button.addEventListener('click', () => visit(node.id)); this.nodes.set(node.id, button); this.world.append(button);
    }
    this.sizer.append(this.world); this.scroll.append(this.sizer); this.element.append(this.scroll);
    this.camera = new GraphCamera(this.scroll, this.world, this.element);
    this.detail = new GraphDetail(this.element, this.nodes, graph, this.camera, state);
    this.camera.onChange = () => this.detail.render();
    const tools = document.createElement('div'); tools.className = 'graph-tools';
    for (const [label, text, act] of [
      ['Zoom graph out', '−', () => this.camera.zoom(1 / 1.2)],
      ['Fit graph', 'fit', () => { if (!this.camera.locked) this.camera.fit(); }],
      ['Zoom graph in', '+', () => this.camera.zoom(1.2)],
    ] as const) { const b = document.createElement('button'); b.textContent = text; b.setAttribute('aria-label', label); b.addEventListener('click', act); tools.append(b); }
    this.element.append(tools);
    controllers.set(this.element, this);
    this.observer = new ResizeObserver(() => { if (!this.active && this.element.isConnected) this.layout(); });
    this.observer.observe(this.element);
  }
  layout() {
    if (!this.element.isConnected || !this.element.clientWidth) return;
    // Reserve full-label seal geometry once. Semantic text tiers must never
    // shrink the body or move its attachment points when their wording changes.
    this.nodes.forEach(node => {
      if (node.style.width) return;
      const title = node.querySelector<HTMLElement>('.node-title')!, displayed = title.textContent;
      // A guided map can first mount while its label tier is abbreviated.
      // Freeze the full manuscript box, otherwise a later local camera reveals
      // a three-line title spilling below a one-line seal.
      if (this.state.guided) title.textContent = node.dataset.fullLabel!;
      node.style.width = `${node.offsetWidth}px`;
      const style = getComputedStyle(node), ink = node.querySelector<HTMLElement>('.node-ink')!;
      node.style.height = `${this.state.guided ? Math.max(node.offsetHeight, ink.scrollHeight + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + 12) : node.offsetHeight}px`;
      title.textContent = displayed;
    });
    const areaWidth = this.element.clientWidth, areaHeight = Math.max(200, this.element.clientHeight - 30);
    const result = layoutGraph(this.graph, this.axis, areaWidth, areaHeight, {
      width: Math.max(165, ...[...this.nodes.values()].map(n => n.offsetWidth)),
      height: Math.max(72, ...[...this.nodes.values()].map(n => n.offsetHeight)),
    });
    if (this.viewportSize.width && (areaWidth !== this.viewportSize.width || areaHeight !== this.viewportSize.height || result.width !== this.dimensions.width || result.height !== this.dimensions.height))
      this.teachingPoses.clear(); // Old pixel poses cannot describe a resized world.
    this.viewportSize = { width: areaWidth, height: areaHeight };
    this.points = result.points;
    this.dimensions = result; this.world.style.width = `${result.width}px`; this.world.style.height = `${result.height}px`;
    this.svg.setAttribute('viewBox', `0 0 ${result.width} ${result.height}`);
    this.paintGeometry(result.points);
    this.camera.resize(result.width, result.height);
    if (!this.active) { this.draw(1); }
  }
  /** Every frame uses the same node centers and interpolated outline anchors;
   * the ember, visible ink and heat trail share this exact path. */
  private paintGeometry(points: Map<string, { x: number; y: number }>) {
    this.fullBounds = undefined;
    this.points = points;
    for (const [id, point] of points) { const node = this.nodes.get(id)!; node.style.left = `${point.x}px`; node.style.top = `${point.y}px`; }
    const ranks = graphRanks(this.graph);
    for (const edge of this.graph.edges) {
      const from = points.get(edge.from)!, to = points.get(edge.to)!;
      const a = this.nodes.get(edge.from)!, b = this.nodes.get(edge.to)!;
      const horizontal = Math.abs(to.x - from.x) > 1 && this.axis === 'horizontal';
      const forward = horizontal ? to.x >= from.x : to.y >= from.y;
      const start = sealAnchor(a, horizontal ? forward ? 'right' : 'left' : forward ? 'bottom' : 'top');
      const end = sealAnchor(b, horizontal ? forward ? 'left' : 'right' : forward ? 'top' : 'bottom');
      const x1 = from.x + start.x, y1 = from.y + start.y, x2 = to.x + end.x, y2 = to.y + end.y;
      let d = horizontal ? `M${x1} ${y1} C${(x1 + x2) / 2} ${y1} ${(x1 + x2) / 2} ${y2} ${x2} ${y2}` : `M${x1} ${y1} C${x1} ${(y1 + y2) / 2} ${x2} ${(y1 + y2) / 2} ${x2} ${y2}`;
      // Long cross-links travel through an outside gutter rather than passing
      // through intervening labels. Adjacent ranks keep the shorter curves.
      if (this.axis === 'horizontal' && Math.abs(ranks.get(edge.from)! - ranks.get(edge.to)!) > 1) {
        const gutter = this.dimensions.height - 9;
        const source = sealAnchor(a, 'bottom'), target = sealAnchor(b, 'bottom');
        d = `M${from.x + source.x} ${from.y + source.y} L${from.x + source.x} ${gutter - 18} Q${from.x + source.x} ${gutter} ${from.x + 18} ${gutter} L${to.x - 18} ${gutter} Q${to.x + target.x} ${gutter} ${to.x + target.x} ${gutter - 18} L${to.x + target.x} ${to.y + target.y}`;
      } else if (this.axis === 'vertical' && Math.abs(ranks.get(edge.from)! - ranks.get(edge.to)!) > 1) {
        const gutter = this.dimensions.width - 9;
        const source = sealAnchor(a, 'right'), target = sealAnchor(b, 'right');
        d = `M${from.x + source.x} ${from.y + source.y} L${gutter - 18} ${from.y + source.y} Q${gutter} ${from.y + source.y} ${gutter} ${from.y + 18} L${gutter} ${to.y - 18} Q${gutter} ${to.y + target.y} ${gutter - 18} ${to.y + target.y} L${to.x + target.x} ${to.y + target.y}`;
      }
      const view = this.edges.get(edge.id)!; view.path.setAttribute('d', d); view.heat.setAttribute('d', d); view.scorch.setAttribute('d', d);
      view.length = view.path.getTotalLength() || 1;
      view.duration = 620 + Math.min(240, view.length * .35);
    }
  }
  orient(axis: GraphOrientation) {
    if (axis === this.axis) return;
    this.finish(); this.orientation = axis;
    this.element.dataset.axis = axis; this.layout();
  }
  /** A layout operation never changes logical progression or selected node. */
  prepareReflow(axis: GraphOrientation) {
    this.finish();
    const from = new Map(this.points), fromPaths = samplePaths(this.edges), cameraFrom = { ...this.camera.pose };
    this.active = true; this.camera.lock(true);
    this.reflowDestination = false;
    this.orientation = axis; this.element.dataset.axis = axis;
    this.layout();
    this.reflow = { from, to: new Map(this.points), paintPaths: reflowPaths(this.edges, this.nodes, this.graph.edges, from, this.points, fromPaths), cameraFrom, cameraTo: this.camera.frameBounds(this.graphBounds(false)) };
    this.eventLength = 850;
    this.draw(0);
  }
  /** Establish dormant/settled source visibility BEFORE a cached view mounts.
   * No completed preview is used as the source of ordinary playback. */
  stage(step: number, axis: GraphOrientation) {
    this.active = false; this.reflow = undefined; this.followingGrowth = false;
    this.ink.forEach(ink => ink.dispose()); this.ink.clear();
    this.orientation = axis; this.element.dataset.axis = axis;
    this.previous = this.target = this.base = this.extent = step;
    this.reverse = this.whole = false; this.focusDelay = 0;
    for (const node of this.graph.nodes) {
      const button = this.nodes.get(node.id)!, visible = node.unlockStep <= step;
      button.style.visibility = visible ? 'visible' : 'hidden'; button.inert = true;
      button.dataset.inkProgress = visible ? '1.000' : '0.000';
      button.setAttribute('aria-hidden', String(!visible)); drawGraphNode(button, visible ? 1 : 0);
    }
    this.edges.forEach((view, id) => {
      const visible = this.graph.edges.find(e => e.id === id)!.unlockStep <= step;
      view.path.style.visibility = visible ? 'visible' : 'hidden'; view.path.dataset.progress = visible ? '1.000' : '0.000';
      view.heat.style.visibility = view.scorch.style.visibility = view.ember.style.visibility = view.flame.style.visibility = 'hidden';
      view.ash.forEach(dot => dot.style.visibility = 'hidden');
    });
    this.element.dataset.step = String(step); this.camera.lock(true);
    this.layout();
  }
  transition(step: number, axis: GraphOrientation, seed: number, replay = false, whole = false, extend = false, entrance = false) {
    // A completed teaching page is an overview only when re-entered. The last
    // node-by-node teaching step still keeps its full source/path/node timing.
    whole ||= entrance && this.graph.nodes.every(n => n.unlockStep <= step) && this.graph.edges.every(e => e.unlockStep <= step);
    if (!this.points.size || this.target < 0) { this.orient(axis); this.prepare(step, seed, replay, whole, extend); return; }
    if (axis === this.axis) { this.prepare(step, seed, replay, whole, extend); return; }
    this.prepareReflow(axis);
    if (step === this.target && !whole) return;
    const reflow = this.reflow!;
    this.finish(); this.prepare(step, seed, replay, whole, extend);
    this.reflow = reflow; this.followingGrowth = true; this.draw(0);
  }
  prepare(step: number, seed: number, replay = false, whole = false, extend = false) {
    this.finish();
    this.previous = whole && !extend ? -1 : replay ? this.activationBases.get(step) ?? -1 : this.target;
    if (!replay && !this.state.miniMapPreview) this.activationBases.set(step, this.previous);
    this.target = step;
    this.reverse = this.target < this.previous;
    this.base = Math.min(this.previous, this.target); this.extent = Math.max(this.previous, this.target);
    this.whole = whole;
    this.focusDelay = this.focusTime;
    this.layout();
    this.plan();
    this.active = true;
    this.camera.lock(true);
    this.focusFrom = { ...this.camera.pose };
    if (this.state.guided && !whole && this.previous !== step) this.teachingPoses.set(this.previous, this.focusFrom);
    const newEdges = this.graph.edges.filter(e => e.unlockStep > this.base && e.unlockStep <= this.extent);
    this.reverseTraceWindow = Math.max(0, ...newEdges.map(e => this.edges.get(e.id)!.duration));
    // Cross-links enrich the map, but distant semantic endpoints must not
    // force the next teaching seal into a global fit.
    const focusEdges = this.state.guided && !whole ? newEdges.filter(e => e.layoutConstraint !== false) : newEdges;
    const focusIds = new Set(focusEdges.flatMap(e => [e.from, e.to]));
    if (!focusIds.size) this.graph.nodes.filter(n => n.unlockStep <= this.extent).forEach(n => focusIds.add(n.id));
    const sources = new Set(focusEdges.filter(e => this.graph.nodes.find(n => n.id === e.from)!.unlockStep <= this.base).map(e => e.from));
    if (!sources.size) focusIds.forEach(id => sources.add(id));
    this.focusSource = this.camera.frameBounds(this.selectionBounds(sources));
    this.focusTo = whole ? this.camera.frameBounds(this.graphBounds(true)) : this.camera.frameBounds(this.selectionBounds(focusIds, newEdges.map(e => e.id)), 1.6);
    this.teachingPath = undefined; this.teachingContext = undefined;
    if (this.state.guided && !whole) {
      if (focusEdges.length === 1) {
        const edge = focusEdges[0]; this.teachingPath = this.edges.get(edge.id);
        this.teachingContext = this.camera.frameBounds(this.selectionBounds(focusIds, [edge.id]), 1.25);
        this.focusTo = this.camera.frameBounds(this.selectionBounds(new Set([edge.to])), 1.25);
      } else if (focusEdges.length) this.focusTo = this.camera.frameBounds(this.selectionBounds(focusIds, focusEdges.map(e => e.id)), 1.4);
      else if (step === this.previous && step >= 0) this.focusSource = this.focusTo = this.focusFrom;
      if (this.reverse) this.focusSource = this.teachingPoses.get(step) ?? this.focusSource;
    }
    const arrivals = this.graph.nodes.filter(n => n.unlockStep > this.base && n.unlockStep <= this.extent).map(n => this.arrivals.get(n.id) ?? 0).filter(t => t > 0);
    this.travelTime = Math.min(720, ...arrivals);
    this.detail.focus(whole ? new Set(this.graph.nodes.filter(n => n.role === 'branch' || !this.graph.edges.some(e => e.to === n.id) || this.graph.edges.filter(e => e.from === n.id).length > 1).map(n => n.id)) : focusIds);
    this.nodes.forEach((button, id) => button.classList.toggle('source-focus', sources.has(id)));
    this.element.dataset.step = String(step);
    for (const node of this.graph.nodes.filter(n => n.unlockStep > this.base && n.unlockStep <= this.extent)) {
      this.ink.set(node.id, new MagicalReveal(this.nodes.get(node.id)!.querySelector<HTMLElement>('.node-ink')!, hash(node.id, seed)));
    }
    this.draw(0);
  }
  private plan() {
    const eligible = this.graph.nodes.filter(n => n.unlockStep <= this.extent);
    const edges = this.graph.edges.filter(e => e.unlockStep <= this.extent);
    const pending = new Set(eligible.map(n => n.id));
    this.arrivals = new Map(eligible.map(n => [n.id, n.unlockStep <= this.base || !edges.some(e => e.to === n.id) ? 0 : Infinity]));
    // Dijkstra-style earliest arrivals. A disconnected cyclic component gets
    // one stable seed root, then grows forward rather than remaining hidden.
    while (pending.size) {
      const id = [...pending].sort((a, b) => this.arrivals.get(a)! - this.arrivals.get(b)!)[0];
      if (!Number.isFinite(this.arrivals.get(id))) this.arrivals.set(id, 0);
      pending.delete(id);
      for (const edge of edges.filter(e => e.from === id && pending.has(e.to)))
        this.arrivals.set(edge.to, Math.min(this.arrivals.get(edge.to)!, this.arrivals.get(id)! + this.edges.get(edge.id)!.duration + (this.graph.nodes.find(n => n.id === id)!.unlockStep > this.base ? this.nodeTime * .7 : 0)));
    }
    this.starts = new Map(edges.map(e => [e.id, (this.arrivals.get(e.from) ?? 0) + (this.graph.nodes.find(n => n.id === e.from)!.unlockStep > this.base ? this.nodeTime * .7 : 0)]));
    this.eventLength = this.focusDelay + Math.max(this.nodeTime, ...edges.map(e => e.unlockStep <= this.base ? 0 : (this.starts.get(e.id) ?? 0) + this.edges.get(e.id)!.duration + this.nodeTime));
  }
  draw(progress: number) {
    // Keep the regular burn clock for the first portion. Only maps whose real
    // path/node schedule exceeds the budget coalesce remaining marks into one
    // short burn/ink handoff. One clock drives all routes, seals and particles.
    const capped = this.whole && this.naturalDuration > MAX_FULL_GRAPH_REVEAL_MS;
    const elapsed = clamp(progress) * this.duration;
    const handoff = capped ? clamp((elapsed - (this.duration - FULL_GRAPH_HANDOFF_MS)) / FULL_GRAPH_HANDOFF_MS) : 0;
    this.element.dataset.revealMode = capped ? 'bounded-burn' : 'regular-burn';
    this.element.dataset.handoffProgress = handoff.toFixed(3);
    this.element.dataset.revealDuration = String(this.duration);
    const originalProgress = progress;
    if (capped) progress = elapsed / this.naturalDuration;
    if (this.reflow) {
      const fraction = this.followingGrowth ? 850 / this.naturalDuration : 1;
      if (this.followingGrowth && progress >= fraction) {
        if (!this.reflowDestination) { this.paintGeometry(this.reflow.to); this.reflowDestination = true; }
        this.drawGrowth(clamp((progress - fraction) / (1 - fraction)), true, handoff, originalProgress >= 1); return;
      }
      this.reflowDestination = false;
      if (this.followingGrowth) this.drawGrowth(0, false);
      const { from, to, paintPaths, cameraFrom, cameraTo } = this.reflow, p = ease(clamp(progress / fraction));
      const points = new Map([...to].map(([id, end]) => { const start = from.get(id) ?? end; return [id, { x: start.x + (end.x - start.x) * p, y: start.y + (end.y - start.y) * p }]; }));
      this.points = points;
      for (const [id, point] of points) { const node = this.nodes.get(id)!; node.style.left = `${point.x}px`; node.style.top = `${point.y}px`; }
      if (p >= 1) this.paintGeometry(to); else paintPaths(p, points);
      this.camera.interpolate(cameraFrom, cameraTo, progress / fraction);
      this.element.dataset.growthPhase = progress >= 1 ? 'settled' : 'reflow';
      const full = this.whole || this.graph.nodes.every(n => n.unlockStep <= this.target) && this.graph.edges.every(e => e.unlockStep <= this.target);
      this.camera.setBounds(this.graphBounds(full), full ? 'full' : 'visible');
      this.detail.render(); return;
    }
    this.drawGrowth(progress, true, handoff, originalProgress >= 1);
  }
  private drawGrowth(progress: number, scriptedCamera = true, handoff = 0, finished = progress >= 1) {
    const clock = (this.reverse ? 1 - clamp(progress) : clamp(progress)) * this.eventLength, time = Math.max(0, clock - this.focusDelay);
    if (this.active && scriptedCamera) {
      if (this.reverse) {
        const retreat = this.reverseTraceWindow ? clamp((this.focusDelay + this.reverseTraceWindow - clock) / this.reverseTraceWindow) : progress;
        if (!this.reverseTraceWindow) this.camera.interpolate(this.focusFrom, this.focusSource, progress);
        else if (retreat === 0) this.camera.interpolate(this.focusFrom, this.focusTo, progress / .25);
        else this.camera.interpolate(this.focusTo, this.focusSource, retreat);
      }
      else if (clock < this.focusDelay) this.camera.interpolate(this.focusFrom, this.focusSource, clock / this.focusDelay);
      else if (this.teachingPath && this.teachingContext) {
        const p = clamp(time / this.teachingPath.duration);
        if (p < .28) this.camera.interpolate(this.focusSource, this.teachingContext, p / .28);
        else {
          const t = ease(clamp((p - .28) / .72)), point = this.teachingPath.path.getPointAtLength(this.teachingPath.length * p);
          const sourceScale = this.teachingContext.scale, scale = sourceScale + (this.focusTo.scale - sourceScale) * t;
          const tracked = this.camera.frame([point], scale);
          // Blend from a clear source/path context to the arriving seal, then
          // hold its readable composition through the whole inscription.
          this.camera.interpolate(this.teachingContext, p >= 1 ? this.focusTo : tracked, t);
        }
      } else this.camera.interpolate(this.focusSource, this.focusTo, time / this.travelTime);
    }
    this.element.dataset.direction = this.reverse ? 'back' : 'forward';
    this.element.dataset.growthPhase = finished ? 'settled' : handoff > 0 ? 'handoff' : this.reverse ? 'retraction' : clock < this.focusDelay ? 'focus' : 'propagation';
    for (const edge of this.graph.edges) {
      const view = this.edges.get(edge.id)!;
      const from = this.graph.nodes.find(n => n.id === edge.from)!, to = this.graph.nodes.find(n => n.id === edge.to)!;
      const eligible = edge.unlockStep <= this.extent && from.unlockStep <= this.extent && to.unlockStep <= this.extent;
      const settled = eligible && edge.unlockStep <= this.base;
      const p = !eligible ? 0 : finished ? edge.unlockStep <= this.target ? 1 : 0 : settled ? 1 : Math.max(handoff, clock <= this.focusDelay ? 0 : clamp((time - (this.starts.get(edge.id) ?? 0)) / view.duration));
      // Round SVG dash caps can paint a dot even at zero dash length.
      view.path.style.visibility = eligible && p > 0 ? 'visible' : 'hidden';
      view.path.style.strokeDasharray = `${view.length}`; view.path.style.strokeDashoffset = String(view.length * (1 - p));
      view.path.dataset.progress = p.toFixed(3);
      const burning = eligible && !settled && p > 0 && p < 1;
      view.path.dataset.edgeState = p <= 0 ? 'hidden' : !settled ? 'active' : from.unlockStep <= this.base && this.nodes.get(edge.from)!.classList.contains('visited') && this.nodes.get(edge.to)!.classList.contains('visited') ? 'visited' : 'available';
      view.heat.style.visibility = view.ember.style.visibility = view.flame.style.visibility = view.scorch.style.visibility = burning ? 'visible' : 'hidden';
      for (const mark of [view.heat, view.ember, view.flame, view.scorch]) mark.style.opacity = String(1 - handoff * .65);
      view.ash.forEach(dot => dot.style.visibility = burning ? 'visible' : 'hidden');
      view.heat.style.strokeDasharray = `12 ${view.length + 12}`; view.heat.style.strokeDashoffset = String(-Math.max(0, view.length * p - 12));
      view.scorch.style.strokeDasharray = `24 ${view.length + 24}`; view.scorch.style.strokeDashoffset = String(-Math.max(0, view.length * p - 24));
      if (burning) {
        const point = view.path.getPointAtLength(view.length * p), phase = hash(edge.id) % 97;
        view.ember.setAttribute('cx', String(point.x)); view.ember.setAttribute('cy', String(point.y));
        const flicker = Math.sin(clock * .025 + phase), height = 6 + (flicker + 1) * 3;
        view.flame.setAttribute('d', `M${point.x - 2} ${point.y + 1} Q${point.x - 3 + flicker * 2} ${point.y - height * .5} ${point.x + flicker * 3} ${point.y - height} Q${point.x + 4} ${point.y - 3} ${point.x + 2} ${point.y + 1}Z`);
        view.ash.forEach((dot, i) => {
          const age = ((clock / 460 + i / 3 + phase / 97) % 1), trail = view.path.getPointAtLength(Math.max(0, view.length * p + (this.reverse ? 1 : -1) * (8 + age * 22)));
          dot.setAttribute('cx', String(trail.x + Math.sin(age * 9 + phase) * age * 4)); dot.setAttribute('cy', String(trail.y + age * age * 18 - Math.sin(age * Math.PI) * 4)); dot.style.opacity = String((1 - age) * .7);
        });
      }
    }
    // Convergences reveal on FIRST incoming arrival. Independent roots start
    // immediately. All eligible edges share time=0, including parallel branches.
    for (const node of this.graph.nodes) {
      const button = this.nodes.get(node.id)!;
      const eligible = node.unlockStep <= this.extent, settled = node.unlockStep <= this.base;
      const arrival = this.arrivals.get(node.id) ?? 0;
      // Physical-arrival priming subtracts the focus interval. Floating path
      // lengths can otherwise leave 0.9999999999999997 at completion, keeping a
      // visibly finished seal inert. Final visibility belongs to the target set.
      const p = !eligible ? 0 : finished ? node.unlockStep <= this.target ? 1 : 0 : settled ? 1 : Math.max(handoff, clamp((time - arrival) / this.nodeTime));
      button.style.visibility = eligible && (settled || p > 0) ? 'visible' : 'hidden';
      const unlocked = this.state.canVisit(node.id);
      button.inert = this.active || !eligible || p < 1 || !!node.slideIds.length && !unlocked;
      button.disabled = !unlocked;
      button.dataset.unlocked = String(unlocked);
      button.setAttribute('aria-disabled', String(!unlocked));
      button.setAttribute('aria-hidden', String(button.style.visibility === 'hidden'));
      button.dataset.inkProgress = p.toFixed(3);
      drawGraphNode(button, p);
      const ink = this.ink.get(node.id);
      const regularWindow = this.duration - FULL_GRAPH_HANDOFF_MS - this.focusDelay - (this.reflow && this.followingGrowth ? 850 : 0);
      if (handoff > 0 && arrival + this.nodeTime > regularWindow) ink?.drawHandoff(handoff);
      else ink?.draw(clamp((p - .58) / .42));
    }
    const complete = this.graph.nodes.every(n => n.unlockStep <= this.target) && this.graph.edges.every(e => e.unlockStep <= this.target) && finished;
    const full = this.whole || complete;
    this.camera.setBounds(this.graphBounds(full), full ? 'full' : 'visible');
    this.detail.render();
  }
  private selectionBounds(ids: Set<string>, edgeIds: string[] = []): GraphBounds {
    const points: { x: number; y: number }[] = [];
    for (const id of ids) {
      const center = this.points.get(id)!, node = this.nodes.get(id)!;
      points.push({ x: center.x - node.offsetWidth / 2, y: center.y - node.offsetHeight / 2 }, { x: center.x + node.offsetWidth / 2, y: center.y + node.offsetHeight / 2 });
    }
    for (const id of edgeIds) { const edge = this.edges.get(id)!; for (let i = 0; i <= 32; i++) points.push(edge.path.getPointAtLength(edge.length * i / 32)); }
    if (!points.length) return this.graphBounds(false);
    return { left: Math.min(...points.map(p => p.x)), right: Math.max(...points.map(p => p.x)), top: Math.min(...points.map(p => p.y)), bottom: Math.max(...points.map(p => p.y)) };
  }
  private graphBounds(full: boolean): GraphBounds {
    if (full && !this.reflow && this.fullBounds) return this.fullBounds;
    const points: { x: number; y: number }[] = [];
    for (const node of this.graph.nodes) {
      const button = this.nodes.get(node.id)!, center = this.points.get(node.id);
      if (!center || !full && button.style.visibility === 'hidden') continue;
      points.push({ x: center.x - button.offsetWidth / 2, y: center.y - button.offsetHeight / 2 }, { x: center.x + button.offsetWidth / 2, y: center.y + button.offsetHeight / 2 });
    }
    for (const view of this.edges.values()) {
      const p = full ? 1 : Number(view.path.dataset.progress ?? 0);
      if (!p) continue;
      for (let i = 0; i <= 32; i++) points.push(view.path.getPointAtLength(view.length * p * i / 32));
    }
    // Before the first mark, frame only the imminent roots, never future bounds.
    if (!points.length) this.graph.nodes.filter(n => n.unlockStep <= this.target).forEach(n => {
      const point = this.points.get(n.id); if (point) points.push({ x: point.x - 90, y: point.y - 40 }, { x: point.x + 90, y: point.y + 40 });
    });
    if (!points.length) return { left: 0, top: 0, right: 200, bottom: 100 };
    const bounds = { left: Math.min(...points.map(p => p.x)), right: Math.max(...points.map(p => p.x)), top: Math.min(...points.map(p => p.y)), bottom: Math.max(...points.map(p => p.y)) };
    if (full && !this.reflow) this.fullBounds = bounds;
    return bounds;
  }
  finish() {
    const wasActive = this.active;
    if (this.reflow) {
      this.draw(1); this.reflow = undefined;
      this.followingGrowth = false;
      this.ink.forEach(ink => ink.dispose()); this.ink.clear();
      // The 850 ms geometry clock must never be evaluated as an old path-growth
      // clock on the next cleanup/resize; all retained marks are now settled.
      this.previous = this.base = this.extent = this.target; this.reverse = false;
      this.active = false; this.camera.lock(false); this.draw(1);
      if (wasActive && this.whole) this.camera.fit(); return;
    }
    this.draw(1); this.active = false;
    this.ink.forEach(ink => ink.dispose()); this.ink.clear();
    this.previous = this.target;
    if (wasActive && this.whole) this.camera.fit();
    this.camera.lock(false); this.draw(1);
  }
  visitState(visited: Set<string>) { this.detail.visits(visited); }
  restoreCamera(pose: CameraPose) {
    if (this.reflow && !this.followingGrowth) this.reflow.cameraTo = pose;
    else if (this.reverse) this.focusSource = pose;
    else this.focusTo = pose;
  }
  selectNode(id: string) { this.detail.select(id); }
  /** The camera focuses while the destination is still covered by turning paper. */
  primeEntrance() {
    this.eventLength -= this.focusDelay; this.focusDelay = 0;
    this.focusFrom = { ...this.focusSource }; this.camera.set(this.focusSource); this.draw(0);
  }
  returnPose(id: string) {
    const to = { ...this.camera.pose }, point = this.points.get(id);
    const scale = Math.min(3.5, to.scale * 1.14), ratio = scale / to.scale;
    return { to, from: point ? { scale, x: to.x - point.x * (scale - to.scale), y: to.y - point.y * (scale - to.scale) }
      : { scale, x: to.x * ratio, y: to.y * ratio } };
  }
  dispose() { this.camera.cancelInput(); this.observer.disconnect(); this.ink.forEach(ink => ink.dispose()); this.ink.clear(); }
}

export const routeGraph: BlockRenderer = (_block, context) => {
  const graph = context.deck.routeGraph;
  if (!graph) { const empty = bookDiagram('No graph'); empty.textContent = 'This presentation has no graph.'; return empty; }
  const slides = context.deck.sections.flatMap(section => section.slides);
  const order = context.deck.flow ? context.deck.flow.map(id => slides.find(s => s.id === id)).filter((s): s is NonNullable<typeof s> => !!s) : slides;
  const state = context.graphState ?? new GraphState(graph, context.deck.config.id, context.visited, order.filter(s => s.routeStep !== undefined && s.kind !== 'finalGraph'));
  let element = context.graphViews?.get(state.id);
  if (!element) {
    element = new GraphView(graph, state, context.visitNode).element;
    context.graphViews?.set(state.id, element);
  }
  getGraphView(element)!.visitState(context.visited);
  return element;
};
