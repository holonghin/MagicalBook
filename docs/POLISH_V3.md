# MagicalBook — template polish v3

The existing book scene, illustration assets, content-folder discovery and single
seekable timeline are retained. No Calculus I content was created or changed.

## Implementation

- Graph growth now has two camera beats: an eased close-up of the relevant source
  or existing subgraph, followed by a tracking pan/zoom toward the expanding routes.
  Initial roots receive enlarged framing. After growth, the composition settles
  and mouse/touch navigation unlocks without an automatic full-map reset.
- Fit has explicit **visible** and **full** scopes. Visible bounds include the
  current node bodies and sampled portions of paths already inscribed; hidden
  future geometry does not affect the fit. Completed states and explicit Mini-map
  requests use all nodes and complete paths. Resize keeps the selected scope.
  Bounds have safety padding; manual camera poses survive node content visits.
- Connectors intersect the actual painted SVG seal outline at cardinal anchors,
  including gutter links. SVG ink, scorch trail and ember all use that same path.
  Zero-progress paths are hidden to avoid stray dots from round dash caps.
- Graph pages use only a small upper-left manuscript label. Large title blocks
  are suppressed centrally, including in compatibility decks.
- Mini-map is contextual: cover → shared opening then whole-map inscription;
  content → page journey then inscription; graph → only the remaining network
  inscribes in place, preserving graph DOM, axis and initial camera pose. Complete
  map Next closes the book. Home remains a direct close.
- Back from a Mini-map shortcut returns to its actual origin. Cover shortcuts
  close; content shortcuts reverse the page journey; graph shortcuts retract
  paths and nodes and zoom toward the source region. Ordinary scene boundaries
  record the forward transition family so Back uses its corresponding family.
  Recap drops reverse into lifting sheets using the same drop-pose function.
- Graph reverse growth evaluates the same arrival schedule backwards: titles,
  paper fill and seals disappear before their paths burn back toward their source.
  Existing earlier nodes remain inscribed. Parallel branches retract together.
  Reverse zoom waits for the remaining path fronts to retreat before moving
  into the source close-up, so it does not outrun the embers.
- Paper combustion has soft layered heat stains, darker fractured char, fine
  protruding fibers, localized flickering flames, larger but bounded ash flakes
  and turbulent falling drift. Ignition delays and local speeds remain seeded.
  Ash starts after its origin ignites. Reveal and erase share more detailed
  irregular ink fronts. Graph paths gain a local scorch trail, flame and three
  finite animated cinders; node fill fronts gain a transient amber edge.
- Settled node seal geometry is cached so unchanged nodes are not reconstructed
  on every animation frame. All motion remains seekable/skippable; no extra
  independent particle animation loops were added.
- Replay of a Mini-map opening retains its destination. New book runs reset the
  final-map orientation to the authored default after contextual vertical views.
  Reduced-motion node
  returns preserve the map camera as well as the ordinary animated return.

## Verification

Production build: `npm run build` (strict TypeScript + Vite) passed.
Final acceptance: **all 27 tests passed in 2.4 minutes** against the production build.

Tests run in actual Chromium against the production preview. The v3 checks cover
visible-only Fit, strong initial framing, source tracking, exact seal attachment
in both axes, simultaneous branches, in-place Mini-map, reverse routes, reverse
page journeys, reverse recap, ordinary reveal/erase, paper material stages,
contextual replay, reduced-motion return and progressive-map mouse dragging.

The existing tests also exercise opening/closing reverse poses, Mini-map from
cover and content, Home/rapid interruption cleanup, pan/wheel anchoring, native
Chromium touch-emulated node drag and two-finger pinch, camera restoration,
formula rendering, offline navigation, graph-free content and responsive bounds.
Showcase/v2/v3 tests fail on browser console warnings/errors and page exceptions.
Node color-environment notices in terminal output are not browser errors.

