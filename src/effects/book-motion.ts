import { clamp, ease } from './timeline';
import type { DeckConfig, DropOptions } from '../engine/types';
import { defaultDropProfile, type DropProfile } from './drop-profile';

export function cameraPose(book: HTMLElement, progress: number, config: DeckConfig['camera'] = {}) {
  const p = clamp(progress);
  const start = Math.max(.4, Math.min(.85, config.closedScale ?? .72));
  const end = Math.max(1, Math.min(1.15, config.contentScale ?? 1.025));
  const scale = start + (end - start) * ease(p);
  // Recenter on the spread early enough to show both outer edges before the
  // approach fills the screen. The same camera curve is traversed on exit.
  // Pull the *entire* spread back inside the frame early in the sequence.
  // Waiting until the cover is halfway folded makes its free edge leave the
  // viewport during closing, so the cover seems to appear only at the end.
  const center = ease(clamp(p * 7.2));
  book.style.transform = `scale(${scale}) translateX(calc(var(--cover-width) * ${-(1 - center) / 2})) rotateX(${(1 - p) * 5}deg) rotateZ(${(1 - p) * -1.5}deg)`;
  book.style.setProperty('--outline-opacity', String(1 - p));
  book.style.setProperty('--fold-opacity', String(.45 * clamp((1 - p) / .7)));
  book.dataset.cameraProgress = p.toFixed(3);
}

export function coverPose(cover: HTMLElement, progress: number) {
  const p = ease(clamp(progress));
  cover.style.transform = `rotateY(${-180 * p}deg)`;
  // The cover is genuinely two-sided. A front inscription must NEVER be
  // visible through the back of the cover when it passes edge-on. Opacity is
  // symmetrical for opening and closing because both seek this same pose.
  const front = 1 - ease(clamp((p - .37) / .12));
  cover.style.setProperty('--cover-front-visibility', String(front));
  // The fully open cover lies flat under the book; fade only at the endpoint.
  cover.style.opacity = String(1 - ease(clamp((p - .91) / .09)));
  cover.dataset.openProgress = clamp(progress).toFixed(3);
}

/** One spine at x=50%. The opened half of the binding follows the cover's
 * projected edge; there is no full-screen sheet behind a narrower cover. */
export function bindingPose(book: HTMLElement, cover: HTMLElement, progress: number) {
  const p = clamp(progress);
  coverPose(cover, p);
  const edge = Math.min(50, 50 + 50 * Math.cos(Math.PI * ease(p)));
  book.style.setProperty('--binding-left', `${edge}%`);
  // Keep a consistent stacking plane through the hinge motion; never jump
  // from behind the book to in front of it at a single animation frame.
  cover.style.zIndex = '20';
}

/** Ceremonial leaves all travel around the SAME center hinge.
 * During opening, a leaf goes from the right-hand stack to the left.
 * Closing is exactly the reverse of that motion: -180deg -> 0deg.
 * Never manufacture a page at -90deg mid-flight (that used to produce
 * upright white cards abruptly sticking out of the spine).
 */
export function leafPose(leaf: HTMLElement, progress: number, covering = false) {
  const p = ease(clamp(progress));
  const angle = covering ? -180 * (1 - p) : -180 * p;
  leaf.style.transformOrigin = 'left center';
  leaf.style.transform = `rotateY(${angle}deg)`;
  // Soft apparition/landing is only a few degrees at either end. Without
  // it a flat rectangular sheet pops into existence at the spine.
  const edge = Math.min(1, p / .09, (1 - p) / .09);
  leaf.style.opacity = String(Math.max(0, Math.min(1, edge)));
  leaf.style.setProperty('--curl-angle', `${Math.sin(p * Math.PI) * 11}deg`);
  leaf.dataset.turnProgress = clamp(progress).toFixed(3);
  leaf.style.setProperty('--turn-shade', String(Math.sin(p * Math.PI) * .24));
}

