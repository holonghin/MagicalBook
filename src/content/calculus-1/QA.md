Current content/layout/continuation verification: [v4 report](QA_V4.md). The earlier results below describe the preceding revision.

# Calculus I guided-flow verification

The current v3 reliability pass is documented in [QA_V3.md](QA_V3.md). The results below describe the preceding guided-flow iteration, before the delta-only graph and complete slider-beat changes.

## Run results

- `npm run build`: passed (TypeScript and Vite production bundling).
- Full browser regression: **72 passed**, 7.1 minutes. This includes the generic
  showcase, graph-free deck, book continuity, combustion, falling sheets,
  orientation modes, Mini-map and gesture regressions, plus Calculus acceptance.
- The full run precedes the final content-only label, model annotation and
  continuity open-circle refinements; their final Calculus rerun is recorded below.
- Final production rebuild and both Calculus suites: **11 passed**, 1.6 minutes,
  with no browser exceptions, console errors or warnings.
- `git diff --check`: passed.

## Current changes

- Opening reveals only the F0 graph root. Right/Enter opens its two pages; their reversible beats precede page navigation. Completing F0 reveals the five branch paths in parallel.
- The authored guided cursor, visually revealed graph, unlocked access, visited nodes and completed lessons are separate. Future nodes reject activation even in Mini-map. Visiting an older node or using Escape does not move the teaching schedule.
- Right completes a node and reveals/selects the next cue. The next Right opens it. Left reverses demo beats, pages and guided steps. Home closes directly; restarting from the cover resets the guided lesson and demonstration beats.
- Multi-step demonstrations share the existing presentation timeline, magical inscription, skip, pause, reduced-motion and interruption handling. Each controller belongs to one node/slide instance; cloned outgoing paper has no live demo controller.
- Distinct scenarios replace the repeated L2/P1, D1/P3, Rolle/MVT, A2/A4, A1/A7/A8 and X1/X2/X3 experiences. Domain controls cannot reveal future curve analysis; only X3 magnifies signed error.
- Chain Rule uses a five-item ordered factor rail, an explicitly highlighted remaining outer layer, full x-expressions, and a sixth consolidation beat. Back restores the preceding layer; restart clears the rail.
- F0's arrow geometry shares source/target anchors with the actual SVG dots. The three tips have a consistent nine-unit clearance, and the unreached output is distinct from the range.

## Browser acceptance

The two suites are `tests/calculus-content.spec.ts` and `tests/calculus-flow.spec.ts`.

- Complete keyboard-only traversal reaches all 44 knowledge pages and all 34 knowledge nodes in the authored order, including D1 → P3 and the return to G2 after D8.
- Consecutive one-page lessons, multi-page nodes, Enter selection, Escape, past-node revisits, repeated Left/Right, locked synthetic/native click attempts, Mini-map return, Home → Mini-map and fresh restart are checked.
- Every teaching page, branch page and recap renders without fallback content or formula errors. Projection layouts are checked at 1440×900 and 1280×720; all six Chain Rule states fit the smaller frame.
- F0's pairings −1→1, 0→0 and 1→1 are measured from the SVG path endpoints against the actual output dots at 1440×900 and 1024×768, with screenshots for both.
- Native Chromium touch input verifies pan and two-finger pinch at 1024×768. Offline interaction after initial loading and reduced motion are checked. The template suite separately checks drag-click suppression and wheel zoom.
- Inspected intermediate opening, mapping morph, five-branch reveal, graph path/target, Chain Rule ember, node combustion, falling recap, reverse lift and closing frames. The six preprinted recap sheets and saved completed-map return retain the existing physical occlusion behavior.
- No browser exceptions, console errors or warnings occur in the passing Calculus runs.

## Mathematical audit

All node formulas, domains and assumptions from the existing content remain. Additional checks cover IVT's three/one/tangent-level intersections; Rolle's equal endpoints versus MVT's adjustable nonmatching tangent; finite derivative versus a continuous corner; critical candidates versus Fermat's interior/differentiable/extremum assumptions; disconnected x+1/x branches and correct asymptotes; reciprocal inverse slopes; vertical circle tangents; ladder rates; optimization; and epsilon/delta bands.

The Chain Rule rail is, in order: cosine of the full logarithm, reciprocal of 1 plus the exponential, that exponential, 3(x²+1)², and 2x. The consolidated derivative groups the exponential and reciprocal without cancelling them. No u/v/w substitutions are introduced.

L’Hôpital's three question/verdict pairs are keyboard beats: applicable off-target differentiability, insufficient punctured-neighborhood hypotheses despite a known derivative at zero, and an inconclusive derivative-quotient limit. The optional oscillating witness remains available.

At a=4 and dx=0.1, dy=0.025 is exact by definition; actual change is sqrt(4.1)−2. Their signed difference is negative. Reflecting to 4−sqrt(x) reverses the sign, and halving dx approximately quarters the error. X1 predicts/compares; X2 builds dx→dy→actual change; X3 studies error and curvature.

## Changed areas

- `src/content/calculus-1/deck.ts`, `knowledge-graph/graph.ts`, `knowledge-graph/connections.ts`: graph-first opening, grouped branch cue and authored guided access.
- `demos/{ink,index,functions,limits,derivatives,analysis,approximation}.ts`, `style.css`, `nodes/foundation.ts`: isolated scenarios, reversible beats, Chain Rule, mapping anchors and responsive layout.
- `src/engine/{types,content,guided-route,graph-state,presentation}.ts`, `src/components/{demo-sequence,route-graph}.ts`: opt-in subject-independent guided navigation, demo clock integration and access enforcement.
- The two Calculus browser test suites, this report, the deck presenter guide and `CONTENT_AUTHORING.md`.

The other decks retain their existing navigation unless they opt into guided-route data. The book artwork, opening/closing choreography, paper combustion and falling-sheet engine are preserved. No dependencies or deployment settings changed.

Evidence: `docs/qa/calculus/` and `docs/qa/calculus-flow/` (local ignored QA artifacts). Representative images include `chain-1.png` through `chain-6.png`, `chain-ember.png`, `mapping-1440.png`, `mapping-1024.png`, `branches-middle.png`, `open-middle.png` and `close-middle.png`.

## Remaining limitations

- Chromium was tested; Safari, Firefox and a physical tablet were not tested in this iteration.
- Sliders use native arrow-key adjustment while focused. Tab away to resume the presentation's global arrow navigation.
- The dense final map abbreviates labels; use pan/zoom for full detail.
- The 30-minute plan is flexible, with no enforced timing or automatic slide advance. Discussing every optional control takes longer.
- A cold offline reload needs caching/service-worker support; interaction after initial asset loading works offline.

No required lesson or demonstration remains as placeholder content. No GitHub push or publication was performed.
