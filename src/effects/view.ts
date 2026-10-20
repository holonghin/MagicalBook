import type { Slide } from '../engine/types';

/** A content-owned focus view. A later ordinary scene restores the full frame. */
export function focusView(page: HTMLElement, focus?: Slide['focus']) {
  const content = page.querySelector<HTMLElement>('.page-content')!;
  content.style.transform = '';
  if (!focus) return;
  const slot = [...page.querySelectorAll<HTMLElement>('[data-block]')].find(slot => slot.dataset.block === focus.blockId);
  if (!slot) return;
  const frame = content.getBoundingClientRect(), target = slot.getBoundingClientRect();
  const scale = Math.max(.5, Math.min(3, focus.scale));
  const dx = (frame.left + frame.width / 2 - target.left - target.width / 2) * scale;
  const dy = (frame.top + frame.height / 2 - target.top - target.height / 2) * scale;
  content.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
}
