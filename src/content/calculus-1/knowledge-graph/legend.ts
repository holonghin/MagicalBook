import type { BlockRenderer } from '../../../engine/types';
import { routeGraph } from '../../../components/route-graph';
import { connections } from './connections';

/** Accessible semantics enrich existing paths; geometry and burning stay shared. */
export const calculusRoute: BlockRenderer = (block, context) => {
  const graph = routeGraph(block, context);
  graph.querySelectorAll<SVGPathElement>('.route-edge').forEach(path => {
    const link = connections.find(c => c.id === path.dataset.edge);
    if (!link || path.querySelector('title')) return;
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    title.textContent = `${link.from} → ${link.to} · ${link.kind}: ${link.meaning}`; path.append(title); path.dataset.connectionKind = link.kind;
  });
  return graph;
};

export const connectionsPanel: BlockRenderer = (_block, context) => {
  const details = document.createElement('details'); details.className = 'calc-connections';
  const summary = document.createElement('summary'); summary.textContent = 'Connections · prerequisite / implication / application / conceptual relation';
  const list = document.createElement('div'); list.className = 'calc-link-list';
  const populate = () => {
    const step = context.slide.routeStep ?? 0; list.replaceChildren();
    connections.filter(c => c.id.startsWith('link-') && c.unlockStep <= step).forEach(c => {
      const p = document.createElement('p'), label = document.createElement('strong'); label.textContent = `${c.from} → ${c.to} · ${c.kind}: `; p.append(label, c.meaning); list.append(p);
    });
    if (!list.children.length) list.textContent = 'Goal branches are questions about a function. Mathematical cross-connections appear as the teaching route earns them.';
  };
  details.addEventListener('toggle', populate); details.append(summary, list); return details;
};
