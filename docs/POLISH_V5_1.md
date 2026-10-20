# MagicalBook — template polish v5.1

This is an incremental fix to the existing engine. Cover art, paper combustion,
semantic detail, content-folder discovery and the shared book timeline remain.
No Calculus I presentation content was added.

## Confirmed cause and changes

The exact **vertical Graph → Mini-map → Home → Mini-map** failure was reproduced
in production Chromium before editing the engine. The first reopening frame
already had a horizontal graph. `open()` cleared the graph caches/visited state
and unconditionally restored the final graph's default layout. The ordinary
slide Mini-map branch also used the default rather than saved context.

The previous renderer cached one GraphView **per orientation**. Both shared
graph data, but each owned independent reveal/replay history. This was a real
state-splitting risk; it was not evidence of two simultaneously interactive
mounted graphs or duplicate gesture listeners in the original scene.

- `GraphState` now owns logical identity (presentation ID + optional graph ID),
  orientation, target step, revealed node/edge sets, visited/selected nodes and
  progression/orientation history. Presenter return history records actual
  scene steps and orientations. These survive closing/reopening within the
  current presentation instance. A new book instance uses its own declared
  default, so there is no cross-presentation state leakage.
- The renderer cache is keyed by graph identity. **One GraphView and one gesture
  surface** move between scenes and layouts. Orientation changes interpolate
  existing node positions and paths over 850 ms, preserve selection/progression
  and refit visible geometry. Connector attachments travel on the actual seal
  perimeter; both normal curves and gutter paths reflow from sampled geometry.
  Hidden future nodes stay hidden. Layout and path-growth clocks are separated
  at settlement so later cleanup/resize cannot redraw an earlier reveal frame.
- Home cancels motion and locks/cancels graph gestures while closing; it does
  not reset the map context. Cover Mini-map resolves that context before graph
  arrival and reveals the complete map in its saved orientation. Node visits,
  ordinary reopening, opening replay and interrupted Home use the same context.
  Old detached scenes have no active gesture frame or independent graph timer.
- The showcase's vertical section explicitly reorients the same completed map,
  retraces two beats, then expands again. It no longer suggests a second
  independent graph or silently resets progression on the orientation boundary.

## Parchment motion

Each invocation samples one profile, then evaluates it deterministically for all
frames. Normal playback uses a fresh random seed; rehearsal can use a fixed base
seed for a reproducible series. Parameters are travel duration (±12%), initial
offset (±42 px), sideways drift (±28 px), initial rotation (±7°), pitch (9–16°),
yaw (±5°), flutter phase/amplitude/frequency, a bounded fall-weight curve, small
settling rotation and sub-percent corner movement. They never resample per frame.

The paper accelerates, experiences drag and settles at its original readable
bounds with an exact identity transform. Text/formulas/shadow inherit the moving
sheet; reverse lifting uses that sheet's sampled profile. At 67% travel time
(about 68–70% descent), 1–3 ink regions per line begin together. Landing remains
85% inscribed and the final 15% completes afterward. Reduced motion settles
directly. No per-slide effect controls or new authoring knobs were added.

## Verification

Production build: `npm run build` passed strict TypeScript + Vite.
Final production-preview acceptance: **all 36 Chromium tests passed in 4.8
minutes**, including the complete showcase, native touch emulation and the
strengthened normal-reopening/reduced-motion regression checks. No browser
console warnings/errors or page exceptions were reported.

The dedicated v5.1 browser milestones cover the exact regression and variants
after node visitation, ordinary reopening, fast Home interruption and explicit
horizontal → vertical changes. They verify graph/viewport object identity,
one cached viewport, visited nodes, progression and selection preservation,
visible-only framing, anchor gaps under 0.3 world pixels at 0/25/50/75/100%
reflow, Mini-map return to a partial reflowed scene, rapid input cleanup and a
single wheel response. Loading another presentation verifies its own default.

Five identical recap-scene activations use distinct profiles, are stable when
seeking back to the same point, begin ink in flight, land at 85%, keep readable
content in bounds and finish without leftover masks. Fresh normal seeds and
reduced motion are also exercised. Tests fail on browser console warnings/errors
and page exceptions. Intermediate frames were captured and visually inspected,
including all five early drop poses, in-flight inscription, landing, layout
reflow and the reopened vertical map.

| Evidence in `docs/qa/` | Scenario |
| --- | --- |
| `v5-map-reopen-{10,30,50,70,90,100}.png` | Exact Home → Mini-map journey; no horizontal fallback or premature map |
| `v5-node-home.png` | Home from a visited node |
| `v5-reflow-{0,25,50,75,100}.png` | One world reflowing with attached edges and unchanged partial reveal |
| `v5-drop-{1,2,3,4,5}-{40,75,land}.png` | Distinct trajectories, moving ink and 85% landing |

Reproduce with `npm run build` then `npm test` (Playwright Chromium installed).
`?deck=showcase&rehearsal` exposes the existing seek/skip API. The optional
`grimoire.rehearsal.dropSeed` supplies a debug seed series; it is not deck data.

## Changed files

- `src/engine/graph-state.ts` (new), `types.ts`: presentation-scoped graph model
  and typed renderer context; optional logical graph ID.
- `src/engine/presentation.ts`: persistent session, identity-keyed view reuse,
  actual navigation snapshots, in-place reflow routing, lifecycle input locks,
  drop-profile sampling/storage and reverse lifting.
- `src/components/route-graph.ts`, `graph-detail.ts`: shared progression and
  selection, one mutable layout, stable settlement and existing theme hierarchy.
- `src/components/graph-reflow.ts` (new): sampled path reflow and perimeter-bound
  endpoint motion, calculated once per layout invocation.
- `src/effects/drop-profile.ts` (new), `book-motion.ts`: bounded seeded motion,
  organic descent/corners, exact landing and profile-aware overlap timing.
- `src/effects/magical-reveal.ts`: optional internal 1–3 regions per line for
  falling sheets; ordinary reveal defaults are unchanged.
- `src/content/showcase/deck.ts`: same-map vertical/retraction demonstration.
- `tests/polish-v5-1.spec.ts` (new), `tests/polish-v3.spec.ts`: regression,
  reflow/drop coverage and superseded default-reset assertion corrected.
- `README.md`, `CONTENT_AUTHORING.md`, `docs/QA.md`, this report and
  `docs/qa/v5-*.png`: current behavior, authoring and frame evidence.

## Limits

- Session state is in memory; page reload starts at the declared default. The
  content API currently provides one logical route graph per presentation. The
  new identity model does not add a multi-graph content authoring API.
- Reflow may temporarily bring unrelated branches close together; dense edge
  crossings remain possible. Dense overviews still selectively suppress
  colliding titles. Pan/zoom exposes detail without changing mathematical meaning.
- Paper remains a gently articulated illustrated plane rather than a deformable
  cloth simulation. Very small corner movement is intentional. Font fallbacks
  and material appearance vary by browser/platform.
- Actual Chromium and native touch emulation are tested. Physical tablets,
  Safari/Firefox and low-end GPU/projector hardware remain unverified.
- No new art, dependencies, deployment, push or Calculus I content. Existing
  folder-only authoring and optional second-act setting are unchanged.