export function turnPose(leaf: HTMLElement, progress: number, direction: number) {
  const p = ease(clamp(progress));
  leaf.style.transformOrigin = direction > 0 ? 'left center' : 'right center';
  leaf.style.transform = `rotateY(${-direction * p * 175}deg)`;
  leaf.style.opacity = String(1 - clamp((p - .8) / .2));
  leaf.style.setProperty('--turn-shade', String(Math.sin(p * Math.PI) * .35));
}
export function dropTiming(options: DropOptions, defaultDuration: number, profile?: DropProfile) {
  const duration = Math.max(200, options.duration ?? defaultDuration) * (profile?.durationScale ?? 1);
  const start = Math.max(.1, Math.min(.9, options.revealStartDropProgress ?? .67));
  const landing = Math.max(.5, Math.min(.95, options.targetRevealAtLanding ?? .85));
  const revealDuration = duration * (1 - start) / landing;
  const end = duration * start + revealDuration;
  return { duration, start, end, revealDuration, total: end + (options.mode === 'transition' ? options.exitDuration ?? 380 : 0) };
}
export function dropPose(sheet: HTMLElement, progress: number, profile: DropProfile = defaultDropProfile, shadow?: HTMLElement) {
  const p = progress >= 1 - 1e-9 ? 1 : clamp(progress);
  const t = clamp(p / profile.contact), settling = clamp((p - profile.contact) / (1 - profile.contact));
  // Gravity with quadratic drag approaches terminal speed; the final air
  // cushion brakes the broad sheet before a small damped contact/settle.
  const gravity = Math.log(Math.cosh(profile.drag * t)) / Math.log(Math.cosh(profile.drag));
  const brake = ease(clamp((t - .52) / .48));
  const descent = gravity * (1 - brake) + ease(gravity) * brake;
  const flutter = Math.sin(t * Math.PI * profile.frequency + profile.phase) * Math.sin(t * Math.PI);
  const gust = flutter * Math.sin(t * Math.PI) * profile.flutter / 950;
  const height = 1 - clamp(descent + gust);
  const settle = Math.sin(settling * Math.PI * 2) * (1 - settling) ** 2;
  const lift = profile.bounce * settle;
  const x = p === 1 ? 0 : profile.offset * height + profile.drift * Math.sin(descent * Math.PI) * Math.sqrt(height) + flutter * profile.flutter * height + settle * profile.settle * 2;
  const rotation = profile.rotation * height + flutter * height * 2 + profile.settle * settle;
  const pitch = height * profile.pitch + flutter * height + settle * .6;
  sheet.style.transform = `translate3d(${x}px,calc(${-120 * height}% - ${lift}px),${height * 140 + Math.max(0, lift) * 1.4}px) rotateX(${pitch}deg) rotateY(${height * profile.yaw + settle * .2}deg) rotateZ(${rotation}deg) scale(${1 + height * .08})`;
  // Only tiny corner variations; the readable paper plane never stretches.
  const corner = profile.corner * Math.sin(p * Math.PI) * Math.sin(profile.phase + p * 5);
  sheet.style.clipPath = p === 1 ? 'none' : `polygon(.1% .2%, 12% 0, 29% ${.3 + corner}%, 51% 0, 78% .2%, 99.8% ${Math.max(0, corner)}%, 100% 33%, ${99.7 + corner}% 65%, 100% 100%, 70% ${99.7 + corner}%, 36% 100%, .1% 99.8%, .3% 70%, 0 42%)`;
  sheet.style.boxShadow = `0 ${3 + 20 * height}px ${5 + 24 * height}px #1b100b55`;
  if (shadow) {
    // A separate shadow plane is essential: the worn-edge clip on the paper
    // would clip an ordinary box-shadow right off its silhouette.
    shadow.style.transform = `translate(${x + height * 20}px,calc(${-120 * height}% + ${4 + height * 30 + lift * .5}px)) rotate(${rotation * .8}deg) scale(${1 + height * .06})`;
    shadow.style.filter = `blur(${4 + height * 24 + Math.abs(lift)}px)`;
    shadow.style.opacity = String(.06 + (1 - height) * .14);
  }
  sheet.dataset.dropProgress = p.toFixed(3);
  sheet.dataset.dropSeed = String(profile.seed);
  sheet.dataset.dropStage = p === 1 ? 'settled' : p >= profile.contact ? 'settling' : 'falling';
}
