# Calculus I · From Local to Global, and Back Again

Open `/MagicalBook/?deck=calculus-1`. For local development:

```sh
npm ci
npm run dev
```

Use the printed Vite URL with `/MagicalBook/?deck=calculus-1` appended. For a production rehearsal, run `npm run build` followed by `npm run preview` and open `http://127.0.0.1:4173/MagicalBook/?deck=calculus-1`.

## Presenting

Click the cover or press Enter. The open book first reveals **only the F0 graph root**. Right/Enter enters its two foundation pages. Right first advances each reversible instructional beat, then its page. After F0, the five goal paths reveal together; G1–G5 are category labels without content pages. Right/Enter continues to the next knowledge node.

The entire guided lesson works without a mouse. Every slider demonstration has authored meaningful positions or a short sweep, including both agreeing/disagreeing one-sided limits. On a graph cue, Right/Enter opens the selected node. On its final page, Right returns to the graph and traces/selects the next authored node; the following Right enters it. Left undoes a demo beat, page or guided step. Escape returns to the same graph without advancing. Revisiting an older unlocked node never skips the scheduled lesson. A fresh cover opening restarts the lesson and demo beats; Home followed by G preserves earned access while previewing the map.

Teaching order:

```text
F0 (2 pages)
G1: L1 → L2 → L3 → L4 → L5 → L6 → L7
G2: P1 → P2
G3: D1 → P3 → D2 → D3 → D4 → D5 → D6 → D7 → D8
G2: P4 → P5 → P6
G4: A1 → A2 → A3 → A4 → A5 → A6 → A7 → A8 → A9
G5: X1 → X2 → X3
completed map → six recap leaves → saved completed map → cover
```

There are **34 knowledge nodes**, **5 branch entrances**, **51 knowledge pages**, and **71 connections** (including the tree). The short P6 existence/uniqueness bridge adds one page without adding a graph node. Cross-connections unlock on the cue after both endpoints have been introduced, so a normal teach/return/advance route earns them after instruction. Their meanings and hypotheses are available through the quiet **Connections** disclosure. Dashed cross-links are distinct from the primary branch paths. Zoom/pan reveals full node names and notes; overview labels shorten automatically.

`G` is a final-state Mini-map preview, not a teaching step. Back returns to the previous context. Home closes directly; it does not first display the full map. `S` finishes motion, `R` replays an entrance, `M` toggles effects, `F` enters fullscreen, and `C` shows/hides the quiet presenter cue. Its Restart demo button resets only the current illustration. There are no automatic slide advances. Multi-step demo buttons use the same reversible beat controller as Right/Left. Sliders retain native arrow-key adjustments when focused; Tab away to resume presentation navigation. Opening the Mini-map allows free browsing of every content node; G1–G5 remain noninteractive category labels. Returning to ordinary guided playback preserves its earned progression.

## Pacing and demonstrations

Plan about 2 / 5 / 2 / 7 / 3 / 7 / 3 / 1 minutes for F0 / limits / first properties visit / derivatives / MVT visit / analysis / approximation / ending. The total is approximate. Prioritize the diagrams at P2, D3, P4–P5, A5–A8, and X1–X3. Read the formula tables quickly; the L6 witness and X3 quantitative bound can be brief reminders. A full discussion of every control will take longer than 30 minutes. The teacher controls all holds.

