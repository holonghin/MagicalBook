/** Graph destination alone is not enough to choose its transition. */
export type MapIntent = 'cover-map' | 'slide-map' | 'node-map' | 'graph-map';
export function mapIntent(context: { closed: boolean; inNode: boolean; inGraph: boolean }): MapIntent {
  if (context.closed) return 'cover-map';
  if (context.inNode) return 'node-map';
  return context.inGraph ? 'graph-map' : 'slide-map';
}
