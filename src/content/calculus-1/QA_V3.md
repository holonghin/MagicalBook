# Calculus I guided flow and animation reliability — v3

## Changes

The deck retains its 34 knowledge nodes, five branches, 71 connections, teaching order and six-leaf ending. It now has **45 teaching pages**: the additional short P6 page connects IVT existence with strict-monotonicity uniqueness. L3's cube identities and cancellation are integrated into its existing algebra page; rationalization and dominant-power division remain.

### Reliable inscription

- Glow copies now occupy their target's exact local offset box, rather than stretching over a containing flex/grid widget. Each target retains its own clip/mask; adjacent buttons, formulas and labels do not share that mask.
- Horizontal and vertical layout scales are handled separately. Hidden KaTeX accessibility/source text is excluded from painted-geometry sampling; erase bounds include glyph overflow.
- Cloned SVG definitions and references receive unique IDs. Final reveal explicitly clears clipping; final erase explicitly clears visible ink. Disposal is idempotent and restores the parent's positioning lease only after its last active effect finishes.
- All bundled fonts load before presentation geometry is measured. Resize finishes active effects; re-entry measures current content again.
- The old subject-specific animation-frame loops were removed. Mathematical motion, inscription, skip and cancellation use the presentation's existing seekable timeline.

Interactive controls remain inert during a scripted motion and are restored on completion. This prevents optional slider/choice changes from racing the playback clock. Keyboard-driven case changes also synchronize the visible choice-button selection.

### Retained graph and readable camera

Normal guided node returns preserve the actual graph/controller, orientation, existing ink and camera. There are no book leaves on ordinary node entry/return or graph progression. Only new edges and seals animate; Escape restores the saved view without replaying known roots or branches. Left retracts the recent delta and restores the earlier camera before exposing the previous lesson.

Semantic cross-links still reveal as authored, but distant cross-link endpoints no longer force a global camera fit. For a long primary path, the camera first establishes the source/path context, then follows toward the destination and holds a readable local frame during inscription. Simultaneous targets receive one branch composition. Full title/note geometry is reserved before seal sizes are frozen, including when the first label tier is abbreviated. Resizing invalidates obsolete pixel camera history and recomputes the returning viewport. Distant known nodes may be offscreen; explicit Fit still uses visible bounds, and Mini-map remains an independent full-state preview with its intentional page travel.

### Keyboard teaching beats

`demos/ink.ts` provides the content-local `teachingBeats` helper. Each renderer declares an ordered array of labelled mathematical states and, where appropriate, numeric fields to sweep. This is authored content, not a DOM-order or click-all routine. The shared `DemoSequence` controller provides Right/Left, manual requests, restart and a single presentation clock. Existing multi-step scenarios retain their explicit reversible render functions.

Coverage includes F0 mapping/inversion; L1's hole; all L2 comparisons and verdicts; L3 factoring/division and both infinite directions; squeeze; epsilon/delta; L’Hôpital questions/verdicts/witness; continuity; IVT target heights; secants/corners; Rolle/MVT; monotonicity and uniqueness; Chain Rule; logarithmic/implicit/inverse/trig/rate demonstrations; EVT/Fermat/signs/concavity; graph construction; optimization; and approximation/differentials/error. Static reference tables and the critical-number comparison remain concise static views.

The quiet cue shows the current demo count and mathematical step. `C` hides/shows it, including in screenshots; it is hidden for print. Restart demo resets only the current controller. Optional manual exploration is identified as exploration. Native focused sliders keep their arrow-key adjustments; Tab away to resume presentation navigation. While an instructional motion plays, another arrow finishes that motion without advancing another teaching beat. Home still interrupts directly to close.

## Mathematical checks

L3 includes both cube identities and the punctured cancellation `(x³−8)/(x−2)=x²+2x+4` for `x≠2`, followed by the limit 12. No value at the original hole is assigned by cancellation.

The P6 bridge states all three hypotheses: continuity on `[a,b]`, opposite endpoint signs, and strict monotonicity on `[a,b]`. Its beats distinguish at least one, at most one and exactly one interior root. The example `x³+x−1` on `[0,1]` has endpoint values −1 and 1, derivative `3x²+1>0`, and a numerically verified zero near 0.6823278038. The derivative-sign condition is explicitly sufficient via MVT, not the definition of strict monotonicity. Non-strict monotonicity may allow an interval of zeros.

All pre-existing domain, theorem and differential-versus-actual-change safeguards remain. No past-exam questions or separate problem mode were added.

## Verification

- Production build: passed, including strict TypeScript and Vite bundling.
- Full template + Calculus browser run: **78 passed**, 10.0 minutes. This run preceded the final guided-seal sizing, resize-return and cue refinements.
- After those refinements: all **18 Calculus checks passed**, 4.6 minutes.
- Final production rebuild and v3 rerun after choice-selection synchronization and input locks: **7 passed**, 2.9 minutes, including genuine ten-cycle Left/Right checks and nested verdict-glow alignment.
- `git diff --check`: passed.

The tests use the real production preview, with browser exceptions and console warnings/errors treated as failures.

- `tests/calculus-v3.spec.ts`: full keyboard walk; every slider has a registered authored sequence; L2 Agree/Disagree/infinite cases; demo restart without route reset; all 33 new-node reveals at 1440×900 and 1024×768; known-edge progress remains 1; no book leaves during ordinary graph travel; readable target bounds/scale; exact saved viewport return; reverse delta; separate Mini-map page travel and locks; ten actual Left/Right round trips inside L3 and L6 at 25/50/75/100%; local glow alignment and complete cleanup; tablet cube and uniqueness beats.
- Existing Calculus suites: all 45 pages, complete route, mathematical controls, native touch pan/pinch, offline interaction, Chain Rule states, ending and cached-map return.
- Existing template suites: cover/closing continuity, graph-free content, orientation modes, full-map reveal budget, drag-click suppression, combustion, paper descent/lift, rapid navigation and deployment assets.

Representative local evidence is under `docs/qa/calculus-v3/`: L3/L6 quarter-progress frames, diagnostic beat frames, cube identities/cancellation, IVT uniqueness states, and intermediate/settled target views at desktop and tablet widths. QA images remain ignored local artifacts.

## Changed implementation areas

- Shared geometry and loading: `src/effects/magical-reveal.ts`, `src/main.ts`.
- Navigation/camera/cues: `src/engine/presentation.ts`, `src/engine/types.ts`, `src/components/{route-graph,demo-sequence,book}.ts`, `src/styles/book.css`.
- Subject content: `demos/{ink,limits,functions,derivatives,analysis,approximation,index}.ts`, `nodes/{limits,properties}.ts`, and the presenter guide in this folder.
- Browser tests: `tests/calculus-v3.spec.ts` plus revised navigation expectations in the two previous Calculus suites.

The cover, parchment artwork, paper-combustion implementation, physical falling-sheet implementation, graph data and GitHub Pages configuration were preserved. No dependencies changed.

## Remaining limits

Chromium desktop and native touch emulation are covered. Safari, Firefox and a physical tablet have not been checked. The complete map remains dense; Fit/Mini-map provide overview and pan/zoom expose detail. The roughly 30-minute talk has no automatic slide timing; discussing all optional controls can take longer. Offline interaction works after initial loading; a cold offline reload still requires service-worker caching that this template does not implement.

No GitHub push or publication was performed.
