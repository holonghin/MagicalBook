# MagicalBook — template polish v6

This incremental round keeps the illustrated book, one GraphView, shared timeline,
organic parchment drops and existing reveal/burn simulation. No Calculus I
presentation was added. v6 supersedes v5.1's arbitrary last-view preference.

## Root cause and lifecycle fix

The sequence described for `IMG_7059.mp4` was reproduced in production Chromium:
after a completed vertical Mini-map, Home and a normal restart, the first graph
frame contained **nine visible nodes**, although only the first two belonged
there. The video file itself is not in the workspace, so this verification uses
the specification's sequence and actual-browser frames rather than video analysis.

Previously the renderer's target step wrote directly to the slideshow model.
Mini-map therefore changed slideshow progress to the final threshold. Normal
re-entry reused that completed viewport as the source of an unintended reverse
reveal. A mutable last orientation and per-scene snapshots also let view history
override the authored timeline.

The logical model now owns `progressStep` / `progressCue` and an authored
orientation policy. The single renderer owns its displayed target and geometric
orientation. `miniMapPreview` is an ephemeral presentation mode; preview never
writes slideshow progress. The preview origin stores its scene/beat, selection
and graph camera. Back restores the authored source state and camera. Normal
opening from the cover is an explicit restart at the authored beginning.

Before a cached graph enters ordinary playback, `stage()` initializes its source
visibility and disables future nodes/edges. Restart stages a dormant graph before
mounting it. Cover/ordinary Mini-map entries also start dormant and wait for the
book/page arrival gate before inscription. Fresh graphs establish their first
layout directly; they cannot attempt to interpolate nonexistent SVG paths.
Timeline generations and existing gesture cancellation reject stale frames.

## Three content-only modes

- `fixed-horizontal`: slideshow, final graph and preview stay horizontal.
- `fixed-vertical`: slideshow, final graph and preview stay vertical.
- `timeline`: a required initial direction plus ordered `{ atStep, to }` events
  keyed to authored graph cue IDs. Each cue derives its direction from the latest
  preceding event. Preview uses the final authored direction; restart uses the
  initial authored state. H→V→H and V→H→V are both supported.

Validation rejects unknown modes/orientations, missing initial state, invalid or
unordered/duplicate event references and fixed-mode `initial`/`changes`. Legacy
folders without a policy compile their old layout declarations into one of the
same three modes. New content uses `graph.orientation`; graph entries can declare
stable `id` values separately from numeric `graphStep` unlock thresholds.

Reflow retains one world and seal/path identities. A simultaneous authored
orientation/progression change first reflows existing ink, then reveals/retracts
the intended routes on the same seekable timeline. Anchors travel on the actual
seal perimeter. Pure orientation changes retain selection and reveal state.
Progressive Fit remains visible-only; complete views use full geometry. Geometry
is cached after reflow instead of recomputing seal intersections every frame.

See [CONTENT_AUTHORING.md](../CONTENT_AUTHORING.md) for complete examples.
`sample/` declares fixed mode; `showcase/` declares H→V. The generic content-only
`orientation-check/` exercises FH, FV, THV, TVH, THVH and TVHV through `&case=`.

## Small refinements

- Initial roots retain close framing and generous margins based on visible ink.
- One real text label per seal switches authored compact/full tiers; accessible
  names remain complete. Seal dimensions are reserved from full labels so detail
  changes cannot move connector anchors. Hysteresis, hierarchy and projected
  minimum title size are retained; optional notes still appear close up.
- The smaller presenter handle dims and the drawer collapses after idle. Pointer
  interaction or keyboard focus restores it; focused controls never auto-fold.
- Scorch/char and ash have subtly deeper tones. Particle counts, irregular masks,
  fiber geometry and flame behavior are unchanged.
- Existing overlapping everyday ink, page-arrival gating and ceremonial book/
  recap timing remain. No new independent animation loop or per-slide effect
  configuration was added.

## Browser verification

