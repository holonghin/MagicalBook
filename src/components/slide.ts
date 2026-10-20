import type { BlockRenderer, ContentBlock, RenderContext, Slide } from '../engine/types';
import katex from 'katex';

export class RendererRegistry {
  private renderers = new Map<string, BlockRenderer>();
  register(id: string, renderer: BlockRenderer) { this.renderers.set(id, renderer); return this; }
  render(block: ContentBlock, context: RenderContext): HTMLElement {
    if (block.renderer && this.renderers.has(block.renderer)) return this.renderers.get(block.renderer)!(block, context);
    const tags: Record<string, string> = { title: 'h1', paragraph: 'p', caption: 'p', quotation: 'blockquote', code: 'pre', math: 'div' };
    const element = document.createElement(tags[block.type] ?? 'div');
    element.className = `block-${block.type}`;
    if (block.type === 'math' && block.tex) {
      katex.render(block.tex, element, { displayMode: true, throwOnError: false, trust: false, errorColor: '#793b25' });
    } else if (tags[block.type]) {
      (block.lines ?? [block.text ?? '']).forEach((line, i) => {
        if (i) element.append(document.createElement('br'));
        element.append(document.createTextNode(line));
      });
    } else if (block.type === 'bullets') {
      const list = document.createElement('ul');
      for (const text of block.lines ?? []) {
        const item = document.createElement('li'); item.textContent = text; list.append(item);
      }
      element.append(list);
    } else if (block.type === 'table') {
      const table = document.createElement('table');
      block.rows?.forEach((row, i) => {
        const tr = document.createElement('tr');
        row.forEach(text => { const cell = document.createElement(i === 0 ? 'th' : 'td'); cell.textContent = text; tr.append(cell); });
        table.append(tr);
      });
      element.append(table);
    } else if (block.type === 'image') {
      const image = document.createElement('img'); image.src = block.src ?? ''; image.alt = block.alt ?? ''; element.append(image);
    } else if (block.type === 'comparison') {
      for (const column of block.columns ?? []) {
        const panel = document.createElement('section');
        const title = document.createElement('h2'); title.textContent = column.title;
        const text = document.createElement('p'); text.textContent = column.text;
        panel.append(title, text); element.append(panel);
      }
    } else {
      element.classList.add('renderer-fallback');
      element.textContent = block.text ?? `Illustration unavailable: ${block.renderer ?? block.type}`;
    }
    return element;
  }
}

export interface RenderedScene { element: HTMLElement; slots: HTMLElement[]; slide: Slide; maxBeat: number }

export function renderSlide(slide: Slide, context: RenderContext, registry: RendererRegistry): RenderedScene {
  const page = document.createElement('article');
  page.className = `page layout-${slide.layout}`;
  const graphPage = slide.routeStep !== undefined || slide.blocks.some(b => b.renderer === 'route');
  page.classList.toggle('graph-page', graphPage);
  page.dataset.scene = slide.id;
  page.setAttribute('aria-label', slide.eyebrow);
  const ornament = document.createElement('div'); ornament.className = 'page-ornament'; ornament.textContent = '✧'; ornament.setAttribute('aria-hidden', 'true');
  const header = document.createElement('div'); header.className = 'page-heading';
  const eyebrow = document.createElement('span'); eyebrow.className = 'eyebrow ink-content'; eyebrow.textContent = graphPage ? slide.blocks.find(b => b.type === 'title')?.text ?? slide.eyebrow : slide.eyebrow;
  header.append(eyebrow);
  const content = document.createElement('div'); content.className = 'page-content';
  const slots: HTMLElement[] = [header]; header.dataset.beat = '0';
  for (const block of slide.blocks) {
    if (graphPage && block.type === 'title') continue;
    const slot = document.createElement('div');
    slot.className = `ink-slot slot-${block.type}`;
    slot.dataset.block = block.id; slot.dataset.beat = String(block.beat ?? 0);
    slot.dataset.reveal = String(block.reveal !== false);
    const body = registry.render(block, context); body.classList.add('ink-content');
    slot.append(body); content.append(slot); slots.push(slot);
  }
  const foot = document.createElement('div'); foot.className = 'page-foot';
  const label = document.createElement('span'); label.textContent = context.deck.config.coverTitle;
  const mark = document.createElement('span'); mark.textContent = '✦';
  foot.append(label, mark);
  page.append(ornament, header, content, foot);
  return { element: page, slots, slide, maxBeat: Math.max(0, ...slide.blocks.map(b => b.beat ?? 0)) };
}
