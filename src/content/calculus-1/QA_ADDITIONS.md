# L6 and differential error-propagation additions

Verified 2026-10-21 against the local production build in Chromium.

## Content and mathematical checks

- Six additional pages inside existing nodes: four before L6's original rule and
  diagnoses, then two after X3's signed-error demonstration and quantitative bound.
  Inventory: 51 teaching pages, 34 content nodes, five noninteractive graph category
  labels, 71 connections. No new graph nodes or engine changes.
- Seven indeterminate forms are classified separately from positive-base
  `0^(+∞) → 0` and `(+∞)^(+∞) → +∞`. Infinity denotes divergence, not arithmetic.
- Product conversion checks differentiability, nonzero denominator derivative,
  quotient domain and derivative-ratio limit before invoking L'Hôpital.
- Conjugate rationalization explicitly preserves the numerator
  `x²+x−x²=x`; division by positive x gives the limit 1/2 without differentiation.
- All three positive-base power examples use logarithms. The `1^∞` example
  uses the previously recalled logarithmic limit; the `∞^0` example equals e
  identically for x > 1.
- Original applicability/unknown-function/inconclusive diagnoses remain. The
  course's oscillating derivative-quotient witness remains at beat 6. Beat 7
  recalls `x sin(1/x) → 0` by a bound despite its oscillating derivative; it does
  not claim a L'Hôpital application to that product.
- X1/X2/X3's original shared curve, tangent, imported slider state, selective
  burn-in, signed error, concavity and bound are preserved.
- Measurement-error magnitudes use absolute values and a nonzero reference
  output. They are explicitly distinguished from `E = Δy − dy`.
- Circle area: `dA/A = 2δ`, `ΔA/A = 2δ+δ²`, with `δ=Δr/r`, `dr=Δr`.
  Verified +1% → predicted +2%, exact +2.01%; −1% → −2%, −1.99%;
  +0.5% → +1%, +1.0025%. Exact minus differential area equals `π(Δr)²`.
  The circle/annulus preserves relative geometric scale; a separate explicitly
  labelled ×10 radial-edge inset shows the small motion more clearly.

## Browser verification

Two successful runs: **23 checks (3.7 minutes)**, then **8 checks (1.5 minutes)**
after the final inset refinement: **25 distinct checks, 31 successful executions**.
The second run repeats six new-content checks and adds two established v3 checks.

```sh
node node_modules/@playwright/test/cli.js test tests/calculus-additions.spec.ts tests/calculus-content.spec.ts tests/approximation-ink.spec.ts tests/calculus-v4.spec.ts --reporter=line
node node_modules/@playwright/test/cli.js test tests/calculus-additions.spec.ts tests/calculus-v3.spec.ts --grep "new lessons|classification|circle annulus|new ink|every slider|ten repeated" --reporter=line
npm run build
```

Coverage:

- All added beats at 1440×900, 1280×720 and 1024×768: formulas, page bounds,
  controls and SVG legend separation. Existing v4 layout checks also cover 1920px.
- Every authored teaching page, every graph node/connection, complete keyboard-only
  teaching route, deferred X2/X3 graph reveals, Mini-map context, closing and recap.
- Repeated entries, backwards playback, entrance replay, intermediate burn masks,
  mask alignment and cleanup, slider exploration, and Home during area motion.
- Persistent shared X2/X3 geometry and new-only inscription; persistent circle
  DOM and mathematically consistent intermediate radius/area motion.
- Ten repeated L3/L6 page entrances with quarter/half/three-quarter/final frames.
- Existing mathematical demos, touch pan/pinch, tablet controls, offline and
  reduced-motion checks. No browser console warnings, errors or page errors.

Representative captures, including intermediate burn-in and motion frames, are
in `docs/qa/calculus-additions/` (local QA evidence, ignored by Git). Inspected
classification, conjugate algebra, error quantities, circle area, product burn-in
and circle-motion frames. Fixed a 720p SVG legend/control overlap found during
visual inspection and snapped motion endpoints to avoid floating-point drift.

## Changed files in this iteration

- `nodes/limits.ts`, `nodes/approximation.ts`: teaching pages and precise notes.
- `demos/limit-forms.ts`, `demos/error-propagation.ts`: new content-owned sequences.
- `demos/limits.ts`: additional squeeze/oscillating-derivative comparison.
- `demos/index.ts`, `style.css`: content renderer registration and scoped layout.
- `README.md`, this report: presenter instructions, updated inventory and results.
- `tests/calculus-additions.spec.ts`: six focused browser checks.
- `tests/calculus-content.spec.ts`, `tests/calculus-v3.spec.ts`,
  `tests/calculus-v4.spec.ts`: updated page-count/final-page expectations.

All paths above are relative to this content folder except `tests/`, which is
relative to the project root. The shared engine and existing approximation
renderer were not edited in this iteration.

## Limits

No known outstanding issue in the tested Chromium configurations. Small true-scale
annuli are deliberately thin; the inset is clearly marked as magnified. Pacing
remains presenter-controlled; explaining every additional micro-example can add
a few minutes to the approximate 30-minute review. Touch checks use emulation,
not a physical tablet. Nothing was pushed or published.
