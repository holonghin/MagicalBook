/** Isolated, reversible instructional beats. Cloned outgoing pages have no controller. */
export interface DemoSequence {
  step: number;
  readonly maxStep: number;
  targets: HTMLElement[];
  setStep(step: number): void;
  request(step: number): void;
  transition?: (from: number, to: number, progress: number) => void;
  duration?: number;
  /** Typeset new annotations at the settled camera pose before inscribing. */
  revealAfterMotion?: boolean;
  labels?: readonly string[];
  /** Optional content-owned state handoff between a coherent pair of lessons. */
  continuity?: { key: string; capture(): unknown; restore(state: unknown): void; reset?(): void; revealTargets?(): HTMLElement[] };
}
const sequences = new WeakMap<Element, DemoSequence>();
export const getDemoSequence = (element: Element) => sequences.get(element);
export function sceneSequences(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>('[data-demo-sequence]')].map(el => sequences.get(el)).filter((s): s is DemoSequence => !!s);
}
export function demoSequence(element: HTMLElement, maxStep: number, render: (step: number, previous: number) => HTMLElement[] | void): DemoSequence {
  element.dataset.demoSequence = 'true';
  const sequence: DemoSequence = {
    step: 0, maxStep, targets: [],
    setStep(step) {
      const previous = sequence.step;
      sequence.step = Math.max(0, Math.min(maxStep, step));
      delete element.dataset.demoExploring;
      sequence.targets = render(sequence.step, previous) ?? [];
      element.dataset.demoStep = String(sequence.step); element.dataset.demoMax = String(maxStep);
      element.dataset.teachingBeat = sequence.labels?.[sequence.step] ?? `Step ${sequence.step + 1}`;
      element.querySelectorAll<HTMLButtonElement>('[data-demo-delta]').forEach(button => {
        const target = sequence.step + Number(button.dataset.demoDelta); button.disabled = target < 0 || target > maxStep;
      });
    },
    request(step) {
      const event = new CustomEvent('demo-step', { bubbles: true, cancelable: true, detail: { step } });
      if (element.dispatchEvent(event)) sequence.setStep(step);
    },
  };
  sequences.set(element, sequence); return sequence;
}
