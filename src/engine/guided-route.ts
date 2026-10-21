import type { Deck } from './types';

/** Authored teaching cursor, independent of the graph camera and final preview. */
export class GuidedRoute {
  cursor = 0;
  readonly completed = new Set<string>();
  constructor(readonly steps: NonNullable<Deck['guidedRoute']>['steps']) {}
  get current() { return this.steps[this.cursor]; }
  get unlocked() { return new Set(this.steps.slice(0, this.cursor + 1).flatMap(step => step.unlock)); }
  canVisit(id: string) { return this.unlocked.has(id); }
  advance() { if (this.cursor + 1 >= this.steps.length) return false; this.cursor++; return true; }
  rewind() { if (!this.cursor) return false; this.cursor--; return true; }
  restart() { this.cursor = 0; this.completed.clear(); }
}