| Illustration | Mathematical action |
| --- | --- |
| F0 | Three domain inputs map to two reached outputs inside a larger codomain; the points move into graph coordinates. Restrict x² to a half-line, reverse its input/output rule, or recall strict monotonicity. |
| L1–L2 / P1 | Removable value, left/right agreement, jump, and signed infinity use correct separate branches. |
| L3 / L5 / L7 | Explicit dominant-power division and sign at ±∞; still-oscillating squeeze envelope; ε band and sufficient δ = ε/2 for 2x + 1. |
| L6 | Seven indeterminate forms versus determined powers; product, conjugate and logarithm transformations; four-condition checklist; three diagnoses and two oscillatory comparisons. |
| P2 | Move the IVT target; mark **every** cubic intersection, including a turning-level tangency. |
| D1 / P3 | Secant-to-tangent on x², then incompatible one-sided slopes at a continuous corner. |
| P4–P5 / P6 | Rolle keeps equal endpoints; MVT starts with a nonmatching tangent and lets the teacher find the secant rate. Strict monotonicity contrasts with a zero derivative. |
| D3–D4 | Five complete nested x-expressions peel into accumulated factors; x^x becomes a logarithmic product. |
| D5–D8 | Circle tangent with vertical positions; equal-scale inverse reflection; principal sine branch reflection; fixed ladder with finite time rates. |
| A2 / A4 | Critical-number candidate comparison; a separate Fermat assumption audit includes an endpoint counterexample. |
| A3 / A5–A6 | Attained vs lost endpoint extrema; moving tangent and sign chart; changing concavity vs a missing graph point. |
| A1 / A7–A8 | One model x + 1/x supplies domain, asymptotes, critical points, signs, concavity and final disconnected curve. |
| A9 | A farmer’s 12 m fence constrains a nondegenerate rectangular field; the square attains a proved global area bound. |
| X1–X3 | The same square-root model at 4: zoom, tangent-predicted dy, actual Δy, signed error, and concavity reversal. X2 builds slope → dx → dy → actual change, then magnifies the difference on a separately labelled axis; X3 uses that same inset for error sign and concavity. |

## Editing this folder

- `deck.ts`: cover, composition, route and the single `includeSecondAct` choice.
- `knowledge-graph/graph.ts`: labels, positions, node/page references, orientation.
- `knowledge-graph/connections.ts`: stable edge IDs, types, meanings, prerequisites and unlock steps.
- `nodes/`: concise typed teaching pages, grouped by branch; teacher-only hypotheses/source notes live on each page’s `notes` field.
- `slides/`: small data builders, teaching order and six recap leaves.
- `demos/`: subject mathematics and SVG/DOM renderers using the existing BookDiagram and magical reveal primitives.
- `style.css`: scoped diagram styling, projection sizing and quiet graph semantics. It does not replace the book theme.

The normal final Mini-map scene remains separate from the saved-map recap return. The latter composes existing `restoreSceneId` and `parchmentDrop` actions; no second graph controller or ending animation was added. All six leaves and the final printed-map sheet use the finalized preprinted falling-paper behavior, which supersedes older fire-writing-during-fall wording.

Ordinary node returns retain the existing graph and camera: only the next path/node delta ignites. The camera establishes the source/path relationship, follows long routes and settles on the readable target; distant nodes may be offscreen. Fit frames only visible elements; Mini-map is the separate full-state preview with intentional page travel.

The optional `guidedRoute.steps` data declares graph cues, selected node IDs and earned unlocks. Each demo has its own node/slide identity and reversible controller. The engine contains no Calculus-specific navigation conditions.

Only small generic compatibility fixes were needed outside this folder: optional guided branch cues, non-ranking semantic edges, cached normalized seal anchors, and correct graph restoration when effects are disabled. Other decks retain their existing defaults. Future subjects still require only their own content folders; see the root `CONTENT_AUTHORING.md`.

## Mathematical and source notes

The authoritative content brief is the root `AGENT_CONTENT_CALC1.md`. The supplied sources remain in their original root locations:

- `Calculus_Lec_1_01_04_ (2).pdf`, 119 pages: lecture scope and theorem assumptions. In particular pp. 79–80/106 for approximation error, p. 96 for the course’s continuous inflection definition, and pp. 102–104 for L’Hôpital and Cauchy’s MVT.
- `TA Lecture Week 1.pdf`, 15 pages: functions, domain/codomain/range, inversion, monotonicity and principal inverse-trig branches.
- `115_1_Cal_05_Midterm_Review__Copy_.pdf`, 14 pages: review techniques and core formula scope. Its E1–E13 exercises are deliberately **not** reproduced in the slides.

