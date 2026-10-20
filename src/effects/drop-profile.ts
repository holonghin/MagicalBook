import { random } from './random';

/** One bounded motion sample per invocation. No per-frame randomness. */
export interface DropProfile {
  seed: number; durationScale: number; offset: number; drift: number; rotation: number;
  pitch: number; yaw: number; phase: number; flutter: number; frequency: number;
  weight: number; settle: number; corner: number;
}
export function sampleDropProfile(seed: number): DropProfile {
  const rng = random(seed), between = (a: number, b: number) => a + (b - a) * rng();
  return { seed, durationScale: between(.88, 1.12), offset: between(-42, 42), drift: between(-28, 28), rotation: between(-7, 7),
    pitch: between(9, 16), yaw: between(-5, 5), phase: between(0, Math.PI * 2), flutter: between(7, 13), frequency: between(1.7, 2.3),
    weight: between(1.12, 1.18), settle: between(-.65, .65), corner: between(.12, .24) };
}
export const defaultDropProfile = sampleDropProfile(1);
