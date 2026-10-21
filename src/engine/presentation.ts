import type { Action, Deck, PresenterState, Slide, Timings, SceneTransition } from './types';
import { createBook } from '../components/book';
import { renderSlide, RendererRegistry } from '../components/slide';
import type { RenderedScene } from '../components/slide';
import { MagicalReveal } from '../effects/magical-reveal';
import { Timeline, clamp } from '../effects/timeline';
import { cameraPose, bindingPose, leafPose, dropPose, dropTiming } from '../effects/book-motion';
import { hash } from '../effects/random';
import { focusView } from '../effects/view';
import { PaperBurnThrough } from '../effects/paper-burn';
import { getGraphView, type GraphView } from '../components/route-graph';
import { mapIntent } from './graph-navigation';
import type { CameraPose } from '../components/graph-camera';
import { GraphState } from './graph-state';
import { GuidedRoute } from './guided-route';
import { getDemoSequence, sceneSequences, type DemoSequence } from '../components/demo-sequence';
import { sampleDropProfile, type DropProfile } from '../effects/drop-profile';

const defaults: Timings = { opening: 1900, turn: 520, erase: 430, reveal: 1000, drop: 1300, closing: 1900 };
const keys: Record<Action, string[]> = {
  next: ['ArrowRight', ' ', 'PageDown'], back: ['ArrowLeft', 'PageUp'], skip: ['s'], replay: ['r'],
  home: ['Home'], fullscreen: ['f'], effects: ['m'], pause: ['p'], escape: ['Escape'], minimap: ['g'],
  cue: ['c'],
};

export class Presentation {
  readonly state: PresenterState = { phase: 'closed', index: 0, beat: 0, effects: !matchMedia('(prefers-reduced-motion: reduce)').matches, visited: new Set(), routeReturn: null };
  readonly timeline = new Timeline();
  readonly graphState?: GraphState;
  readonly guided?: GuidedRoute;
  /** Rehearsal-only visual QA override; never required in content data. */
  readonly rehearsal: { burnOrigins?: 1 | 2 | 3; dropSeed?: number } = {};
  readonly slides: Slide[];
  private ui;
  private cache = new Map<string, RenderedScene>();
  private current?: RenderedScene;
  private reveals: MagicalReveal[] = [];
  private pendingDemoInk: HTMLElement[] = [];
  private exits: MagicalReveal[] = [];
  private paperBurns: PaperBurnThrough[] = [];
  private graphViews = new Map<string, HTMLElement>();
  private cameraReturn?: CameraPose;
  private selectionReturn?: string;
  private graphAnimations: GraphView[] = [];
  private graphReplay = false;
  private restoringGraph = false;
  private expandingGraph = false;
  private graphEntrance = false;
  private graphRestoration?: { view: GraphView; from: CameraPose; to: CameraPose };
  private navigationIntent = 'cover';
  private mapReturn?: { index: number; beat: number; mode: 'cover' | 'page' | 'graph'; camera?: CameraPose; selected?: string };
  private transitionPairs = new Map<string, 'burn' | 'paperBurn' | 'page' | 'drop' | 'handoff'>();
  private paperReplay?: { index: number; old: HTMLElement; seed: number };
  private handoffSources = new Map<string, HTMLElement>();
  private visit = 0;
  private entranceSeed = 0;
  private entranceSeeds = new Map<string, number>();
  private dropProfiles = new Map<string, DropProfile>();
  private dropInvocation = 0;
  private dropBackgrounds = new Map<string, HTMLElement>();
  private paperTransition?: {
    source: RenderedScene; sourceIndex: number; sourceBeat: number; sourceCamera?: CameraPose;
    target: RenderedScene; index: number; beat: number;
    sheet: HTMLElement; background: HTMLElement; shadow: HTMLElement;
    profile: DropProfile; progress: number; duration: number; reverse: boolean; returning: boolean;
  };
  private temporary: HTMLElement[] = [];
  private timings: Timings;
  private tempo = 1;
  private activeNode?: string;
  private cueVisible = true;
  private tracedPaths: SVGPathElement[] = [];
  // One normalized physical book pose drives both opening and closing.
  private openingTime = 0;
  private bookDuration = 0;
  private static readonly INK_START = .79;
  private static readonly LEAF_START = .35;
  private static readonly LEAF_INTERVAL = .079;
  private static readonly LEAF_LENGTH = .21;

