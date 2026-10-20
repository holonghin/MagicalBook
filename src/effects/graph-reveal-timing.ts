/** Full-map inscription only. Physical book/page travel and teaching are separate. */
export const MAX_FULL_GRAPH_REVEAL_MS = 2300;
export const FULL_GRAPH_HANDOFF_MS = 350;
// Leave one modest rendering interval below the wall-clock target. Dense maps
// can deliver their final RAF late even when the shared timeline is on budget.
const FRAME_HEADROOM_MS = 100;
export const fullGraphRevealDuration = (natural: number, tempo = 1) => {
  const requested = natural / tempo;
  return requested > MAX_FULL_GRAPH_REVEAL_MS ? MAX_FULL_GRAPH_REVEAL_MS - FRAME_HEADROOM_MS : requested;
};
