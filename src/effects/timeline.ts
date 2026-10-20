export const clamp = (n: number) => Math.max(0, Math.min(1, n));
export const ease = (n: number) => n * n * (3 - 2 * n);

/** One seekable clock owns every channel in a composition. No delayed timers. */
export class Timeline {
  private frame = 0;
  private generation = 0;
  private schedule() {
    const generation = this.generation;
    this.frame = requestAnimationFrame(now => { if (generation === this.generation) this.tick(now); });
  }
  private start = 0;
  private elapsed = 0;
  private duration = 0;
  private draw: (ms: number) => void = () => {};
  private done: () => void = () => {};
  active = false;
  paused = false;

  play(duration: number, draw: (ms: number) => void, done: () => void) {
    this.cancel();
    this.duration = duration;
    this.draw = draw;
    this.done = done;
    this.active = true;
    this.elapsed = 0;
    this.start = performance.now();
    this.draw(0);
    this.schedule();
  }
  private tick = (now: number) => {
    if (!this.active || this.paused) return;
    this.elapsed = Math.min(this.duration, now - this.start);
    this.draw(this.elapsed);
    if (this.elapsed >= this.duration) {
      this.active = false;
      this.done();
    } else this.schedule();
  };
  seek(fraction: number) {
    if (!this.active) return;
    this.elapsed = this.duration * clamp(fraction);
    this.start = performance.now() - this.elapsed;
    this.draw(this.elapsed);
  }
  togglePause() {
    if (!this.active) return;
    this.paused = !this.paused;
    cancelAnimationFrame(this.frame);
    if (!this.paused) {
      this.start = performance.now() - this.elapsed;
      this.schedule();
    }
  }
  finish() {
    if (!this.active) return;
    cancelAnimationFrame(this.frame);
    this.active = false;
    this.paused = false;
    this.draw(this.duration);
    this.done();
  }
  cancel() {
    this.generation++;
    cancelAnimationFrame(this.frame);
    this.active = false;
    this.paused = false;
  }
}