  constructor(root: HTMLElement, readonly deck: Deck, private registry: RendererRegistry) {
    this.slides = [...deck.sections.flatMap(section => section.slides), ...(deck.ending?.enabled ? deck.ending.slides : [])];
    if (deck.routeGraph && !deck.finalGraphId) {
      deck.finalGraphId = '@completed-graph';
      this.slides.push({ id: deck.finalGraphId, kind: 'finalGraph', eyebrow: 'THE COMPLETE JOURNEY', layout: 'diagram', routeStep: Number.MAX_SAFE_INTEGER,
        blocks: [{ id: 'title', type: 'title', text: 'The complete journey' }, { id: 'map', type: 'diagram', renderer: 'route' }] });
    }
    if (!this.slides.length) throw new Error('A deck must contain at least one slide.');
    const ids = new Set(this.slides.map(slide => slide.id));
    if (ids.size !== this.slides.length) throw new Error('Slide IDs must be unique.');
    for (const slide of this.slides) if (slide.restoreSceneId && !ids.has(slide.restoreSceneId)) throw new Error(`Unknown saved scene: ${slide.restoreSceneId}`);
    this.timings = { ...defaults, ...deck.config.timings };
    if (deck.guidedRoute) this.guided = new GuidedRoute(deck.guidedRoute.steps);
    if (deck.routeGraph) {
      const order = deck.flow ? deck.flow.map(id => this.slides.find(s => s.id === id)!) : this.slides;
      this.graphState = new GraphState(deck.routeGraph, deck.config.id, this.state.visited, order.filter(s => s.routeStep !== undefined && s.kind !== 'finalGraph'));
      this.graphState.guided = this.guided;
    }
    this.ui = createBook(root, deck.config);
    root.dataset.content = deck.config.id;
    this.ui.get<HTMLButtonElement>('[data-action="minimap"]').hidden = !deck.routeGraph;
    document.title = `${deck.config.coverTitle} · Grimoire`;
    document.documentElement.lang = deck.config.language;
    cameraPose(this.ui.book, 0, deck.config.camera);
    bindingPose(this.ui.book, this.ui.cover, 0);
    this.bind(); this.update();
  }
  private bind() {
    this.ui.root.addEventListener('demo-explore', () => this.update());
    this.ui.get('.restart-demo').addEventListener('click', () => {
      if (this.timeline.active) this.timeline.finish();
      const sequence = this.current && sceneSequences(this.current.element)[0];
      if (sequence) this.stepDemo(sequence, 0);
    });
    this.ui.root.addEventListener('demo-step', event => {
      const sequence = getDemoSequence(event.target as Element);
      if (!sequence || !this.current?.element.contains(event.target as Node)) return;
      event.preventDefault();
      if (this.timeline.active) { this.timeline.finish(); return; }
      this.stepDemo(sequence, (event as CustomEvent<{ step: number }>).detail.step);
    });
    this.ui.cover.addEventListener('click', () => this.open());
    this.ui.root.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button => button.addEventListener('click', () => {
      if (button.dataset.action === 'help') this.ui.help.showModal();
      else this.act(button.dataset.action as Action);
    }));
    this.ui.get('.dismiss').addEventListener('click', () => this.ui.help.close());
    this.ui.get<HTMLSelectElement>('.tempo').addEventListener('change', event => { this.timeline.finish(); this.tempo = Number((event.target as HTMLSelectElement).value); });
    document.addEventListener('keydown', event => {
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      // Home is a global state jump, even from a slider or the guide.
      if (event.key === 'Home') { event.preventDefault(); this.ui.help.close(); this.home(); return; }
      if (this.ui.help.open) return;
      const target = event.target as HTMLElement;
      if (target.closest('input,textarea,select,[contenteditable="true"]')) return;
      if (target.closest('button,a,summary') && (event.key === ' ' || event.key === 'Enter')) return;
      if (event.key === '?' ) { event.preventDefault(); this.ui.help.showModal(); return; }
      if (event.key === 'Enter' && this.state.phase === 'closed') { event.preventDefault(); this.open(); return; }
      if (event.key === 'Enter' && this.guided && this.current?.slide.routeStep !== undefined) { event.preventDefault(); if (!event.repeat) this.next(); return; }
      const binding = Object.entries({ ...keys, ...this.deck.config.keys }).find(([, values]) => values.includes(event.key.length === 1 ? event.key.toLowerCase() : event.key));
      if (binding) { event.preventDefault(); if (!event.repeat) this.act(binding[0] as Action); }
    });
    window.addEventListener('resize', () => this.timeline.finish());
    document.addEventListener('visibilitychange', () => { if (document.hidden && this.timeline.active && !this.timeline.paused) { this.timeline.togglePause(); this.update(); } });
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', event => {
      this.state.effects = !event.matches; this.timeline.finish(); this.update();
    });
  }
  act(action: Action) {
    if (this.state.phase === 'closing' && action === 'escape') return;
    if (action === 'next') this.next();
    else if (action === 'back') this.back();
    else if (action === 'skip') this.timeline.finish();
    else if (action === 'replay') this.replay();
    else if (action === 'home') this.home();
    else if (action === 'minimap') this.miniMap();
    else if (action === 'cue') { this.cueVisible = !this.cueVisible; this.update(); }
    else if (action === 'effects') { this.state.effects = !this.state.effects; this.timeline.finish(); this.update(); }
    else if (action === 'pause') { this.timeline.togglePause(); this.update(); }
    else if (action === 'escape' && this.state.routeReturn) this.returnToRoute();
    else if (action === 'fullscreen') {
      const request = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen?.();
      request?.catch(() => this.announce('Fullscreen is unavailable in this browser. Use your browser’s presentation mode.'));
    }
  }
  private clean(preserveGraph = false) {
    this.timeline.cancel();
    this.cancelPaper();
    this.pendingDemoInk.forEach(target => target.style.visibility = ''); this.pendingDemoInk = [];
    this.reveals.forEach(reveal => reveal.dispose()); this.reveals = [];
    this.exits.forEach(reveal => reveal.dispose()); this.exits = [];
    this.paperBurns.forEach(burn => burn.dispose()); this.paperBurns = [];
    if (!preserveGraph) { this.graphAnimations.forEach(view => view.finish()); this.graphAnimations = []; }
    this.graphViews.forEach(element => getGraphView(element)?.camera.lock(true));
    this.graphRestoration = undefined;
    this.tracedPaths.forEach(path => { path.style.strokeDashoffset = '0'; });
    this.tracedPaths = [];
    this.temporary.forEach(element => element.remove()); this.temporary = [];
    this.current?.element.removeAttribute('style');
    this.current?.element.removeAttribute('aria-hidden');
    if (this.current) this.current.element.inert = false;
    this.ui.host.style.visibility = '';
    this.ui.host.style.opacity = '';
  }
  private getScene(slide: Slide) {
    const target = slide.restoreSceneId ? this.slides.find(item => item.id === slide.restoreSceneId)! : slide;
    let scene = this.cache.get(target.id);
    if (!scene) {
      scene = renderSlide(target, { deck: this.deck, slide: target, visited: this.state.visited, visitNode: id => this.visitNode(id), graphViews: this.graphViews, graphState: this.graphState }, this.registry);
      this.cache.set(target.id, scene);
    }
    if (target.routeStep !== undefined) {
      const view = this.graphViews.get(this.graphState!.id);
      const slot = scene.element.querySelector('[data-block="map"]');
      if (view && slot) { slot.replaceChildren(view); getGraphView(view)?.visitState(this.state.visited); }
    }
    scene.element.querySelectorAll<HTMLElement>('[data-node]').forEach(node => node.classList.toggle('visited', this.state.visited.has(node.dataset.node!)));
    return scene;
  }
  private sceneAxis(slide: Slide) { return this.graphState!.orientationFor(slide); }
  private setBeats(scene: RenderedScene, beat: number) {
    for (const slot of scene.slots) {
      const visible = Number(slot.dataset.beat) <= beat;
      slot.style.visibility = visible ? '' : 'hidden'; slot.inert = !visible;
    }
  }
  private prepareReveal(scene: RenderedScene, beat: number, all = false, regions?: 1 | 2 | 3, preserveDemo = false) {
    this.setBeats(scene, beat);
    for (const slot of scene.slots) {
      if ((all ? Number(slot.dataset.beat) <= beat : Number(slot.dataset.beat) === beat) && slot.dataset.reveal !== 'false') {
        const target = slot.querySelector<HTMLElement>('.ink-content')!;
        if (preserveDemo && (target.matches('[data-demo-continuity]') || target.querySelector('[data-demo-continuity]'))) {
          const sequences = [getDemoSequence(target), ...sceneSequences(target)];
          for (const sequence of sequences) for (const [i, mark] of (sequence?.continuity?.revealTargets?.() ?? []).entries()) {
            if (mark.offsetWidth && mark.offsetHeight && mark.textContent?.trim())
              this.reveals.push(new MagicalReveal(mark, hash(`${scene.slide.id}:annotation:${i}`, this.entranceSeed), 'in', regions));
          }
          continue;
        }
        const graph = getGraphView(target);
        if (graph) {
          const axis = this.sceneAxis(scene.slide);
          if (this.guided && this.restoringGraph && !this.graphState!.miniMapPreview) {
            // The real retained map is already inscribed. A node return owns
            // only the departing sheet and camera restoration, not its ink.
            graph.finish();
            continue;
          }
          const selected = this.restoringGraph ? this.graphState!.activeNode : undefined;
          if (!this.restoringGraph && !this.slides[this.state.index].restoreSceneId) this.graphState!.show(scene.slide);
          graph.transition(this.graphStep(scene.slide), axis, this.entranceSeed, this.graphReplay, scene.slide.kind === 'finalGraph', this.expandingGraph, this.graphEntrance);
          if (selected) graph.selectNode(selected);
          if (this.cameraReturn) { graph.restoreCamera(this.cameraReturn); if (this.selectionReturn) graph.selectNode(this.selectionReturn); }
          this.graphAnimations.push(graph);
          continue;
        }
        this.reveals.push(new MagicalReveal(target, hash(`${scene.slide.id}:${slot.dataset.block ?? 'eyebrow'}`, this.entranceSeed), 'in', regions));
        this.tracedPaths.push(...target.querySelectorAll<SVGPathElement>('.route-edge'));
      }
    }
  }
  private drawReveal(progress: number) {
    this.reveals.forEach(reveal => reveal.draw(progress));
    this.graphAnimations.forEach(view => view.draw(progress));
    this.tracedPaths.forEach(path => {
      path.style.strokeDasharray = '1'; path.style.strokeDashoffset = String(1 - clamp(progress));
    });
  }
  private revealDuration(minimum = this.timings.reveal) {
    // Tempo can shorten an overview, but cannot stretch it past its hard cap.
    return this.graphAnimations.length ? Math.max(...this.graphAnimations.map(view => view.fullOverview
      ? view.playbackDuration(this.tempo) : Math.max(minimum / this.tempo, view.playbackDuration(this.tempo)))) : minimum / this.tempo;
  }
  private graphStep(slide: Slide) {
    return slide.routeStep ?? 0;
  }
  private prepareExit(page: HTMLElement, preserveDemo = false) {
    for (const target of page.querySelectorAll<HTMLElement>('.ink-content:not(.ink-front)')) {
      if (target.parentElement?.style.visibility === 'hidden') continue;
      if (preserveDemo && (target.matches('[data-demo-continuity]') || target.querySelector('[data-demo-continuity]'))) { target.style.visibility = 'hidden'; continue; }
      this.exits.push(new MagicalReveal(target, hash(`erase:${page.dataset.scene}:${target.parentElement?.dataset.block ?? 'heading'}:${this.visit}`, this.deck.config.seed), 'out'));
    }
  }
  private drawExit(progress: number) { this.exits.forEach(effect => effect.draw(progress)); }
  private complete = () => {
    this.pendingDemoInk.forEach(target => target.style.visibility = ''); this.pendingDemoInk = [];
    this.reveals.forEach(reveal => reveal.dispose()); this.reveals = [];
    this.exits.forEach(reveal => reveal.dispose()); this.exits = [];
    this.paperBurns.forEach(burn => burn.dispose()); this.paperBurns = [];
    this.graphAnimations.forEach(view => view.finish()); this.graphAnimations = [];
    if (this.graphRestoration) {
      if (!this.expandingGraph) this.graphRestoration.view.camera.set(this.graphRestoration.to);
      this.graphRestoration.view.camera.lock(false); this.graphRestoration = undefined;
    }
    this.tracedPaths.forEach(path => { path.style.strokeDashoffset = '0'; });
    this.tracedPaths = [];
    this.temporary.forEach(element => element.remove()); this.temporary = [];
    this.current?.element.removeAttribute('style');
    this.current?.element.removeAttribute('aria-hidden');
    cameraPose(this.ui.book, 1, this.deck.config.camera);
    if (this.current) this.current.element.inert = false;
    bindingPose(this.ui.book, this.ui.cover, 1);
    this.ui.host.style.visibility = '';
    this.ui.host.style.opacity = '';
    this.openingTime = 0;
    this.ui.host.inert = false;
    this.ui.spread.style.opacity = '';
    this.ui.cover.style.visibility = 'hidden'; this.ui.cover.inert = true;
    this.cameraReturn = undefined;
    this.state.phase = 'ready'; this.update();
    if (this.guided && !this.graphState?.miniMapPreview && this.current?.slide.id === this.guided.current.sceneId) {
      const id = this.guided.current.nodeId;
      if (id) getGraphView(this.current.element)?.selectNode(id);
    }
    this.announce(`${this.current?.slide.eyebrow}. ${this.current?.slide.blocks.find(block => block.type === 'title')?.text ?? this.current?.slide.blocks.find(block => block.type === 'title')?.lines?.join(' ') ?? ''}`);
  };
  /** Complete visual journey: same normalized positions in either direction.
   * During opening the front cover swings away first, while the camera and
   * four parchment leaves move through one shared timeline. During closing
   * we evaluate THESE EXACT POSES from 1 to 0 rather than inventing a
   * separate sequence of hard rectangular panels. */
  private poseBookJourney(progress: number, leaves: HTMLElement[]) {
    const p = clamp(progress);
    bindingPose(this.ui.book, this.ui.cover, p / .39);
    cameraPose(this.ui.book, (p - .10) / .75, this.deck.config.camera);
    leaves.forEach((leaf, i) => {
      const start = Presentation.LEAF_START + i * Presentation.LEAF_INTERVAL;
      const end = start + Presentation.LEAF_LENGTH;
      leafPose(leaf, (p - start) / Presentation.LEAF_LENGTH);
      leaf.style.visibility = p > start && p < end ? 'visible' : 'hidden';
    });
    // The inscribed page lives INSIDE the spread. Before its physical arrival,
    // only the page stock and the flipping leaves are allowed to be visible.
    this.ui.host.style.visibility = p < Presentation.INK_START ? 'hidden' : 'visible';
  }

  /** Opening and closing share one reversible clock. The cover receives a
   * longer final swing, and the zoom recenters before that swing so the
   * closing cover remains visibly inside the camera frame. Ink overlaps
   * the final approach / first retreat; it does not add a separate pause. */
  private journeyDuration() {
    return (Math.max(this.timings.opening, this.timings.closing) + this.timings.reveal * .65) / this.tempo;
  }

  open(instant = false, destination?: number) {
    if (this.state.phase !== 'closed') return;
    this.clean(); this.state.index = destination ?? (this.deck.flow ? this.slides.findIndex(s => s.id === this.deck.flow![0]) : 0); this.state.beat = 0; this.state.routeReturn = null;
    this.activeNode = undefined;
    this.navigationIntent = destination === undefined ? 'cover-open' : 'cover-map';
    // A cover preview leaves the slideshow untouched. A normal start is an
    // intentional restart, with dormant renderer visibility set before mounting.
    if (this.graphState) {
      if (destination === undefined) {
        this.graphState.restart(); this.guided?.restart();
        this.cache.forEach(scene => sceneSequences(scene.element).forEach(sequence => { sequence.continuity?.reset?.(); sequence.setStep(0); }));
      }
      else this.graphState.miniMapPreview = true;
      this.graphViews.forEach(el => getGraphView(el)?.stage(-1, destination === undefined ? this.graphState!.policy.initial : this.graphState!.policy.final));
    }
    this.handoffSources.clear(); this.dropBackgrounds.clear(); this.paperReplay = undefined;
    this.graphReplay = false;
    this.graphEntrance = true;
    this.restoringGraph = false;
    this.expandingGraph = false; this.mapReturn = undefined; this.transitionPairs.clear();
    if (destination !== undefined && this.slides[destination].kind === 'finalGraph') {
      this.mapReturn = { index: destination, beat: 0, mode: 'cover' };
    }
    this.entranceSeed = hash(this.slides[this.state.index].id, this.deck.config.seed);
    this.entranceSeeds.set(this.slides[this.state.index].id, this.entranceSeed);
    this.ui.book.classList.add('is-open'); this.ui.spread.setAttribute('aria-hidden', 'false');
    this.current = this.getScene(this.slides[this.state.index]); this.ui.host.replaceChildren(this.current.element);
    this.ui.host.inert = true;
    focusView(this.current.element, this.current.slide.focus);
    this.setBeats(this.current, 0);
    if (instant || !this.state.effects) { this.settleGraph(); this.complete(); return; }
    if (this.current.slide.kind === 'finalGraph') { this.finalMapEntrance(0); return; }
    this.state.phase = 'opening'; this.update();
    this.prepareReveal(this.current, 0);
    const leaves = this.makeLeaves(4);
    const duration = this.journeyDuration();
    this.bookDuration = duration;
    this.openingTime = 0;
    this.timeline.play(duration, time => {
      this.openingTime = time;
      const p = clamp(time / duration);
      this.poseBookJourney(p, leaves);
      this.drawReveal(clamp((p - Presentation.INK_START) / (1 - Presentation.INK_START)));
    }, this.complete);
  }
  private makeLeaves(count = 4) {
    return Array.from({ length: count }, (_, index) => {
      const leaf = document.createElement('div'); leaf.className = 'flutter-leaf';
      leaf.setAttribute('aria-hidden', 'true'); leaf.style.zIndex = String(6 + index);
      this.ui.get('.leaf-host').append(leaf); this.temporary.push(leaf); return leaf;
    });
  }
  /** The arriving page is opaque parchment, not a mounted finished graph.
   * Book motion and map inscription are disjoint intervals of one clock. */
  private finalMapEntrance(startPose: number) {
    this.prepareReveal(this.current!, 0, true);
    this.graphAnimations.forEach(view => view.primeEntrance());
    const leaves = this.makeLeaves();
    const journey = this.journeyDuration(), travel = journey * (1 - startPose);
    const reveal = this.revealDuration();
    this.bookDuration = journey;
    this.ui.host.inert = true;
    this.state.phase = 'opening'; this.update();
    this.timeline.play(travel + reveal, time => {
      const arrived = time >= travel;
      const pose = clamp(startPose + time / journey);
      this.openingTime = pose * journey;
      this.poseBookJourney(pose, leaves);
      // Opacity is a compositing gate: unlike inherited visibility it cannot
      // be overridden by a visible node, SVG or glow descendant.
      this.ui.host.style.opacity = arrived ? '1' : '0';
      this.current!.element.setAttribute('aria-hidden', String(!arrived));
      this.drawReveal(arrived ? clamp((time - travel) / reveal) : 0);
      const phase = arrived ? 'graphing' : 'opening';
      if (this.state.phase !== phase) { this.state.phase = phase; this.update(); }
    }, this.complete);
  }
  next() {
    if (this.timeline.active) { this.timeline.finish(); return; }
    if (this.state.phase === 'closed') { this.open(); return; }
    const sequence = this.current && sceneSequences(this.current.element).find(s => s.step < s.maxStep);
    if (sequence) { this.stepDemo(sequence, sequence.step + 1); return; }
    if (this.current && this.state.beat < this.current.maxBeat) {
      this.clean(); this.state.beat++;
      if (!this.state.effects) { this.setBeats(this.current, this.state.beat); this.update(); return; }
      this.state.phase = 'revealing'; this.prepareReveal(this.current, this.state.beat); this.update();
      this.timeline.play(this.timings.reveal / this.tempo, time => this.drawReveal(time / (this.timings.reveal / this.tempo)), this.complete); return;
    }
    if (this.state.routeReturn && this.activeNode) {
      const node = this.deck.routeGraph!.nodes.find(node => node.id === this.activeNode)!;
      const position = node.slideIds.indexOf(this.slides[this.state.index].id);
      if (position >= node.slideIds.length - 1) {
        if (this.guided && !this.graphState?.miniMapPreview && this.guided.current.nodeId === node.id && this.slides[this.state.routeReturn.index].id === this.guided.current.sceneId) {
          const group=this.guided.current.continuationGroup;
          this.guided.completed.add(node.id); this.state.routeReturn = null; this.activeNode = undefined;
          if (this.guided.advance()) {
            if (group && group===this.guided.current.continuationGroup) this.enterJoinedLesson(1);
            else this.enterGuided(1);
            return;
          }
        }
        this.returnToRoute(); return;
      }
      this.enter(this.slides.findIndex(slide => slide.id === node.slideIds[position + 1]), 1); return;
    }
    if (this.guided && !this.graphState?.miniMapPreview && this.current?.slide.id === this.guided.current.sceneId && this.guided.current.nodeId) {
      if (this.guided.current.advanceOnly) { if (this.guided.advance()) this.enterGuided(1); }
      else this.visitNode(this.guided.current.nodeId);
      return;
    }
    if (this.current?.slide.kind === 'finalGraph') { this.home(); return; }
    if (this.deck.flow) {
      const position = this.deck.flow.indexOf(this.slides[this.state.index].id);
      if (position < 0 || position === this.deck.flow.length - 1) this.home();
      else this.enter(this.slides.findIndex(s => s.id === this.deck.flow![position + 1]), 1);
      return;
    }
    if (this.state.index >= this.slides.length - 1) {
      if (this.deck.ending?.closeBook !== false) this.home();
      return;
    }
    this.enter(this.state.index + 1, 1);
  }
  back() {
    if (this.state.phase === 'closed' || this.state.phase === 'closing') return;
    if (this.state.phase === 'opening') { this.home(); return; }
    if (this.paperTransition) {
      if (this.paperTransition.reverse || this.paperTransition.returning) this.timeline.finish();
      else this.reversePaper();
      return;
    }
    if (this.guided && this.timeline.active) { this.timeline.finish(); return; }
    this.clean();
    const sequence = this.current && sceneSequences(this.current.element).reverse().find(s => s.step > 0);
    if (sequence) { this.stepDemo(sequence, sequence.step - 1); return; }
    if (this.state.beat > 0 && this.current) {
      const removed = this.state.beat--;
      if (!this.state.effects) { this.setBeats(this.current, this.state.beat); this.complete(); return; }
      for (const slot of this.current.slots.filter(slot => Number(slot.dataset.beat) === removed)) {
        this.exits.push(new MagicalReveal(slot.querySelector<HTMLElement>('.ink-content')!, hash(`beat:${this.current.slide.id}:${removed}`, this.deck.config.seed), 'out'));
      }
      this.state.phase = 'erasing'; this.update();
      const duration = this.timings.erase / this.tempo;
      this.timeline.play(duration, time => this.drawExit(time / duration), () => { this.setBeats(this.current!, this.state.beat); this.complete(); }); return;
    }
    if (this.state.routeReturn) {
      const node = this.deck.routeGraph?.nodes.find(n => n.id === this.activeNode);
      const position = node?.slideIds.indexOf(this.slides[this.state.index].id) ?? 0;
      if (node && position > 0) this.enter(this.slides.findIndex(s => s.id === node.slideIds[position - 1]), -1);
      else if (this.guided && !this.graphState?.miniMapPreview && this.activeNode===this.guided.current.nodeId && this.guided.current.continuationGroup && this.guided.steps[this.guided.cursor-1]?.continuationGroup===this.guided.current.continuationGroup) {
        this.guided.rewind(); this.enterJoinedLesson(-1);
      } else this.returnToRoute();
      return;
    }
    if (this.current?.slide.kind === 'finalGraph' && this.mapReturn) {
      const target = this.mapReturn; this.mapReturn = undefined;
      if (this.graphState) { this.graphState.miniMapPreview = false; this.graphState.activeNode = target.selected; }
      if (target.mode === 'cover') this.home();
      else { this.enter(target.index, -1, false, target.mode === 'page' ? 'page' : undefined, { camera: target.camera, selected: target.selected }); this.state.beat = target.beat; this.setBeats(this.current!, target.beat); }
      return;
    }
    if (this.guided && !this.graphState?.miniMapPreview && this.current?.slide.id === this.guided.current.sceneId) {
      if (!this.guided.rewind()) { this.home(); return; }
      const step = this.guided.current;
      if (step.nodeId && !step.advanceOnly) {
        const index = this.slides.findIndex(s => s.id === step.sceneId);
        const restoreLesson = () => {
          this.graphState!.show(this.slides[index]);
          this.state.routeReturn = { index, beat: 0 }; this.activeNode = step.nodeId;
          const node = this.deck.routeGraph!.nodes.find(n => n.id === step.nodeId)!;
          this.enter(this.slides.findIndex(s => s.id === node.slideIds.at(-1)), -1, false, 'paperBurn');
        };
        const graph = getGraphView(this.current!.element);
        if (this.state.effects && graph) {
          this.graphState!.show(this.slides[index]);
          graph.transition(this.graphStep(this.slides[index]), this.sceneAxis(this.slides[index]), this.deck.config.seed);
          this.graphAnimations = [graph]; this.state.phase = 'graphing'; this.update();
          const duration = this.revealDuration();
          this.timeline.play(duration, time => graph.draw(time / duration), () => { graph.finish(); this.graphAnimations = []; restoreLesson(); });
        } else {
          graph?.stage(this.graphStep(this.slides[index]), this.sceneAxis(this.slides[index])); graph?.finish(); restoreLesson();
        }
      } else this.enterGuided(-1);
      return;
    }
    if (this.deck.flow) {
      const position = this.deck.flow.indexOf(this.slides[this.state.index].id);
      if (position <= 0) this.home();
      else this.enter(this.slides.findIndex(s => s.id === this.deck.flow![position - 1]), -1);
      return;
    }
    if (this.state.index === 0) this.home();
    else this.enter(this.state.index - 1, -1);
  }
  /** Deck-authored adjacent concepts can defer their graph visit as one story.
   * GraphView remains untouched until the group ends, so it reveals the union
   * of new nodes/paths concurrently from its retained, already-inscribed base. */
  private enterJoinedLesson(direction: number) {
    const step=this.guided!.current;
    const node=this.deck.routeGraph!.nodes.find(n=>n.id===step.nodeId)!;
    this.state.routeReturn={index:this.slides.findIndex(s=>s.id===step.sceneId),beat:0};
    this.activeNode=node.id;this.state.visited.add(node.id);
    this.enter(this.slides.findIndex(s=>s.id===(direction>0?node.slideIds[0]:node.slideIds.at(-1))),direction,false,'burn',{continuation:true});
  }
  private enterGuided(direction: number) {
    this.enter(this.slides.findIndex(s => s.id === this.guided!.current.sceneId), direction,
      false, this.current?.slide.routeStep === undefined ? 'paperBurn' : undefined);
  }
  private stepDemo(sequence: DemoSequence, step: number) {
    this.clean(); const from = sequence.step; sequence.setStep(step);
    if (!this.state.effects) { sequence.transition?.(from, sequence.step, 1); this.complete(); return; }
    const duration = (sequence.duration ?? 460) / this.tempo;
    const motion = sequence.revealAfterMotion && sequence.transition && from !== sequence.step ? duration : 0;
    const inscription = sequence.revealAfterMotion ? 460 / this.tempo : duration;
    const targets = sequence.targets.filter(target => target.offsetWidth && target.offsetHeight && target.textContent?.trim());
    const inscribe = () => targets.forEach((target, i) => this.reveals.push(new MagicalReveal(target, hash(`demo:${this.current!.slide.id}:${step}:${i}`, this.deck.config.seed), 'in')));
    let prepared = false;
    if (sequence.revealAfterMotion) this.pendingDemoInk = targets;
    this.ui.host.inert = true;
    this.state.phase = 'revealing'; this.update();
    this.timeline.play(motion + inscription, time => {
      if (sequence.revealAfterMotion) {
        // Newly introduced words stay blank while geometry moves. Build their
        // ordinary burn masks only at the final, typeset pose; old ink stays.
        if (time < motion) {
          if (prepared) { this.reveals.forEach(reveal => reveal.dispose()); this.reveals = []; prepared = false; }
          sequence.transition?.(from, sequence.step, clamp(time / motion));
          targets.forEach(target => target.style.visibility = 'hidden');
        } else {
          if (!prepared) {
            sequence.transition?.(from, sequence.step, 1);
            targets.forEach(target => target.style.visibility = ''); inscribe(); prepared = true;
          }
          this.drawReveal(clamp((time - motion) / inscription));
        }
      } else {
        if (!prepared) { sequence.transition?.(from, sequence.step, 0); inscribe(); prepared = true; }
        const p = clamp(time / duration); sequence.transition?.(from, sequence.step, p); this.drawReveal(p);
      }
    }, this.complete);
  }
  private enter(index: number, direction: number, replay = false, transition?: SceneTransition, arrival: { restoreGraph?: boolean; expandGraph?: boolean; nodeId?: string; camera?: CameraPose; selected?: string; continuation?: boolean } = {}) {
    this.clean();
    this.cameraReturn = arrival.camera;
    this.selectionReturn = arrival.selected;
    this.graphReplay = replay;
    this.restoringGraph = !!arrival.restoreGraph;
    this.expandingGraph = !!arrival.expandGraph;
    const previous = this.current?.slide;
    const slide = this.slides[index];
    const structural = slide.kind === 'chapter' || (slide.kind === 'finalGraph' && previous?.kind === 'recap');
    const graphBoundary = previous && (slide.routeStep !== undefined || previous.routeStep !== undefined);
    const forwardFamily = transition ?? ((slide.kind === 'recap' || slide.effect === 'parchmentDrop') ? 'drop'
      : slide.effect === 'parchmentExit' || slide.drop?.mode === 'transition' ? 'handoff'
      : structural || slide.effect === 'paperBurn' ? 'paperBurn'
      : slide.effect === 'pageTurn' || graphBoundary ? 'page' : 'burn');
    const selectedTransition = direction < 0 && previous ? transition ?? this.transitionPairs.get(`${slide.id}>${previous.id}`) ?? forwardFamily : forwardFamily;
    if (direction > 0 && previous && !replay) this.transitionPairs.set(`${previous.id}>${slide.id}`, selectedTransition);
    // A paper transition owns its two real page layers. Keep the logical source
    // active until the incoming sheet has landed (or the outgoing one has lifted).
    if (selectedTransition === 'drop' && this.state.effects && this.current) {
      this.drop(slide, index, direction < 0, replay); return;
    }
    const handoff=arrival.continuation && this.current ? sceneSequences(this.current.element).flatMap(seq=>seq.continuity ? [{key:seq.continuity.key,state:seq.continuity.capture()}] : []) : [];
    let old = this.current?.element.cloneNode(true) as HTMLElement | undefined;
    this.state.index = index;
    const destination = slide.restoreSceneId ? this.slides.find(item => item.id === slide.restoreSceneId)! : slide;
    this.entranceSeed = replay ? this.entranceSeeds.get(slide.id) ?? hash(slide.id, this.deck.config.seed) : hash(`${slide.id}:visit:${++this.visit}`, this.deck.config.seed);
    this.entranceSeeds.set(slide.id, this.entranceSeed);
    const retainedTeachingMap = !!this.guided && !this.graphState!.miniMapPreview && destination.kind !== 'finalGraph';
    this.graphEntrance = destination.routeStep !== undefined && previous?.routeStep === undefined && !this.expandingGraph && !retainedTeachingMap;
    const returnView = arrival.nodeId ? this.graphViews.get(this.graphState!.id) : undefined;
    const returnPose = returnView ? getGraphView(returnView)!.returnPose(arrival.nodeId!) : undefined;
    if (destination.routeStep !== undefined && previous?.routeStep === undefined && !retainedTeachingMap) {
      const view = this.graphViews.get(this.graphState!.id);
      if (view) getGraphView(view)?.stage(this.expandingGraph ? this.graphState!.progressStep : -1, this.sceneAxis(destination));
    }
    this.current = this.getScene(slide);
    for (const seq of sceneSequences(this.current.element)) {
      const match=handoff.find(item=>item.key===seq.continuity?.key);
      if(match) { seq.setStep(direction>0?0:seq.maxStep);seq.continuity!.restore(match.state); }
    }
    this.state.beat = direction < 0 || slide.restoreSceneId ? this.current.maxBeat : 0;
    this.ui.host.replaceChildren(this.current.element);
    if (this.guided) this.ui.host.inert = true;
    cameraPose(this.ui.book, 1, this.deck.config.camera);
    focusView(this.current.element, slide.focus ?? this.current.slide.focus);
    this.setBeats(this.current, this.state.beat);
    if (arrival.nodeId) {
      const view = getGraphView(this.current.element);
      if (view) {
        view.layout();
        this.graphRestoration = { view, ...(this.guided ? view.returnPose(arrival.nodeId) : returnPose ?? view.returnPose(arrival.nodeId)) };
        view.camera.lock(true);
      }
      this.navigationIntent = arrival.expandGraph ? 'node-map' : 'node-return';
    } else this.navigationIntent = transition === 'paperBurn' && this.state.routeReturn ? 'node-entry' : 'scene';
    const graph = getGraphView(this.current.element);
    if (!this.state.effects) { this.settleGraph(); this.complete(); return; }
    if (slide.routeStep !== undefined && previous?.routeStep !== undefined && !replay && !transition) {
      this.navigationIntent = graph && graph.axis !== this.sceneAxis(slide) ? 'graph-reorient' : direction > 0 ? 'graph-forward' : 'graph-back';
      this.prepareReveal(this.current, this.state.beat, true);
      this.state.phase = 'graphing'; this.update();
      const duration = this.revealDuration(850);
      this.timeline.play(duration, time => this.drawReveal(time / duration), this.complete); return;
    }
    if (replay && this.paperReplay?.index === index) { this.burnPageThrough(slide, this.paperReplay.old.cloneNode(true) as HTMLElement, true); return; }
    if (old && !replay && selectedTransition === 'paperBurn') {
      this.burnPageThrough(slide, old);
      return;
    }
    if (selectedTransition === 'page' && !replay) { this.flipPage(old, direction); return; }
    if (selectedTransition === 'handoff') {
      if (replay) old = this.handoffSources.get(slide.id)?.cloneNode(true) as HTMLElement | undefined;
      else if (old) this.handoffSources.set(slide.id, old.cloneNode(true) as HTMLElement);
      this.handoff(slide, old, direction < 0); return;
    }
    const outgoingDuration = replay ? 0 : (arrival.continuation ? 260 : this.timings.erase) / this.tempo;
    this.prepareReveal(this.current, this.state.beat, true, undefined, arrival.continuation);
    const revealDuration = arrival.continuation ? 500 / this.tempo : this.revealDuration();
    const incomingStart = outgoingDuration * .46;
    if (old && outgoingDuration) {
      old.classList.add('outgoing-scene');
      old.inert = true; old.setAttribute('aria-hidden', 'true'); this.ui.host.append(old); this.temporary.push(old);
      this.prepareExit(old, arrival.continuation);
    }
    this.state.phase = outgoingDuration ? 'erasing' : 'revealing'; this.update();
    this.timeline.play(incomingStart + revealDuration, time => {
      const out = clamp(time / Math.max(1, outgoingDuration));
      this.drawExit(out);
      if (old) old.style.visibility = out >= 1 ? 'hidden' : '';
      this.drawReveal(clamp((time - incomingStart) / revealDuration));
    }, this.complete);
  }

  /** One physical page journey, sampled forwards or backwards. Destination
   * inscription always waits until the leaves have finished covering the page. */
  private flipPage(old: HTMLElement | undefined, direction: number) {
    this.prepareReveal(this.current!, this.state.beat, true);
    this.graphAnimations.forEach(view => view.primeEntrance());
    const target = this.current!.element; target.style.opacity = '0'; target.inert = true;
    if (old) { old.classList.add('outgoing-scene'); old.inert = true; old.setAttribute('aria-hidden', 'true'); this.ui.host.append(old); this.temporary.push(old); this.prepareExit(old); }
    const leaves = this.makeLeaves(); this.state.phase = 'turning'; this.update();
    const duration = Math.max(520, this.timings.turn + 180) / this.tempo;
    const reveal = this.revealDuration();
    this.timeline.play(duration + reveal, time => {
      const p = clamp(time / duration), arrived = time >= duration;
      this.drawExit(clamp((p - .18) / .48));
      if (old) old.style.visibility = p >= .68 ? 'hidden' : '';
      leaves.forEach((leaf, i) => { const start = .08 + i * .12, clock = .76 * (direction > 0 ? p : 1 - p); leafPose(leaf, (clock - start) / .30); leaf.style.visibility = clock > start && clock < start + .30 ? 'visible' : 'hidden'; });
      target.style.opacity = arrived ? '1' : '0'; target.setAttribute('aria-hidden', String(!arrived));
      this.drawReveal(arrived ? clamp((time - duration) / reveal) : 0);
      const phase = arrived ? this.graphAnimations.length ? 'graphing' : 'revealing' : 'turning';
      if (this.state.phase !== phase) { this.state.phase = phase; this.update(); }
    }, this.complete);
  }

  /** One optional paper-burn scene transition. The original slide is an
   * opaque sheet in the foreground; its ink is not separately erased. Its
   * parchment burns THROUGH from seeded random holes to reveal the next
   * scene, with an irregular black charred edge and restrained embers. */
  private burnPageThrough(slide: Slide, old: HTMLElement, replay = false) {
    old.classList.add('paper-burn-outgoing');
    old.inert = true; old.setAttribute('aria-hidden', 'true');
    this.ui.host.append(old);
    this.temporary.push(old);
    const options = slide.paperBurn;
    const seed = replay ? this.paperReplay!.seed : hash(`paper:${old.dataset.scene}:${slide.id}:visit:${this.visit}`, this.deck.config.seed);
    if (!replay) this.paperReplay = { index: this.state.index, old: old.cloneNode(true) as HTMLElement, seed };
    const burn = new PaperBurnThrough(old, seed, new URLSearchParams(location.search).has('rehearsal') ? this.rehearsal.burnOrigins ?? options?.ignitions : options?.ignitions, options?.charWidth ?? 10);
    this.paperBurns.push(burn);
    const everyday = this.navigationIntent === 'node-entry' ? 1000 : this.navigationIntent === 'node-return' || this.navigationIntent === 'node-map' ? 880 : 1350;
    const duration = Math.max(250, options?.duration ?? everyday) / this.tempo;
    this.state.phase = 'erasing'; this.update();
    this.prepareReveal(this.current!, this.state.beat, true);
    if (this.graphEntrance) this.graphAnimations.forEach(view => view.primeEntrance());
    if (this.graphRestoration) { this.current!.element.inert = true; this.graphRestoration.view.camera.lock(true); }
    const mapReveal = this.graphAnimations.some(view => view.fullOverview) || this.guided && this.graphAnimations.length ? this.revealDuration() : 0;
    this.timeline.play(duration + mapReveal, time => {
      const p = clamp(time / duration); burn.draw(p);
      this.drawReveal(mapReveal ? clamp((time - duration) / mapReveal) : clamp((p - .14) / .72));
      if (this.graphRestoration && time <= duration) {
        const { view, from, to } = this.graphRestoration;
        view.camera.interpolate(from, to, p);
      }
    }, this.complete);
  }

  private printPaper(scene: RenderedScene, beat: number) {
    this.setBeats(scene, beat);
    scene.element.querySelectorAll<HTMLElement>('.ink-content:not(.ink-front)').forEach(ink => {
      ink.style.clipPath = ''; ink.style.maskImage = ''; ink.style.opacity = '';
      ink.dataset.revealProgress = '1.000';
    });
    const graph = getGraphView(scene.element);
    if (graph) graph.stage(this.graphStep(scene.slide), this.sceneAxis(scene.slide));
  }
  private copyPaper(element: HTMLElement) {
    const copy = element.cloneNode(true) as HTMLElement;
    const originals = element.querySelectorAll('canvas');
    copy.querySelectorAll('canvas').forEach((canvas, i) => {
      const original = originals[i];
      if (original.width && original.height) canvas.getContext('2d')?.drawImage(original, 0, 0);
    });
    return copy;
  }
  private drop(slide: Slide, index: number, reverse: boolean, replay: boolean) {
    const source = this.current!, sourceIndex = this.state.index, sourceBeat = this.state.beat;
    const options = (reverse ? source.slide : slide).drop ?? { mode: 'content' as const };
    const seed = new URLSearchParams(location.search).has('rehearsal') && this.rehearsal.dropSeed !== undefined
      ? hash(`drop:${++this.dropInvocation}`, this.rehearsal.dropSeed) : crypto.getRandomValues(new Uint32Array(1))[0];
    const profile = reverse ? this.dropProfiles.get(source.slide.id) ?? sampleDropProfile(seed) : sampleDropProfile(seed);
    if (!reverse) this.dropProfiles.set(slide.id, profile);
    const timing = dropTiming(options, this.timings.drop, profile);
    const sourceGraph = getGraphView(source.element), sourceCamera = sourceGraph ? { ...sourceGraph.camera.pose } : undefined;
    // Only shared-view/replay cases need a frozen copy. Ordinary drops retain
    // the actual outgoing DOM, including live canvas and form/demo state.
    const shared = source.slide.id === (slide.restoreSceneId ?? slide.id) || sourceGraph && (slide.routeStep !== undefined || slide.restoreSceneId);
    const saved = this.copyPaper(source.element);
    if (!reverse && !replay) this.dropBackgrounds.set(slide.id, saved);
    const target = this.getScene(slide), beat = reverse ? target.maxBeat : 0;
    const background = reverse ? target.element : shared ? this.copyPaper(replay ? this.dropBackgrounds.get(slide.id) ?? saved : saved) : source.element;
    const sheet = reverse ? source.element : target.element;
    const shadow = document.createElement('div'); shadow.className = 'paper-drop-shadow'; shadow.setAttribute('aria-hidden', 'true');
    background.classList.add('paper-underlay'); background.inert = true;
    sheet.classList.add('loose-parchment', reverse ? 'lifting-paper' : 'falling-paper');
    sheet.inert = true; sheet.setAttribute('aria-hidden', 'true');
    this.ui.host.replaceChildren(background, shadow, sheet); this.ui.host.inert = true;
    this.printPaper(target, beat);
    focusView(target.element, slide.focus ?? target.slide.focus);
    this.paperTransition = { source, sourceIndex, sourceBeat, sourceCamera, target, index, beat, sheet, background, shadow, profile, progress: reverse ? 1 : 0, duration: timing.duration / this.tempo, reverse, returning: false };
    this.navigationIntent = reverse ? 'paper-lift' : 'paper-drop';
    this.state.phase = 'dropping'; this.update();
    this.timeline.play(timing.total / this.tempo, elapsed => {
      const time = elapsed * this.tempo;
      const p = reverse ? clamp((timing.total - time) / timing.duration) : clamp(time / timing.duration);
      this.paperTransition!.progress = p;
      dropPose(sheet, p, profile, shadow);
    }, () => this.finishPaper());
  }
  private finishPaper() {
    const paper = this.paperTransition;
    if (!paper) return;
    this.paperTransition = undefined;
    this.clearPaperLayers(paper);
    this.current = paper.target; this.state.index = paper.index; this.state.beat = paper.beat;
    this.ui.host.replaceChildren(paper.target.element);
    if (getGraphView(paper.target.element)) {
      if (!this.slides[paper.index].restoreSceneId) this.graphState!.show(paper.target.slide);
      getGraphView(paper.target.element)!.finish();
    }
    this.complete();
  }
  private clearPaperLayers(paper: NonNullable<Presentation['paperTransition']>) {
    paper.shadow.remove();
    for (const element of new Set([paper.sheet, paper.background, paper.source.element, paper.target.element])) {
      element.classList.remove('falling-paper', 'lifting-paper', 'paper-underlay');
      element.removeAttribute('style'); element.removeAttribute('aria-hidden'); element.inert = false;
    }
  }
  private cancelPaper() {
    const paper = this.paperTransition;
    if (!paper) return;
    this.paperTransition = undefined; this.clearPaperLayers(paper);
    this.current = paper.source; this.state.index = paper.sourceIndex; this.state.beat = paper.sourceBeat;
    this.getScene(paper.source.slide);
    this.ui.host.replaceChildren(paper.source.element);
    if (getGraphView(paper.source.element)) {
      this.printPaper(paper.source, paper.sourceBeat);
      const graph = getGraphView(paper.source.element)!; graph.finish();
      if (paper.sourceCamera) graph.camera.set(paper.sourceCamera);
    }
    this.ui.host.inert = false;
  }
  /** Back during descent retraces this exact sampled trajectory; it never
   * first snaps the new sheet down or erases either page's printed content. */
  private reversePaper() {
    const paper = this.paperTransition!;
    this.timeline.cancel(); paper.returning = true;
    const start = paper.progress, duration = Math.max(1, start * paper.duration);
    this.timeline.play(duration, elapsed => {
      paper.progress = start * (1 - clamp(elapsed / duration));
      dropPose(paper.sheet, paper.progress, paper.profile, paper.shadow);
    }, () => { this.cancelPaper(); this.complete(); });
  }
  private handoff(slide: Slide, old?: HTMLElement, reverse = false) {
    // The existing summary is the departing sheet. Never expose the target for
    // a frame before introducing a new foreground layer.
    const target = this.current!.element;
    target.style.opacity = '0'; target.setAttribute('aria-hidden', 'true');
    if (old) {
      old.classList.add('departing-parchment'); old.inert = true; old.setAttribute('aria-hidden', 'true');
      this.ui.host.append(old); this.temporary.push(old); this.prepareExit(old);
    }
    const duration = (slide.exit?.duration ?? 1250) / this.tempo;
    const graph = getGraphView(target);
    if (graph) {
      this.prepareReveal(this.current!, this.state.beat, true);
      this.graphAnimations.forEach(view => view.primeEntrance());
    }
    const mapReveal = graph ? this.revealDuration() : 0;
    this.state.phase = 'handoff'; this.update();
    this.timeline.play(duration + mapReveal, time => {
      const p = clamp(time / duration);
      this.drawExit(clamp(p / .66));
      const emerge = clamp((p - .35) / .65);
      target.style.opacity = String(emerge);
      if (emerge > 0) target.removeAttribute('aria-hidden'); else target.setAttribute('aria-hidden', 'true');
      if (old) {
        const leave = clamp((p - .2) / .8);
        old.style.opacity = String(1 - leave);
        old.style.transform = slide.exit?.style === 'dissolve' ? `scale(${1 + leave * .025})` : `translateY(${-leave * 14}%) rotateZ(${-leave * 3}deg) rotateX(${leave * 8}deg)`;
      }
      if (reverse) { const leave = 1 - emerge; target.style.transform = `translateY(${-leave * 14}%) rotateZ(${-leave * 3}deg) rotateX(${leave * 8}deg)`; }
      if (mapReveal) {
        const arrived = time >= duration;
        target.style.opacity = arrived ? '1' : '0'; target.setAttribute('aria-hidden', String(!arrived));
        this.drawReveal(arrived ? clamp((time - duration) / mapReveal) : 0);
        if (arrived && this.state.phase !== 'graphing') { this.state.phase = 'graphing'; this.update(); }
      }
    }, this.complete);
  }
  replay() {
    if (this.state.phase === 'closed' || this.state.phase === 'closing') return;
    if (this.paperTransition) {
      const paper = this.paperTransition;
      this.clean(); this.enter(paper.index, paper.reverse ? -1 : 1, true); return;
    }
    if (this.state.phase === 'opening') {
      const destination = this.current?.slide.kind === 'finalGraph' ? this.state.index : undefined;
      this.setClosed(); this.open(false, destination); return;
    }
    this.clean(); this.ui.cover.style.visibility = 'hidden'; this.ui.cover.inert = true;
    this.ui.book.classList.add('is-open'); this.ui.spread.setAttribute('aria-hidden', 'false');
    this.enter(this.state.index, 1, true);
  }
  private settleGraph() {
    if (!this.current) return;
    const graph = getGraphView(this.current.element);
    if (graph) {
      if (!this.restoringGraph) {
        this.graphState!.show(this.current.slide);
        graph.transition(this.graphStep(this.current.slide), this.sceneAxis(this.current.slide), this.entranceSeed, false, this.current.slide.kind === 'finalGraph', this.expandingGraph);
      } else graph.stage(this.graphStep(this.current.slide), this.sceneAxis(this.current.slide));
      graph.finish();
      if (this.cameraReturn) graph.camera.set(this.cameraReturn);
    }
  }
  /** Jump to the completed graph is a destination change, not a visitation.
   * It never adds node IDs to visited and always bypasses recap. */
  miniMap() {
    if (!this.deck.finalGraphId || this.state.phase === 'closing') return;
    const index = this.slides.findIndex(s => s.id === this.deck.finalGraphId);
    const intent = mapIntent({ closed: this.state.phase === 'closed', inNode: !!this.state.routeReturn, inGraph: this.current?.slide.routeStep !== undefined });
    if (intent === 'cover-map') { this.open(false, index); return; }
    if (this.state.phase === 'opening' && this.timeline.active) {
      // Retarget the arriving physical page without finishing/jumping the
      // camera. The existing book clock continues from its actual pose.
      const pose = clamp(this.openingTime / this.bookDuration);
      this.clean();
      this.graphState!.miniMapPreview = true;
      this.graphViews.forEach(el => getGraphView(el)?.stage(-1, this.graphState!.policy.final));
      this.state.index = index; this.state.beat = 0; this.state.routeReturn = null;
      this.mapReturn = { index, beat: 0, mode: 'cover' };
      this.current = this.getScene(this.slides[index]); this.ui.host.replaceChildren(this.current.element);
      this.finalMapEntrance(pose); return;
    }
    if (this.timeline.active) this.timeline.finish();
    if (intent === 'node-map') { this.returnToRoute(true); return; }
    if (this.current?.slide.kind === 'finalGraph' && !this.state.routeReturn) return;
    this.clean();
    this.navigationIntent = intent;
    const from = this.current!.slide;
    const inGraph = from.routeStep !== undefined;
    this.mapReturn = { index: this.state.index, beat: this.state.beat, mode: inGraph ? 'graph' : 'page' };
    const sourceView = getGraphView(this.current!.element);
    if (sourceView) { this.mapReturn.camera = { ...sourceView.camera.pose }; this.mapReturn.selected = this.graphState!.activeNode; }
    this.graphState!.miniMapPreview = true;
    this.state.routeReturn = null; this.activeNode = undefined;
    if (!inGraph) {
      this.enter(index, 1, false, 'page'); this.navigationIntent = 'slide-map'; this.update(); return;
    }
    // Same physical page, same graph world and camera: only the unrevealed
    // network is inscribed. No cloned map, leaves, or page transition.
    this.state.index = index; this.state.beat = 0;
    this.current = this.getScene(this.slides[index]); this.ui.host.replaceChildren(this.current.element);
    this.restoringGraph = false; this.graphReplay = false; this.expandingGraph = true; this.graphEntrance = false;
    this.entranceSeed = hash(`map:expand:${++this.visit}`, this.deck.config.seed);
    this.entranceSeeds.set(this.current.slide.id, this.entranceSeed);
    this.prepareReveal(this.current, 0, true);
    if (!this.state.effects) { this.complete(); return; }
    this.state.phase = 'graphing'; this.update();
    const duration = this.revealDuration();
    this.timeline.play(duration, time => this.drawReveal(time / duration), this.complete);
  }
  home() {
    if (this.state.phase === 'closed' || this.state.phase === 'closing') return;
    if (this.paperTransition) this.timeline.finish();
    // When Home interrupts opening, continue backwards from the ACTUAL pose
    // rather than jumping to a fully open book before closing.
    const interruptedOpening = this.state.phase === 'opening';
    const startPose = interruptedOpening && this.bookDuration
      ? clamp(this.openingTime / this.bookDuration) : 1;
    this.clean(true);
    this.navigationIntent = 'cover-close';
    this.graphViews.forEach(element => getGraphView(element)?.camera.lock(true));
    this.ui.get<HTMLDetailsElement>('.presenter-tools').open = false;
    this.ui.cover.style.visibility = ''; this.ui.cover.inert = true;
    this.ui.host.inert = true;
    if (!this.state.effects) { this.setClosed(); return; }
    this.state.phase = 'closing'; this.update();
    // Reuse the SAME four leaves as opening, with the SAME spine and angles;
    // reversing the normalized clock reverses their order and motion.
    const leaves = this.makeLeaves(4);
    const duration = Math.max(1, this.journeyDuration() * startPose);
    if (startPose >= Presentation.INK_START && this.current) this.prepareExit(this.current.element);
    this.timeline.play(duration, time => {
      const remaining = clamp(1 - time / duration);
      const p = startPose * remaining;
      this.poseBookJourney(p, leaves);
      // Burn-out overlaps the initial zoom-out just as burn-in overlaps the
      // last zoom-in. Keep the physical parchment opaque throughout.
      if (this.exits.length) {
        this.drawExit(clamp((startPose - p) / (1 - Presentation.INK_START)));
      }
    }, () => this.setClosed());
  }
  private setClosed() {
    this.clean(); bindingPose(this.ui.book, this.ui.cover, 0); cameraPose(this.ui.book, 0, this.deck.config.camera);
    this.openingTime = 0;
    this.bookDuration = 0;
    this.ui.spread.style.opacity = '';
    this.ui.host.replaceChildren();
    this.ui.host.inert = true;
    this.ui.cover.style.visibility = ''; this.ui.cover.inert = false;
    this.ui.book.classList.remove('is-open'); this.ui.spread.setAttribute('aria-hidden', 'true');
    if (this.graphState) this.graphState.miniMapPreview = false;
    this.state.phase = 'closed'; this.update(); this.ui.cover.focus({ preventScroll: true }); this.announce('Book closed. Press Enter to begin again.');
  }
  private visitNode(id: string) {
    if (['closed', 'opening', 'closing'].includes(this.state.phase)) return;
    if (this.timeline.active) this.timeline.finish();
    const node = this.deck.routeGraph?.nodes.find(node => node.id === id);
    if (!node || !this.graphState?.canVisit(id) || node.unlockStep > (getGraphView(this.current!.element)?.visibleStep ?? -1)) return;
    if (this.guided?.current.advanceOnly && this.guided.current.nodeId === id && !this.graphState.miniMapPreview) {
      if (this.guided.advance()) this.enterGuided(1); return;
    }
    // Content may offer a branch as an alternative to Next, while preserving
    // the authored route and its current reveal boundary. Existing decks opt out.
    if (node.role === 'branch' && this.deck.flow && !this.state.routeReturn) {
      const position = this.deck.flow.indexOf(this.slides[this.state.index].id);
      const cue = position >= 0 ? this.slides.find(s => s.id === this.deck.flow![position + 1]) : undefined;
      if (cue?.routeAdvance?.fromNode === id) {
        const previous = cue.routeAdvance.afterNode;
        if (previous && !this.state.visited.has(previous)) { this.visitNode(previous); return; }
        this.enter(this.slides.indexOf(cue), 1); return;
      }
    }
    const index = this.slides.findIndex(slide => slide.id === node.slideIds[0]);
    if (index < 0) return;
    this.state.routeReturn = { index: this.state.index, beat: this.state.beat };
    getGraphView(this.current!.element)?.selectNode(id);
    this.state.visited.add(id); this.activeNode = id;
    this.enter(index, 1, false, 'paperBurn');
  }
  private returnToRoute(expand = false) {
    const target = this.state.routeReturn;
    if (!target) return;
    const nodeId = this.activeNode;
    this.state.routeReturn = null; this.activeNode = undefined;
    const route = this.slides[target.index];
    const complete = expand && route.kind !== 'finalGraph';
    let index = target.index;
    if (complete) {
      index = this.slides.findIndex(s => s.id === this.deck.finalGraphId);
      const source = this.graphViews.get(this.graphState!.id);
      this.mapReturn = { index: target.index, beat: target.beat, mode: 'graph', camera: source ? { ...getGraphView(source)!.camera.pose } : undefined, selected: this.graphState!.activeNode };
      this.graphState!.miniMapPreview = true;
    }
    const source=this.graphViews.get(this.graphState!.id);
    const alreadyRevealed=source && getGraphView(source)!.visibleStep>=this.graphStep(route);
    // An explicit return from a deferred lesson must first inscribe its earned
    // delta. Ordinary returns to an already-visible cue simply restore it.
    this.enter(index, -1, false, this.guided && complete ? 'page' : 'paperBurn', { restoreGraph: !complete && !!alreadyRevealed, expandGraph: complete, nodeId });
    this.state.beat = complete ? 0 : target.beat; this.setBeats(this.current!, this.state.beat);
  }
  private announce(text: string) { this.ui.get('.announcer').textContent = text; }
  private update() {
    const closed = this.state.phase === 'closed';
    this.ui.root.dataset.phase = this.state.phase;
    this.ui.root.dataset.navigationIntent = this.navigationIntent;
    if (this.graphState) {
      this.ui.root.dataset.activeGraphId = this.graphState.id;
      this.ui.root.dataset.graphOrientation = this.graphState.miniMapPreview ? this.graphState.policy.final : this.graphState.orientation;
      this.ui.root.dataset.miniMapPreview = String(this.graphState.miniMapPreview);
      this.ui.root.dataset.progressStep = String(this.graphState.progressStep);
    }
    this.ui.root.dataset.effects = String(this.state.effects);
    this.ui.root.dataset.scene = closed ? 'cover' : this.slides[this.state.index].id;
    const cue = this.ui.get('.presenter-cue'), sequence = this.current && sceneSequences(this.current.element)[0];
    cue.hidden = !this.guided || closed || !this.cueVisible;
    cue.querySelector('span')!.textContent = this.timeline.active || this.state.phase !== 'ready' ? 'Inscribing…  → / ← finish motion' : sequence
      ? this.current?.element.querySelector('[data-demo-exploring="true"]') ? 'Exploring · → Next teaching beat · ← Previous · Tab away from sliders'
        : `Demo ${sequence.step + 1}/${sequence.maxStep + 1} · → Next · ← Previous${sequence.labels?.[sequence.step] ? ` · ${sequence.labels[sequence.step]}` : ''}`
      : this.current?.slide.routeStep !== undefined && !this.graphState?.miniMapPreview && this.guided?.current.nodeId ? this.guided.current.advanceOnly ? '→ Trace next idea · ← Previous · Drag optional' : `→ Enter ${this.guided.current.nodeId} · ← Previous · Drag optional` : '→ Next step · ← Previous';
    cue.querySelector('span')!.title = sequence?.labels?.[sequence.step] ?? '';
    cue.querySelector<HTMLButtonElement>('.restart-demo')!.hidden = !sequence;
    cue.querySelector<HTMLButtonElement>('.restart-demo')!.disabled = this.state.phase !== 'ready';
    if (this.guided) {
      this.ui.root.dataset.guidedStep = String(this.guided.cursor);
      this.ui.root.dataset.unlockedNodes = [...this.guided.unlocked].join(',');
      this.ui.root.dataset.completedNodes = [...this.guided.completed].join(',');
    }
    this.ui.host.setAttribute('aria-busy', String(!closed && this.state.phase !== 'ready'));
    this.ui.get('.page-position').textContent = closed ? '—' : `${String(this.state.index + 1).padStart(2, '0')} / ${String(this.slides.length).padStart(2, '0')}`;
    this.ui.get('[data-action="effects"]').setAttribute('aria-pressed', String(this.state.effects));
    this.ui.get('[data-action="pause"]').setAttribute('aria-pressed', String(this.timeline.paused));
    this.ui.get('[data-action="pause"]').textContent = this.timeline.paused ? '▷' : 'Ⅱ';
    this.ui.get<HTMLButtonElement>('[data-action="back"]').disabled = closed;
    this.ui.get<HTMLButtonElement>('[data-action="replay"]').disabled = closed;
  }
}

