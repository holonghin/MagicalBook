import type { GraphPoint } from './graph-camera';

type Trace = { path: SVGPathElement; heat: SVGPathElement; scorch: SVGPathElement; length: number };
export function samplePaths(edges: Map<string, Trace>) {
  return new Map([...edges].map(([id, edge]) => [id, Array.from({ length: 65 }, (_, i) => {
    const p = edge.path.getPointAtLength(edge.length * i / 64); return { x: p.x, y: p.y };
  })]));
}
/** Precompute a short arc along the actual seal perimeter. Endpoints stay on
 * paper throughout layout reflow, including connectors routed through gutters. */
function anchorArc(node: HTMLElement, from: GraphPoint, to: GraphPoint) {
  const border = node.querySelector<SVGPathElement>('.node-outline')!, length = border.getTotalLength();
  const nearest = (point: GraphPoint) => {
    const gap = (at: number) => { const p = border.getPointAtLength((at + length) % length); return Math.hypot((p.x / 200 - .5) * node.offsetWidth - point.x, (p.y / 78 - .5) * node.offsetHeight - point.y); };
    let at = 0, distance = Infinity;
    for (let i = 0; i < 128; i++) { const d = gap(length * i / 128); if (d < distance) { distance = d; at = length * i / 128; } }
    let lo = at - length / 128, hi = at + length / 128;
    for (let i = 0; i < 16; i++) { const a = (2 * lo + hi) / 3, b = (lo + 2 * hi) / 3; if (gap(a) < gap(b)) hi = b; else lo = a; }
    return (lo + hi) / 2;
  };
  const start = nearest(from), end = nearest(to);
  let delta = end - start; if (delta > length / 2) delta -= length; if (delta < -length / 2) delta += length;
  return (p: number) => { const point = border.getPointAtLength((start + delta * p + length) % length); return { x: (point.x / 200 - .5) * node.offsetWidth, y: (point.y / 78 - .5) * node.offsetHeight }; };
}
export function reflowPaths(edges: Map<string, Trace>, nodes: Map<string, HTMLButtonElement>, links: { id: string; from: string; to: string }[], fromPoints: Map<string, GraphPoint>, toPoints: Map<string, GraphPoint>, fromPaths: Map<string, GraphPoint[]>) {
  const toPaths = samplePaths(edges);
  const arcs = new Map(links.map(link => {
    const a = fromPaths.get(link.id)!, b = toPaths.get(link.id)!;
    const offset = (point: GraphPoint, center: GraphPoint) => ({ x: point.x - center.x, y: point.y - center.y });
    return [link.id, [anchorArc(nodes.get(link.from)!, offset(a[0], fromPoints.get(link.from)!), offset(b[0], toPoints.get(link.from)!)),
      anchorArc(nodes.get(link.to)!, offset(a[64], fromPoints.get(link.to)!), offset(b[64], toPoints.get(link.to)!))]];
  }));
  return (p: number, points: Map<string, GraphPoint>) => {
    for (const link of links) {
      const a = fromPaths.get(link.id)!, b = toPaths.get(link.id)!, edge = edges.get(link.id)!;
      const line = b.map((end, i) => ({ x: a[i].x + (end.x - a[i].x) * p, y: a[i].y + (end.y - a[i].y) * p }));
      const attachments = arcs.get(link.id)!;
      for (const [index, id, arc] of [[0, link.from, attachments[0]], [64, link.to, attachments[1]]] as const) { const center = points.get(id)!, offset = arc(p); line[index] = { x: center.x + offset.x, y: center.y + offset.y }; }
      const d = line.map((point, i) => `${i ? 'L' : 'M'}${point.x} ${point.y}`).join(' ');
      edge.path.setAttribute('d', d); edge.heat.setAttribute('d', d); edge.scorch.setAttribute('d', d);
      edge.length = edge.path.getTotalLength() || 1;
      edge.path.style.strokeDasharray = String(edge.length); edge.path.style.strokeDashoffset = '0';
    }
  };
}
