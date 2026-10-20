# MagicalBook — template polish v4

This incremental round preserves the existing book scene, timeline, illustrated
assets, burn simulation and content compiler. No Calculus I content was added.

## Fixed behavior

- Navigation resolves cover-map, slide-map, node-map and graph-map intent before
  choosing a transition. Cover/ordinary content still complete physical travel
  before map inscription. Home immediately initiates the shared closing sequence.
- Back, Escape and last Next from node content burn through to the **same cached
  graph DOM**, retain its progressive state and gently restore the saved camera.
  Mini-map inside a node restores this graph then reveals the remaining network.
  Neither return uses page flips. Graph Next/Back, orientation changes and
  graph-page Mini-map also avoid book/page flips.
- Source-first framing and eased travel include the complete parallel branch
  group and real connector bounds. Camera travel reaches that composition before
  target construction begins. Fit remains visible-only until completion or an
  explicit full-map request; scripted camera input locks release after reveal.
- Active, visited and intentionally visible upcoming nodes/edges have restrained,
  distinct ink/gold states. Optional authored compact labels and close-up notes
  support hysteretic overview/mid/close detail without changing seal geometry.
  Title compensation preserves an 18 CSS-pixel minimum under graph-local zoom.
  Dense overview title selection avoids collisions while keeping every node body.
- Everyday erase/reveal fronts overlap, node visits/returns are brisker and page
  travel is shorter. Incoming graph focus is prepared behind the physical page,
  removing the empty focus pause after arrival. Opening, closing, recap and burn
  material are preserved. One timeline coordinates node restore-and-expand;
  interruption cleanup leaves one live scene and graph.

## Changed files

| Files | Change |
| --- | --- |
| `src/engine/graph-navigation.ts` (new), `presentation.ts` | Contextual routing, cached return/expansion, camera restoration, no-flip graph transitions, pacing and interruption lifecycle |
| `src/engine/types.ts` | Optional graph `shortLabel`, `note`, `role` content metadata |
| `src/components/route-graph.ts`, `graph-camera.ts` | Actual branch bounds, arrival framing, source priming, saved return poses and detail updates |
| `src/components/graph-layout.ts` | Measured seal spacing, compact sibling lanes and aspect-balanced dense layouts |
| `src/components/graph-detail.ts` (new), `graph-node.ts` | Hierarchy, hysteretic detail, readable ink compensation, collision-aware overview labels and optional notes |
| `src/styles/diagrams.css` | Theme states, compact/full/detail labels and scale-aware strokes |
| `src/content/scale-check/{deck.ts,graph.ts,nodes/content.ts}` (new) | Generic 37-node content-only QA presentation |
| `tests/polish-v4.spec.ts` (new) | Five navigation, camera, detail and pacing acceptance scenarios with frame captures |
| `tests/polish-v2.spec.ts`, `tests/showcase.spec.ts` | Expectations updated for faster page arrival and the v4 no-flip node-map rule |
| `README.md`, `CONTENT_AUTHORING.md`, `docs/QA.md`, this report, `docs/qa/v4-*.png` | Current authoring contract, verification and evidence |

No `src/effects/*` implementation or illustration assets were changed in v4.

## Production and browser verification

`npm run build` passed strict TypeScript checking and Vite production bundling.
The final production-preview run passed **all 32 tests in 3.3 minutes** in real
Chromium. The full showcase and v2/v3/v4 milestone tests check browser console
warnings/errors and page exceptions; none were reported.

Verified node roundtrips with Back/Escape/Next, exact saved camera and DOM
identity, hidden-future preservation, node Mini-map restore/expansion, progressive
Next/Back in both orientations, source/single/parallel framing at intermediate
times, visible/full Fit, 37-node readability, semantic-zoom hysteresis, stable
seal geometry, active/visited/upcoming hierarchy, overlapping ink, page-arrival
gating, rapid navigation, direct Home, closing and consistent reopening.

Regression coverage includes physical opening/closing continuity and replay,
1/2/3-origin paper fires, path-arrival-before-node ordering, reverse growth,
mouse drag/wheel, native Chromium touch-emulated pan and two-finger pinch,
drag-click suppression, reduced motion, offline navigation after loading,
formula rendering, graph-free content and content validation.

Representative actual-browser frames were captured and visually inspected:

| Scenario | Evidence in `docs/qa/` |
| --- | --- |
| Node return midway, without leaves | `v4-return-back.png`, `v4-return-escape.png`, `v4-return-next.png` |
| Node Mini-map restoration then expansion | `v4-node-map-return.png`, `v4-node-map-expand.png` |
| Single/parallel focus, travel and inscription | `v4-single-{20,50,70,85,100}.png`, `v4-parallel-{20,50,70,85,100}.png` |
| Dense overview and stable detail | `v4-overview-37.png`, `v4-detail-mid.png`, `v4-detail-close.png`, `v4-hierarchy.png` |
| Everyday overlap and gated page arrival | `v4-overlap.png`, `v4-page-before-arrival.png`, `v4-page-after-arrival.png` |
| Preserved physical book journey/material | `next-opening-*.png`, `next-closing-*.png`, `v3-paper-*.png` |

Reproduce with `npm run build` then `npm test`. Add `&rehearsal` for the existing
seekable timeline interface. Tests sample animation frames, not just endpoints.

## Content-only authoring

Copy `src/content/sample/` (small graph), `plain/` (graph-free) or `showcase/`
(complete example) into a new folder. Edit only that folder's deck metadata,
chapters, nodes, connections, optional demos and recap; choose
`secondActEnding: { enabled: true | false }`. Open `?deck=<folder>` and rebuild
for static deployment. Discovery is automatic. No engine registry, camera
configuration or per-scene effect settings are required. Optional graph detail
metadata is documented in [CONTENT_AUTHORING.md](../CONTENT_AUTHORING.md).

## Remaining limitations

- Dense overviews selectively omit colliding **titles**, never nodes. Hover,
  keyboard focus, tooltips and pan/zoom expose full meaning. One projected page
  cannot display arbitrarily many complete titles at readable size. Dense edges
  may still cross; authored position overrides require author collision checks.
- Automated touch testing uses Chromium's native touch emulation. Physical
  tablets, Safari/Firefox and low-end/projector hardware have not been verified.
  Manual close zoom can intentionally crop distant nodes; Fit restores scope.
- The book is CSS 2.5D and combustion is illustrated 2D. Manuscript font fallbacks
  vary by system. Captures are visual evidence, not cross-platform pixel goldens.
- Existing authoring limits remain: synchronous DOM/SVG demos, no automatic text
  pagination or visual editor, in-memory state, and no hosted offline reload
  service worker. Content changes require a rebuilt static deployment.
- No deployment or push was performed; Git is not initialized in this workspace.
