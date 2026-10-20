# Falling-paper occlusion refinement

The latest `revisited.md` request supersedes the earlier drop/inscription-overlap
direction. Falling sheets now carry their initial slide content already printed.
Ordinary magical burns, graph teaching, book opening/closing and the Pages base
path are retained.

## Behavior

The former drop path mounted the destination as the sole page before moving it.
The outgoing page had already been detached, leaving a blank parchment background.
The new path keeps an explicit background page, projected shadow and opaque
incoming sheet. During normal drops the actual outgoing DOM stays mounted,
preserving live illustrations, controls and canvas pixels. Its ink is never
erased, faded or cleared. The incoming paper alone occludes it.

The presenter keeps the source index, beat and active scene until the printed
sheet has completely landed and settled. Only then does it activate the new
scene and detach the covered background. Future reveal beats still follow the
authored content; initial visible content is already printed on the sheet.

Back lifts the printed foreground paper over the already rendered previous page.
A return to the graph through this physical lift exposes the retained printed
map directly; other graph entrances and Mini-map still use their existing burn
choreography and full-map budget. Back during descent retraces the current sampled
pose rather than snapping the sheet to its destination first. Replay restores the
same source backdrop with a newly sampled motion profile. Replay snapshots copy
canvas pixels rather than relying on an empty canvas clone.

## Motion and lifecycle

One existing seekable timeline drives the entire composition:

- Normalized gravity/air-drag travel with a final air-cushion slowdown.
- Seeded initial position, lateral drift, flutter, pitch/yaw and rotation.
- Separate moving shadow with changing offset, blur and opacity; the paper's
  worn-edge clipping cannot cut this shadow away.
- Small damped contact/landing motion, ending at the exact settled page pose.
- Fully opaque paper and crisp printed content throughout.

Randomness is sampled once per invocation. Seeking and reverse use that same
profile. Skip, reduced motion, effects toggles, Mini-map and Home resolve or clean
the two page layers and shadow through the existing timeline coordinator. No
subject-specific branches, new content settings or independent timers were added.

## Files

- `src/engine/presentation.ts`: explicit pending paper composition, deferred active
  scene, source retention, printed content, reverse/cancel/replay and cleanup.
- `src/effects/drop-profile.ts`, `src/effects/book-motion.ts`: sampled contact,
  drag, damped settling and projected-shadow motion.
- `src/styles/book.css`: background, paper and shadow stacking.
- `tests/falling-paper.spec.ts`: physical occlusion and state timing, unchanged
  outgoing DOM, live SVG/canvas retention and replay pixels, reverse pose,
  interruption, reduced effects and temporary-layer cleanup.
- `tests/showcase.spec.ts`, `tests/polish-v5-1.spec.ts`,
  `tests/graph-reveal.spec.ts`: replace superseded overlap assertions with the
  printed-paper contract; retain other animation/progression checks.
- `AGENTS.md`, `AGENT_TEMPLATE.md`, `CONTENT_AUTHORING.md`, `README.md`,
  `docs/QA.md`: current template contract and authoring guidance.

## Browser evidence and validation

Intermediate Chromium captures are under `docs/qa/falling-paper-*.png` at initial,
18%, 32%, 48%, 62%, contact/settle and landed poses, plus the reverse lift.
Inspected frames show the old title still readable below the approaching sheet,
then naturally covered by the incoming printed page. Browser hit-testing verifies
the old page at the center before coverage and the incoming paper afterward.
DOM/mask checks ensure that apparent coverage is not an old-page fade or erase.

`npm run build` passes strict TypeScript and Vite production compilation.
`git diff --check` reports no whitespace errors (Git prints its normal Windows
LF/CRLF conversion notices).

The complete 61-case Chromium run passed 59 cases in 7.8 minutes. Two checks hit
an `ERR_NO_BUFFER_SPACE` browser resource error and an `UNKNOWN` screenshot-file
write error respectively. Neither was a paper-motion assertion failure, and the
console-error checks were retained rather than filtered out.

After the repeated-Back refinement, **all 20 affected tests passed on the final
production build in 3.2 minutes**, including both initially affected checks,
physical occlusion, live SVG/canvas and replay pixels, five varied deterministic
falls, reverse lifts, rapid cancellation, Home/Mini-map cleanup, reduced motion
and the complete showcase. The other 41 cases passed in the preceding full run,
covering book continuity, graph reveal timing/orientation, native touch and the
`/MagicalBook/` deployment path. All 61 current cases therefore passed across
these runs. Final affected checks reported no browser warnings/errors or uncaught
page exceptions.

## Limits

This remains an illustrated CSS 2.5D sheet with a bounded motion model, not a
deformable-paper or fluid simulation. Normal drops keep live source DOM; replay
uses a frozen source snapshot. Chromium is the verification browser; physical
tablets and Firefox/Safari remain unverified. No Calculus I content or deployment
was added.
