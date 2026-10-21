# Template and content verification

The complete Calculus I deck is available at `?deck=calculus-1`. See its
[current content QA report](../src/content/calculus-1/QA.md) for node/page audits,
mathematical controls, projection sizing, touch/offline tests and inspected
animation frames. The sections below retain the template development history.

The current falling-paper amendment is [physical occlusion and printed
parchment](FALLING_PAPER.md). It supersedes historical drop/ink overlap checks:
the old page stays intact underneath an opaque preprinted sheet, and reverse
lifts expose the retained page. Ordinary burn effects and graph progression are
unchanged. Historical validation counts below refer to their respective runs.

Falling-paper acceptance: production build passes; all 20 affected Chromium
checks passed on the final build. The preceding full run passed the other 41
cases; two resource/screenshot errors in that run passed on the final rerun.
See the report for exact scope, inspected frames and limitations.

The latest targeted amendment is [graph reveal fix v2](GRAPH_REVEAL_FIX_V2.md):
repeatable entrance burning, independent logical progress and a full-map-only
2300 ms post-travel budget. It preserves the v6 orientation and book architecture.
The v6 counts below describe the previous baseline; the amendment report records
the new production validation and representative burn frames.

Graph-reveal amendment acceptance: 55 full-suite tests passed, followed by 23
affected tests on the final build after adding the slow-recap-return regression.
The 37-node post-travel reveals measured 2213–2266 ms. See the amendment report
for exact run scope, timings, changed files and remaining rendering limitations.

The current iteration is [template polish v6](POLISH_V6.md). Its report records
the reproduced completed-graph flash/reset, three authored orientation modes,
separate slideshow progression and final preview, single-viewport reflow,
changed files, inspected intermediate frames and limitations. The production
build passes. Browser console warnings/errors and uncaught exceptions are checked
by milestone and showcase tests. Touch checks use native Chromium touch emulation;
physical tablets, other browsers and projector hardware remain unverified.

Final v6 acceptance: **46 tests passed on the same production build**, across
36 graph/showcase tests (5.0 minutes) and the complementary 10 physical-book,
cover, paper-burn and drop tests (1.2 minutes). This covers all current test files,
including native touch emulation and intermediate frames. No browser console
warnings/errors or page exceptions were reported in the final runs.

The video itself was unavailable; the described sequence was reproduced before
the fix with nine nodes on the first restart frame, then verified after the fix
with only initial nodes. Current v6 evidence is in `docs/qa/v6-*.png`.

[v5.1 verification](POLISH_V5_1.md) is historical. Its arbitrary last-view
orientation preservation is superseded by v6: Mini-map uses the authored final
orientation and normal PPT restart uses the authored beginning. Organic drop
profiles and one graph viewport remain.

The preceding [v4 verification](POLISH_V4.md) recorded **32 Chromium tests passing
in 3.3 minutes**. Its graph readability/pacing work is retained. Historical
results below are not the current acceptance count.

[v3 verification](POLISH_V3.md) records the earlier geometry, reversible motion
and material work retained by v5.1.

## Historical v2 verification and change record

Production verification uses strict TypeScript + Vite, then real Chromium against
`vite preview`. The complete showcase is `src/content/showcase/` (default URL or
`?deck=showcase`); `?deck=demo` is a compatibility alias. This round implements the
v2 specification and leaves Calculus I content for review and a later phase.

## Build and browser evidence

`npm run build` passes. The final acceptance run passed **all 22 tests in 1.3 minutes**. Tests fail on browser console warnings/errors and uncaught exceptions
in the showcase and v2 milestone scenarios. Terminal Node color-environment
notices are test-runner notices, not browser errors.

The suite runs against the production build, not a development-only mock:

- Existing book geometry/continuity checks compare opening and closing cover,
  camera and all four leaf poses in reverse, including interrupted opening.
  Captures inspect 10/20/35/50/65/80/95% opening and corresponding closing frames.