No antiderivative/Taylor-polynomial nodes or separate problem mode were added. Reciprocal inverse-trig branch conventions differ in the supplementary material; the core projected reference deliberately uses only arcsin/arccos/arctan as the content brief requests. Instructor notes retain the distinction.

Important safeguards: inverse on the **range**; finite two-sided derivative limits; L’Hôpital requires deleted-neighborhood differentiability and a derivative-quotient limit; unknown hypotheses are not a verdict of invalidity; critical numbers must lie in the function domain; an inflection is continuous with an actual concavity change; tangent bounds require the whole relevant interval; dy is exact by definition while Δy ≈ dy is an approximation.

## Verification and limits

The production Chromium checks are in `tests/calculus-content.spec.ts` and `tests/calculus-flow.spec.ts`; representative frames are in `docs/qa/calculus/` and `docs/qa/calculus-flow/`. They audit the node inventory, every teaching page, formula rendering and overflow, the complete teach/return route, mathematical controls, touch gestures, offline operation, book travel, recap sheets and cached graph return. See [QA.md](QA.md) for the final run results.

Projection at 16:9 is the intended format. The overview deliberately abbreviates labels; pan/zoom to read full names and inspect dense cross-connections. Pacing is an authored plan rather than a timed 30-minute playback. Touch QA uses Chromium’s native input emulation, not a physical tablet. No push or publication is part of this implementation.


The v4 local-model story joins X1 → X2 → X3 without intermediate map detours.
The node label changes at each boundary; slider state carries forward, and Left
returns to the preceding concept's final beat. After X3's final circle-area page, the
map reveals the deferred X2/X3 nodes and their paths together. Escape remains an
explicit map return, and G remains the independent Mini-map preview.

L6 now checks four assumptions in guided steps; D3 finishes with one horizontal
derivative; A9 models a farmer's 12 m fence, with the optimum justified only at
the final beat. X2 separates slope, dx, dy, actual change and a magnified error
inset. X3 studies the error's sign and size on that same honest-scale geometry.
See [v4 verification](QA_V4.md) for current test evidence and limits.


Mini-map is a free browsing view: after its reveal, all 34 content seals are clickable,
including lessons not yet taught. G1–G5 remain non-interactive category labels. Browsing does not advance the guided cursor
or complete/unlock lessons in the teaching sequence. Back leaves Mini-map and
restores the original guided cue and its normal locks; Home → normal opening
starts the guided lesson again.


## L6 and measurement-error additions

L6 begins with four short pages: **First Identify the Form**, product → quotient,
conjugate rationalization, and positive-base logarithms. Right introduces each
form or algebraic step; Left reverses it. The three power micro-examples share
one page and never occupy the screen simultaneously. Existing applicability
checks and diagnoses follow unchanged. After the lecture witness, one final beat
recalls `x sin(1/x) → 0` by squeezing despite its oscillating derivative.

The shared X1 → X2 → X3 square-root demonstration and quantitative bound still
come first. **From Input Uncertainty to Output Error** then distinguishes
absolute, relative and percentage output perturbations from the signed tangent
residual. **A Small Radius Error, Twice the Area Error** compares exact circle
area changes with their differential predictions. Right animates +1%, −1%, and
+0.5% radius changes; the optional radius slider explores −5% to +5%. The annulus
uses the true geometric scale; a separately labelled ×10 radial-edge inset
makes small perturbations visible without distorting the circle. Exact changes are +2.01%, −1.99%, and +1.0025%; first-order predictions
are +2%, −2%, and +1%. Magnitudes use absolute values; relative errors require
a nonzero reference output.

These additions introduce six pages within existing nodes, with no graph, engine
or navigation changes. All instructional beats use the shared magical reveal.
The new content renderers are `demos/limit-forms.ts` and
`demos/error-propagation.ts`; presentation text remains in `nodes/`. Allow a few
extra minutes if discussing every micro-example; no lesson is automatically timed.
