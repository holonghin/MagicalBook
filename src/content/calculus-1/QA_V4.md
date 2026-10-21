# Calculus content / visual flow polish v4

The existing book, random-origin combustion, graph engine, keyboard navigation
and optional printed-parchment ending remain in use. No push or publication.

## Changes

- L6: student-friendly theorem, aligned four-condition checklist, one keyboard
  step per condition, one-sided and infinity-tail qualifications, unchanged
  insufficient-hypothesis and inconclusive-limit diagnostics.
- D3: original x-expression retained, outer-layer accent, factors accumulating
  horizontally on the left and pending derivative on the right. The final beat
  consolidates to one centered horizontal equation with no duplicate panel or
  decorative box. A balanced two-line version is used below 700 px.
- A9: farmer / 12 m fence model, four fence segments and posts, moving dimensions
  with metres, live area with square metres, constraint → objective/domain →
  critical candidate → proved global maximum. The final square is 3 m × 3 m,
  area 9 m², since A(x)=9−(x−3)² for 0<x<6.
- X2: slope triangle, horizontal increment, separated tangent/actual change
  rulers and reserved callouts. dy=f′(a)dx is exact by definition; Δy≈dy is the
  approximation. A separate, clearly labelled error axis enlarges the gap.
- X3: signed error and reflected concavity share all live numeric state with the
  curve and tangent. The main coordinate scale stays honest at every zoom.
- A small generic continuation-group / demo-state handoff API joins the local
  model X1 → X2 → X3. Titles and formulas inscribe; the drawing stays visible.
  The graph is retained off-page and later reveals the accumulated delta.

## Mathematical verification

At a=4, dx=0.1: f′(4)=1/4, dy=0.025,
Δy=sqrt(4.1)−2≈0.0248456731 and E≈−0.0001543269.
Reflection f(x)=4−sqrt(x) reverses the slope, differential, actual change and
error signs. Negative, zero and positive increments remain in the positive
square-root domain. The main curve, tangent, rulers, readouts and error inset
all derive from the same current state. Concavity bounds require the whole
segment. All five Chain Rule factors retain the full inner x-expression.

## Browser verification

Production Chromium tests and representative frame captures live in
`tests/calculus-v4.spec.ts` and `docs/qa/calculus-v4/` (local generated evidence).
They cover 1440×900, 1920×1080 and 1024×768, slider extremes, geometric label
separation, the joined route in both directions, custom state transfer, parallel
map accumulation, repeated entrance / beat masks, native touch and narrow math.
`npm run build` passed (strict TypeScript + Vite production build).
The complete Chromium regression run passed **86/86** checks in 11.8 minutes,
including all Calculus slides and the generic engine / graph-free decks.
The final focused run passed **7/7** v4 checks in 1.6 minutes after rebuilding
with the tighter mathematical camera and reference-scale inset. Browser console
checks found no errors or warnings. The reference
scale travels across the handoff, stays fixed while dx is halved, and makes
the error visibly shrink as well as numerically shrink.

## Scope and limits

Continuous grouping is deliberately authored only for X1–X3; unrelated teaching
nodes keep their existing graph stops. The separate error axis holds its reference scale while halving dx, expands
for larger explored errors and states its scale; it must not be read as the main plot's vertical distance.
Touch is checked in Chromium emulation, not on physical iPad/Safari hardware.
The deck remains designed for landscape classroom presentation; narrow screens
use smaller diagrams and a balanced alternate Chain Rule layout.


## Files in this iteration

- Content: `deck.ts`, `style.css`, `nodes/limits.ts`, `nodes/analysis.ts`,
  `nodes/approximation.ts`, and the matching `demos/limits.ts`,
  `demos/derivatives.ts`, `demos/analysis.ts`, `demos/approximation.ts`.
- Generic compatibility extension: `src/engine/types.ts`,
  `src/engine/presentation.ts`, `src/components/demo-sequence.ts`.
- Verification: `tests/calculus-v4.spec.ts`; earlier Calculus content, flow and
  v3 assertions now account for the deliberately deferred map cues and the new
  explicit horizontal / differential / actual-change beats.
- Documentation: this report, this folder's `README.md`, and
  `CONTENT_AUTHORING.md`, the earlier `QA.md` pointer and `docs/QA.md`.


## Mini-map free-browsing follow-up

Mini-map temporarily allows every node to be visited, including untaught nodes
and goal branches. Node pages return to that same full map; browsing never
advances the teaching cursor, completes lessons or changes earned unlocks.
Leaving the preview restores the original guided cue and its normal locks.
Animation input locks remain in force until arrival / inscription finishes.

The production build passed. Six focused Chromium regressions passed in 1.4
minutes, including real pointer clicks on all 39 seals, native keyboard node
activation, node completion / Escape return, previews from cover and content,
unchanged teaching progression, Home restart and intermediate click gating.
No browser console errors or warnings. No push or deployment.


## Category-label cleanup

G1–G5 now have `slideIds: []`. Their five navigation-only overview pages and
unused branch renderer were removed. The five graph labels and all 71
connections remain; category labels cannot open in either teaching or Mini-map.
The 34 actual knowledge nodes retain their 45 teaching pages and free Mini-map
access. Right/Enter at the goal transition still proceeds directly to L1.

The generic schema permits a branch without slides and treats it as a static,
non-enterable category. Other decks' branches with authored content retain their
existing click behavior. The production build and seven Chromium checks passed
(1.2 minutes): complete guided flow, all content slides, all 34 actual node
clicks, category click rejection, Mini-map return, the generic showcase and
content validation. No browser console errors/warnings. Nothing was pushed.


## Approximation inscription follow-up

X1–X3 now register their new explanations and annotation regions with the common
MagicalReveal effect. Stable SVG geometry and independent annotation containers
replace the previous whole-SVG replacement on every frame. Existing camera and
mathematical motion remain unchanged; new annotation ink follows at the settled
pose so KaTeX metrics and glow copies remain aligned. Previously introduced
labels and the curve remain visible.

Continuous handoffs compare the source's visible annotation keys with the
incoming demo. X2 → X3 preserves dx, zoom, curve, tangent and error scale, and
inscribes only the newly introduced explanation and curve-choice labels.
Repeated entry recalculates these targets. Manual curve changes inscribe the
new function label and explanation without moving the teaching cursor.
The engine's existing reveal effect is reused; there is no new effect renderer,
mathematics, slide copy, navigation route or book animation.

Browser verification passed 15 checks: three focused approximation-ink tests at
1440×900 and 1024×768, seven existing v4 tests (also including 1920×1080), and
five guided-flow / unrelated-demo / generic-template regressions. Tests inspect
intermediate frames, stable plot/path identity, selective masks, repeated and
backward-seek inscription, formula bounds, skip, Home and reduced-motion cleanup.
Browser console checks found no errors or warnings. Representative frames are
saved locally in `docs/qa/approximation-ink/`. Production build passed.
No push or deployment.