- Cover and slide Mini-map checks verify the compositing gate is zero throughout
  physical travel, followed by a separate, live root/path/seal inscription phase.
  The destination is inert while hidden. No finished map is pre-exposed.
- A 430 ms camera focus precedes actual SVG path-length tracing. Each destination
  constructs its scorch, outline, irregular two-origin fill and title over 600 ms
  after arrival. Five branches trace simultaneously. Old roots keep their DOM
  identity; first arrival constructs a convergence only once.
- Both horizontal and vertical automatic layouts work. Incremental events retain
  their local camera; completed-map events fit initially and then unlock.
- Real mouse input checks node dragging without accidental activation, smooth
  cursor-anchored wheel zoom, keyboard node activation, blank-map clicks, Fit,
  return from node content, cached demo state and camera stability on resize.
- Native Chromium touch emulation uses CDP touch input with two simultaneous
  fingers, rather than synthetic DOM pointer dispatch. It verifies one-finger
  dragging directly over a node, centroid pinch zoom, prevention of page scroll,
  cinematic input locking, and cleanup when Home interrupts a live gesture.
- Combustion captures exactly 1/2/3 origins at 15/35/60/85%. The original outgoing
  DOM remains opaque; real holes subtract material. Four thin strokes provide
  tan staining, brown heat damage and fractured carbon/fiber edges; separate
  sparse flames and a bounded 96-particle pool supply finite-lived drifting ash.
  Seeded multiscale grain avoids inflated regular scallops. The middle of the
  burn leaves time for fronts to travel and merge, with an accelerated finish.
- Rewind/replay reproduce hole geometry exactly. Skip/Home/rapid jumps leave no
  masks, ash canvas, temporary leaves or glow copies after completion. Home during
  a partial map does not finish and flash the previously hidden network first.
- The full walk includes ordinary multiline inscription/erasure, all three burn
  cases, single and parallel graph events, both axes, recap drops, final map and
  closing. Next from Mini-map closes directly; Home is always a direct close.
- Recap lettering starts at 67% descent and is 85% complete at landing, finishing
  on the settled sheet. Both `{ enabled: true }` and `{ enabled: false }` ending
  settings compile correctly. Minimal graph and graph-free folders both load.
- Local KaTeX formula rendering, reduced motion, offline navigation after loading,
  responsive map bounds/no overlap at four screen sizes, invalid content references
  and missing folder errors remain covered.

Representative frames were visually inspected, including intermediate book,
Mini-map, node construction, partial closing and one-/three-source burn frames.
These are inspection evidence, not font-dependent pixel golden assertions.

| Evidence | Files in `docs/qa/` |
| --- | --- |
| Physical book continuity | `next-opening-*.png`, `next-closing-*.png` |
| Mini-map travel and arrival | `v2-map-cover-{10,30,50}.png`, `v2-map-cover-reveal.png`, `v2-map-slide-{10,20,30}.png` |
| Focus → path → seal → title | `v2-source-focus.png`, `v2-path.png`, `v2-node-seal.png`, `v2-node-title.png` |
| Parallel paths and interactive overview | `v2-parallel.png`, `v2-interactive-map.png`, `v2-touch-map.png` |
| Paper material stages | `v2-burn-{1,2,3}-{15,35,60,85}.png` |
| Partial-map Home interruption | `v2-interrupted-map-close.png` |
| Formula, recap and vertical layout | `v2-formula.png`, `next-drop.png`, `next-vertical.png` |

Reproduce with `npm run build` then `npm test` (install Playwright Chromium once).
Use `?deck=showcase&rehearsal` to inspect `window.grimoire.timeline` at exact
fractions. `grimoire.rehearsal.burnOrigins = 1 | 2 | 3` is a test-only override;
content authors do not select ignition counts or effect styles.

## Changed source and documentation

