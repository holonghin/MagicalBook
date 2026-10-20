# Graph entrance and full-map reveal fix v2

Later amendment: a [physical reverse paper lift](FALLING_PAPER.md) now exposes its
retained, already printed map without re-inscription. This exception belongs to
the falling-paper transition; normal graph entrances, full-map burn timing and
Mini-map behavior documented below are retained.

## Cause and fix

An ordinary-page return staged the persistent graph at its logical progress step.
The next reveal then treated every retained mark as already settled. A node
return explicitly skipped graph reveal preparation, and the legacy saved-map
parchment handoff only changed page opacity. These paths could therefore display
finished nodes without the original inscription.

Entrance staging now hides renderer marks before mounting the reused viewport.
The existing source/path/seal/title reveal then runs for the destination's visible
set. Logical graph progress, identity, authored orientation and visited nodes
remain separate. Node returns retain the saved camera and selection. Legacy saved
map handoffs burn after the departing parchment, rather than fading in a finished
map. A floating-point completion error found in vertical returns is also fixed:
final nodes/paths settle exactly to their target set, so no visually complete
node remains inert at a progress value infinitesimally below one.
Graph-to-graph teaching remains incremental; Mini-map on an existing graph
continues only the remaining network, in place.

## Full-map timing

`src/effects/graph-reveal-timing.ts` defines `MAX_FULL_GRAPH_REVEAL_MS = 2300` and
the coordinated 350 ms handoff. Cost is estimated from the actual source focus,
path lengths, node arrivals and optional orientation reflow. Short maps run the
regular sequence in full. Longer overviews use a 2200 ms nominal timeline, leaving
100 ms of rendering headroom below the 2300 ms target. They retain the ordinary
burn clock for the first 1850 ms, then finish remaining routes and organic seals together with
subdued embers and a light label-ink settle. No finished graph is exposed first.

Only full previews, final overviews and entrances to already-complete graph pages
use this budget. An ordinary final teaching step is still uncapped. The selected
tempo cannot stretch a full overview beyond the cap. Cover/page travel is a
separate interval and keeps its existing duration. Focus is prepared behind the
arriving page; the graph inscription starts once travel finishes. Home and skip
still use the existing coordinated timeline, with no delayed timers to leak.

The same effects are reused. Static burn contours are calculated once per
playback, unchanged masks skip redundant work, full-map bounds are cached until
geometry changes, and label measurements are batched before visibility writes.
Dense-map fallback labels do not run dozens of simultaneous expensive glow masks.
While a bounded overview zooms, the world is painted through its clipped viewport
instead of requesting a giant promoted raster at the source-node magnification.

## Changed files

- `src/engine/presentation.ts`: entrance staging, content/node/saved-map return,
  timing integration and physical-arrival gating.
- `src/components/route-graph.ts`: overview-only scheduling, shared burn handoff,
  stable bounds and renderer-only entrance state.
- `src/effects/graph-reveal-timing.ts`: centralized budget and handoff constants.
- `src/effects/magical-reveal.ts`: cached fronts, unchanged-progress fast path,
  coordinated fallback ink; ordinary burn geometry is retained.
- `src/components/graph-detail.ts`: batched overview-label measurements.
- `src/styles/diagrams.css`: bounded-overview compositing safeguard.
- `src/content/scale-check/deck.ts`: a generic introductory page to test a large
  map from an ordinary slide as well as the cover and an existing graph.
- `tests/graph-reveal.spec.ts`: repeated/vertical/full entrances, real RAF timing,
  small-map sequencing, 37-node frames, cap isolation, slow tempo, reduced motion,
  seeking, interruption, slow recap return and legacy handoff coverage.
- `tests/polish-v3.spec.ts`: sample route propagation at the appropriate point in
  the new bounded overview clock, after reflow/focus and before final handoff.
- `README.md`, `CONTENT_AUTHORING.md`, `docs/QA.md`, this report and
  `docs/qa/graph-*.png`: current behavior and browser evidence.

## Validation

`npm run build` passes strict TypeScript and Vite production compilation.

The complete **55-test Chromium suite passed in 6.7 minutes**. The last change
corrected the half-speed recap-lift clock and added its regression. On that final
production build, **all 23 affected graph, reversible-transition and complete
showcase tests passed in 3.0 minutes**. The complementary 33 book/cover, material,
native-touch, orientation and navigation tests passed in the preceding full run.
All 56 distinct current cases are covered across these runs. Console-checked
scenarios reported no browser warnings/errors or uncaught page exceptions.

Real RAF measurements on the final build (37 nodes / 36 edges, no screenshots or
seeking during the measured playback):

| Entrance | Physical travel | Inscription timeline | Measured post-travel completion |
| --- | ---: | ---: | ---: |
| Cover | 2550 ms | 2200 ms | 2216.5 ms |
| Ordinary slide | 700 ms | 2200 ms | 2266.0 ms |
| Existing progressive graph | none | 2200 ms | 2213.4 ms |

The two-node sample retained regular burning with no timeout handoff; its target
remained hidden until its incoming route arrived. Tests also verified four
ordinary entrances, three vertical node returns, three full-preview entrances,
three completed teaching-map returns, preserved preview/progression separation,
remaining-only Mini-map expansion, no duplicate viewport, uncapped teaching,
half-speed overviews and recap returns, reduced motion, rewind/skip/Home cleanup,
node clicks and the existing native touch/mouse navigation checks.

Representative frames: `docs/qa/graph-reentry-*.png`, `graph-small-*.png`,
`graph-large-{cover,slide,graph}-*.png`, `graph-full-reentry-*.png` and
`graph-legacy-handoff.png`. These include partial scorch/path/seal, the coordinated
final handoff and the crisp finished graph. Pre-arrival visibility is asserted
separately and covered by the existing physical-book and page-arrival captures.

## Limits

Browser measurements are subject to RAF scheduling and machine load; the engine
timeline is capped, rather than promising identical wall-clock frame delivery on
every device. Physical tablets, Firefox/Safari and low-end projector hardware are
not validated here. Dense-map painting still produced occasional 83–133 ms frame
intervals in headless Chromium (the measured JavaScript draw peaks were 23–24 ms);
this is not a promise of 60 fps on all hardware. At a dense overview, label selection remains governed by the
existing readable-detail system; zoom/pan exposes every label. No Calculus I deck,
new author effect configuration or template redesign was introduced.
