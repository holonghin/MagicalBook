import type { RouteGraph } from '../engine/types';

/** Collapse strongly connected components before ranking cyclic graphs. */
export function graphRanks(graph: RouteGraph): Map<string, number> {
  let serial = 0;
  const index = new Map<string, number>(), low = new Map<string, number>(), stack: string[] = [], on = new Set<string>(), groups: string[][] = [];
  function visit(id: string) {
    index.set(id, serial); low.set(id, serial++); stack.push(id); on.add(id);
    for (const edge of graph.edges.filter(e => e.from === id)) {
      if (!index.has(edge.to)) { visit(edge.to); low.set(id, Math.min(low.get(id)!, low.get(edge.to)!)); }
      else if (on.has(edge.to)) low.set(id, Math.min(low.get(id)!, index.get(edge.to)!));
    }
    if (low.get(id) === index.get(id)) {
      const group: string[] = []; let member: string;
      do { member = stack.pop()!; on.delete(member); group.push(member); } while (member !== id);
      groups.push(group);
    }
  }
  graph.nodes.forEach(n => { if (!index.has(n.id)) visit(n.id); });
  const component = new Map<string, number>(); groups.forEach((g, i) => g.forEach(id => component.set(id, i)));
  const depth = new Map<number, number>();
  function rank(i: number): number {
    if (depth.has(i)) return depth.get(i)!;
    const parents = graph.edges.filter(e => component.get(e.to) === i && component.get(e.from) !== i).map(e => component.get(e.from)!);
    const value = parents.length ? 1 + Math.max(...parents.map(rank)) : 0;
    depth.set(i, value); return value;
  }
  return new Map(graph.nodes.map(n => [n.id, rank(component.get(n.id)!)]));
}

export function layoutGraph(graph: RouteGraph, axis: 'horizontal' | 'vertical', width: number, height: number, nodeSize = { width: 210, height: 72 }) {
  const ranks = graphRanks(graph), columns = Math.max(0, ...ranks.values()) + 1;
  const groups = Array.from({ length: columns }, (_, i) => graph.nodes.filter(n => ranks.get(n.id) === i));
  const lanes = Math.max(1, ...groups.map(g => g.length));
  const laneWidth = Math.max(220, nodeSize.width + 26), laneHeight = Math.max(105, nodeSize.height + 26);
  let w = Math.max(width, axis === 'horizontal' ? columns * Math.max(245, nodeSize.width + 40) + 120 : lanes * laneWidth + 100);
  let h = Math.max(height, axis === 'vertical' ? columns * Math.max(125, nodeSize.height + 40) + 110 : lanes * laneHeight + 100);
  // Dense fan-outs should use the page's width as well as its height. Otherwise
  // the complete map collapses into a narrow strip despite unused parchment.
  const aspect = Math.max(.5, Math.min(3, width / Math.max(1, height)));
  if (w / h < aspect * .72) w = h * aspect * .72;
  if (w / h > aspect / .72) h = w / aspect * .72;
  const points = new Map<string, { x: number; y: number }>();
  groups.forEach((group, rank) => group.forEach((node, lane) => {
    const primary = .10 + .80 * (columns === 1 ? .5 : rank / (columns - 1));
    // A future crowded rank must not spread the first two roots far apart.
    const laneOffset = lane - (group.length - 1) / 2;
    points.set(node.id, {
      x: node.x !== undefined ? w * node.x / 100 : axis === 'horizontal' ? w * primary : w / 2 + laneOffset * laneWidth,
      y: node.y !== undefined ? h * node.y / 100 : axis === 'horizontal' ? h / 2 + laneOffset * laneHeight : h * primary,
    });
  }));
  return { width: w, height: h, points };
}