`npm run build` passed strict TypeScript and Vite production bundling.
Final acceptance covered **all 46 tests on the same production build** in two
complementary runs: 36 graph/showcase tests passed in 5.0 minutes, then the
remaining 10 book/cover/paper/drop tests passed in 1.2 minutes. No browser console
warnings/errors or uncaught page exceptions were reported in those final runs.

The v6 acceptance scenarios run in actual Chromium against `vite preview`, fail
on browser console warnings/errors or page exceptions, and capture intermediate
frames. They cover both fixed modes; H→V, V→H, H→V→H and V→H→V; unchanged model
progress throughout preview; source camera restoration; authored next/back;
normal restart; first-entry cover/slide previews; layout anchors; rapid commands;
reduced motion; blank-space clicks; a single wheel response; policy validation;
and idle-control keyboard recovery.

Reflow anchor gaps are checked below 0.3 world pixels at intermediate times.
The 37-node test checks all seal dimensions across detail levels. Regression
coverage retains native Chromium touch-emulated pan/pinch and drag suppression,
five varied parchment drops, physical opening/closing, combustion, node visits,
offline navigation, formulas, content-only graph-free decks and responsive bounds.

Representative frames were captured and visually inspected:

| Files in `docs/qa/` | Evidence |
| --- | --- |
| `v6-restart-{10,25,40,60,80,100}.png` | No complete-then-disappear graph on restart; only initial roots ignite |
| `v6-THV-preview-{0,20,45,70,100}.png` | Early H source reflows and grows into final V preview |
| `v6-THVH-preview-{0,20,45,70,100}.png` | Middle V source previews the final authored H map |
| `v6-reflow-{0,15,30,70,100}.png` | Existing paths stay attached as layout changes and new branches ignite |
| Existing `v2-touch-map.png`, `v3-paper-*.png`, `v4-overview-37.png`, `v5-drop-*.png` | Preserved gestures, material, readability and organic drops |

Reproduce with `npm run build` then `npm test`. Rehearsal URLs expose the existing
seek/skip API; normal playback exposes no global control object.

## Changed files

- `src/engine/graph-orientation.ts` (new), `types.ts`, `content.ts`: the three
  validated modes, ordered event lookup, optional authored graph cue IDs.
- `src/engine/graph-state.ts`, `presentation.ts`: independent slideshow progress
  and final preview, origin camera restoration, restart and staged entry.
- `src/components/route-graph.ts`: renderer-owned target/layout, dormant source
  state, coordinated reflow/growth and settled-geometry caching.
- `src/effects/timeline.ts`: generation guards for scheduled frames.
- `src/components/graph-node.ts`, `graph-detail.ts`, `src/styles/diagrams.css`:
  a single label, reserved seal geometry and unchanged semantic hierarchy.
- `src/components/presenter-idle.ts` (new), `book.ts`, `src/styles/book.css`:
  quiet idle controls with focus recovery.
- `src/effects/paper-burn.ts`: minor char/ash palette refinement only.
- `src/content/showcase/{deck.ts,graph.ts}`, `sample/graph.ts`,
  `src/content/orientation-check/**` (new): content declarations and generic QA.
- `tests/polish-v6.spec.ts` (new), `polish-v3.spec.ts`, `polish-v4.spec.ts`,
  `polish-v5-1.spec.ts`: v6 matrix, revised preview timing, all-seal detail checks
  and replacement of the superseded last-view/layout-mutation contract.
- `README.md`, `CONTENT_AUTHORING.md`, `docs/QA.md`, this report and captures.

## Known limits

- The actual reference video was unavailable; the described sequence was
  reproduced and inspected in Chromium. Physical tablets, Safari/Firefox and
  low-end GPU/projector hardware still need device acceptance.
- Dense maps can have crossings, and overview label collision handling still
  suppresses some titles. Pan/zoom, focus and full accessible names expose detail.
  Local scripted framing may intentionally crop older unrelated regions.
- Book/paper remain illustrated CSS 2.5D/2D. Small char changes are deliberately
  restrained; full material simulation is outside this round. Font fallbacks
  vary across systems.
- The content API still supplies one logical graph per presentation. State is
  in memory; normal cover opening now intentionally restarts the slideshow.
  No deployment, push, new dependencies or Calculus I deck was created.
