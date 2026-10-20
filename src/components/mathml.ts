import type { BlockRenderer } from '../engine/types';

/** Optional, network-free adapter. Decks author a small expression tree rather
 * than HTML; ordinary decks never need a specialist math dependency. */
export interface MathNode {
  tag: 'mrow' | 'mi' | 'mn' | 'mo' | 'mtext' | 'mfrac' | 'msqrt' | 'msup' | 'msub' | 'msubsup' | 'munder' | 'mover' | 'munderover' | 'mtable' | 'mtr' | 'mtd';
  text?: string;
  children?: MathNode[];
}
const allowed = new Set(['mrow', 'mi', 'mn', 'mo', 'mtext', 'mfrac', 'msqrt', 'msup', 'msub', 'msubsup', 'munder', 'mover', 'munderover', 'mtable', 'mtr', 'mtd']);
export const mathml: BlockRenderer = block => {
  const wrapper = document.createElement('div'); wrapper.className = 'block-math';
  const namespace = 'http://www.w3.org/1998/Math/MathML';
  const math = document.createElementNS(namespace, 'math'); math.setAttribute('display', 'block');
  if (block.alt) math.setAttribute('aria-label', block.alt);
  const build = (node: MathNode): Element => {
    if (!allowed.has(node.tag)) throw new Error(`Unsupported MathML element: ${node.tag}`);
    const element = document.createElementNS(namespace, node.tag);
    if (node.text) element.textContent = node.text;
    node.children?.forEach(child => element.append(build(child)));
    return element;
  };
  try {
    math.append(build(block.data?.expression as unknown as MathNode));
    wrapper.append(math);
  } catch {
    wrapper.textContent = block.text ?? block.alt ?? 'Mathematical expression unavailable.';
  }
  return wrapper;
};