| Files | Purpose |
| --- | --- |
| `src/engine/presentation.ts` | Transition-before-map lifecycle, condensed map clock, explicit restoration, partial-map close preservation and graph lifecycle cleanup |
| `src/components/route-graph.ts` | Focus/path/arrival scheduling, parallel waves, node staging, local camera integration and observer disposal |
| `src/components/graph-camera.ts` (new) | Shared graph transform, focus/fit, mouse/touch gestures, input locks and saved view |
| `src/components/graph-node.ts` (new) | Manuscript seal construction, outline tracing and irregular paper fill |
| `src/components/graph-layout.ts` | Stable spacing for larger readable seal labels in both axes |
| `src/effects/paper-burn.ts` | Seeded multiscale holes, thin fibrous char, localized flame and small falling ash |
| `src/styles/book.css`, `src/styles/diagrams.css` | Restrained burn material, seal/edge art and graph gesture surfaces |
| `src/engine/content.ts` | `secondActEnding.enabled` with boolean backward compatibility |
| `src/main.ts` | Default showcase folder selection through existing automatic discovery |
| `src/content/showcase/**` | Full self-contained showcase moved from `demo`; scoped compass style and new ending flag |
| `src/content/demo/deck.ts` | Compatibility re-export of showcase |
| `src/content/sample/deck.ts`, `src/content/plain/deck.ts` | Modern optional-ending syntax in copyable minimal examples |
| `tests/polish-v2.spec.ts` (new), `tests/showcase.spec.ts` | Milestone tests, native touch, material captures and updated regressions |
| `CONTENT_AUTHORING.md`, `README.md`, `docs/QA.md`, `docs/qa/v2-*.png` | Folder-only cloning guide, interaction/timing contract, verification and captured evidence |

No remote deployment or push was performed. Git is not initialized in this local
workspace, so no milestone commits could be recorded. Existing GitHub Pages
workflow remains available.

## Architecture and authoring boundary

The physical book continues to use the existing reversible book camera/timeline;
page content remains inside its page coordinate system. Presentation controls
schedule physical travel first, then graph-local growth. GraphView owns one
persistent world across axes; GraphCamera transforms its nodes and paths together.
The renderer temporarily locks gestures during its cinematic event and restores
control after it. Returning from a node reuses the same map/camera and replays
visual inscription without resetting the logical graph. One viewport is reused
across orientations and cover cycles; its input is cancelled during navigation.

The folder compiler owns scene grammar and reference validation. All subject
words, formulas, graph topology, lecture order, demos and recap text remain under
`src/content/<folder>/`. The loader discovers each `deck.ts` automatically. The
main cinematic option is `secondActEnding: { enabled: boolean }`; older booleans
still work. A graph is optional and can select either layout. Local KaTeX was
already installed and is retained; no new runtime service or CDN was introduced.
See `CONTENT_AUTHORING.md` for the complete copy-and-edit procedure.

## Remaining limitations

- Verified in Chromium, including native touch emulation. Physical tablet,
  Firefox/Safari and low-end GPU/projector testing remain to be done. Book motion
  is CSS 2.5D and combustion is illustrated 2D, not a deformable paper simulation.
- Large/dense graphs can still have crossings and small overview labels. Pan,
  pinch/wheel zoom and Fit expose detail; a single projected overview cannot show
  unlimited readable nodes. Optional authored positions are not collision-fixed.
- Manuscript type uses installed Segoe Print/Script/cursive fallbacks and differs
  across systems. KaTeX fonts are bundled with their license in `public/licenses`.
- Custom demos are synchronous DOM/SVG components; local media must be ready before
  inscription, and subject CSS must remain scoped to its folder. No visual editor,
  automatic text pagination or arbitrary TeX package support is provided.
- State is in memory. Offline navigation after loading is tested; hosted offline
  reload needs a service worker, which is not part of this template.
- Adding/changing a content folder requires rebuilding the static deployment.
  GitHub Pages deployment itself has not been run in this iteration.





Calculus content/visual flow v4 adds the student-friendly L’Hôpital checklist, horizontal Chain Rule result, farmer’s fencing model, collision-free change/error callouts and continuous X1–X3 teaching. See [the current content report](../src/content/calculus-1/QA_V4.md) for checks, file inventory and limitations.