Existing interrupted-opening and map-retarget assertions sampled moving poses
after browser round-trips. The opening check now pauses the timeline in the
actual Home key event before sampling, and verifies the initial closing pose
without wall-clock timing sensitivity. Retarget checks likewise freeze the first
retargeted pose within its action. The book's physical motion was preserved.

Representative frames were captured and visually inspected, including:

| Scenario | Evidence in `docs/qa/` |
| --- | --- |
| Starting region and source tracking | `v3-initial-fit.png`, `v3-source.png`, `v3-tracking.png` |
| Parallel growth and exact endpoints | `v3-parallel.png`, `v3-anchors-horizontal.png`, `v3-anchors-vertical.png` |
| In-place completion and graph retraction | `v3-map-in-place.png`, `v3-burn-back.png` |
| Reverse physical motion | `v3-reverse-page.png`, `v3-reverse-drop.png` |
| Ink in both directions | `v3-ink-erase.png`, `v3-ink-multiline.png` |
| Paper with one and three origins | `v3-paper-{1,3}-{15,35,60,85}.png`, `v3-paper-reverse-{1,3}.png` |
| Existing book and map travel | `next-opening-*.png`, `next-closing-*.png`, `v2-map-*.png` |

Run `npm run build` then `npm test` to reproduce. Add `&rehearsal` to the showcase
URL for the deterministic `window.grimoire.timeline` seek/skip interface.

## Changed files

- `src/components/graph-camera.ts`: visible/full bounds and closer framing.
- `src/components/route-graph.ts`: two-stage camera, shared seal anchors,
  visible geometry, reverse scheduling, localized flame/cinder treatment.
- `src/components/graph-node.ts`: actual painted anchors, heated fill and cache.
- `src/components/slide.ts`, `src/styles/diagrams.css`: clean graph-page label
  layout and matching ember/material styles.
- `src/engine/presentation.ts`, `src/engine/types.ts`: contextual map shortcut,
  return provenance, paired transition families, shared reversible page journey,
  reverse drops, replay destination and reduced-motion restoration.
- `src/effects/paper-burn.ts`, `src/effects/magical-reveal.ts`: material refinements.
- `tests/polish-v3.spec.ts`: new browser acceptance scenarios and captures.
- `tests/polish-v2.spec.ts`, `tests/book-journey.spec.ts`, `tests/showcase.spec.ts`: updated material limit
  and deterministic first-frame keyboard continuity check.
- `CONTENT_AUTHORING.md`, `README.md`, `docs/QA.md`, this report, `docs/qa/v3-*.png`:
  authoring behavior, current verification and frame evidence.

## Authoring and limits

The content-folder contract is unchanged. Copy `src/content/showcase/` (or the
minimal `sample/` / graph-free `plain/`), edit that folder's metadata, chapters,
nodes, graph/connections and optional demos, build, and select `?deck=<folder>`.
`secondActEnding.enabled` remains the main optional cinematic switch. Authors
configure no camera beats, node anchors or transition families. See
[CONTENT_AUTHORING.md](../CONTENT_AUTHORING.md) for the complete procedure.

- Verified in Chromium, including touch emulation; physical tablet, Safari,
  Firefox and low-end/projector hardware still need device acceptance.
- Cinematic local framing can crop distant older nodes intentionally. Fit returns
  to all currently visible content. Dense graphs can still have crossings or
  small overview labels; pan/zoom remains necessary at scale.
- Combustion is illustrated 2D and the book is CSS 2.5D. Manuscript font fallbacks
  vary by system; screenshots are inspected frames, not portable pixel goldens.
- Custom demos remain synchronous DOM/SVG components; media readiness and concise
  labels are content-author responsibilities. No editor or automatic pagination.
- State is in memory. Offline navigation after loading is supported; no service
  worker enables hosted offline reload. Content-folder changes require rebuilding.
- No push or deployment was performed. Git is not initialized in this workspace.



