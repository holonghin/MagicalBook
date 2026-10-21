import type { RouteGraph, Slide } from './types';
import { graphOrientation } from './graph-orientation';
import type { GuidedRoute } from './guided-route';
export type { GraphOrientation } from './graph-orientation';

/** Slideshow progress is independent of the viewport's temporary final preview. */
export class GraphState {
  readonly id: string;
  readonly policy: ReturnType<typeof graphOrientation>;
  progressStep = -1;
  progressCue?: string;
  miniMapPreview = false;
  private finalProgress = false;
  activeNode?: string;
  guided?: GuidedRoute;
  // Empty category nodes never open, even in the free-browsing full map.
  canVisit(id: string) {
    return !!this.data.nodes.find(node => node.id === id)?.slideIds.length
      && (this.miniMapPreview || !this.guided || this.guided.canVisit(id));
  }
  readonly history: { step: number; cue?: string; orientation: string }[] = [];
  constructor(readonly data: RouteGraph, presentationId: string, readonly visited: Set<string>, steps: Slide[] = []) {
    this.id = `${presentationId}:${data.id ?? 'route'}`;
    this.policy = graphOrientation(data, steps);
  }
  get step() { return this.progressStep; }
  get orientation() { return this.finalProgress ? this.policy.final : this.policy.at(this.progressCue ?? ''); }
  get revealedNodes() { return new Set(this.data.nodes.filter(n => n.unlockStep <= this.progressStep).map(n => n.id)); }
  get revealedEdges() { return new Set(this.data.edges.filter(e => e.unlockStep <= this.progressStep).map(e => e.id)); }
  orientationFor(slide: Slide) { return slide.kind === 'finalGraph' ? this.policy.final : this.policy.at(slide.id); }
  show(slide: Slide) {
    if (this.miniMapPreview) return;
    this.progressCue = slide.id; this.progressStep = slide.routeStep ?? 0;
    this.finalProgress = slide.kind === 'finalGraph';
    this.history.push({ cue: slide.id, step: this.progressStep, orientation: this.orientationFor(slide) });
  }
  restart() {
    this.progressCue = undefined; this.progressStep = -1; this.miniMapPreview = false;
    this.finalProgress = false;
    this.activeNode = undefined; this.visited.clear(); this.history.length = 0;
  }
}
