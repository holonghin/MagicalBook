import type { RouteGraph } from '../engine/types';
import type { GraphCamera } from './graph-camera';
import type { GraphState } from '../engine/graph-state';

type DetailLevel = 'overview' | 'mid' | 'close';
/** Scale-independent readable ink, with stable geometry and hysteretic detail.
 * At dense overview scales label selection favors the current branch and roots;
 * every node retains its full accessible title and can be inspected on hover. */
export class GraphDetail {
  private level: DetailLevel = 'mid';
  private focused = new Set<string>();
  private get visited() { return this.state.visited; }
  private get selected() { return this.state.activeNode; }
  private hovered?: string;
  private major = new Set<string>();
  constructor(private root: HTMLElement, private nodes: Map<string, HTMLButtonElement>, graph: RouteGraph, private camera: GraphCamera, private state: GraphState) {
    graph.nodes.forEach(node => {
      if (node.role === 'branch' || !graph.edges.some(e => e.to === node.id) || graph.edges.filter(e => e.from === node.id).length > 1) this.major.add(node.id);
      const button = nodes.get(node.id)!;
      button.addEventListener('pointerenter', () => { this.hovered = node.id; this.render(); });
      button.addEventListener('pointerleave', () => { this.hovered = undefined; this.render(); });
      button.addEventListener('focus', () => { this.hovered = node.id; this.render(); });
      button.addEventListener('blur', () => { this.hovered = undefined; this.render(); });
    });
  }
  focus(ids: Set<string>) { if (!this.state.miniMapPreview) this.state.activeNode = undefined; this.focused = ids; }
  select(id: string) { this.state.activeNode = id; this.render(); }
  visits(_visited: Set<string>) { this.render(); }
  render() {
    const scale = Math.max(.001, this.camera.pose.scale);
    if (this.level === 'overview' && scale > .82) this.level = 'mid';
    else if (this.level === 'close' && scale < 1.15) this.level = 'mid';
    if (this.level === 'mid') { if (scale < .70) this.level = 'overview'; else if (scale > 1.3) this.level = 'close'; }
    this.root.dataset.lod = this.level;
    this.root.style.setProperty('--graph-label-scale', String(Math.max(1, 18 / (22 * scale))));
    this.root.style.setProperty('--graph-stroke-scale', String(1 / scale));
    const priority = (id: string) => (id === this.hovered ? 1000 : 0) + (id === this.selected || !this.selected && this.focused.has(id) ? 100 : 0) + (this.major.has(id) ? 40 : 0) + (this.visited.has(id) ? 20 : 0);
    for (const [id, button] of this.nodes) {
      const title = button.querySelector<HTMLElement>('.node-title')!;
      const text = (this.level === 'overview' ? button.dataset.shortLabel : button.dataset.fullLabel)!;
      if (title.textContent !== text) title.textContent = text;
      const active = this.selected ? id === this.selected : this.focused.has(id);
      button.dataset.nodeState = active ? 'active' : this.visited.has(id) ? 'visited' : 'upcoming';
      button.classList.toggle('is-major', this.major.has(id));
      button.classList.toggle('visited', this.visited.has(id));
      if (active) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
      button.dataset.labelVisible = 'true';
    }
    if (this.level !== 'overview' || !this.root.isConnected) return;
    const occupied: DOMRect[] = [];
    const visible = [...this.nodes].filter(([, button]) => button.style.visibility !== 'hidden').sort(([a], [b]) => priority(b) - priority(a));
    // Read all labels together before applying visibility. Interleaving these
    // reads/writes forces a fresh layout per seal during a dense-map reveal.
    const measured = visible.map(([, button]) => ({ button, box: button.querySelector<HTMLElement>('.node-compact')!.getBoundingClientRect() }));
    for (const { button, box } of measured) {
      const collision = occupied.some(other => box.left < other.right + 8 && box.right + 8 > other.left && box.top < other.bottom + 6 && box.bottom + 6 > other.top);
      button.dataset.labelVisible = String(!collision);
      if (!collision) occupied.push(box);
    }
  }
}
