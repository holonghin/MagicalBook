# v3: one reversible opening/closing journey

## Why opening and closing felt different

Previously the opening consisted of 1900 ms of book motion **followed by** 1050 ms of inscription, while closing did only 1900 ms of book motion. On top of that, four leaves were used on entry, three on exit, with different start times and turning geometry. This made closing shorter and visibly discontinuous.

## Changes

- `src/engine/presentation.ts`: opening and closing now evaluate one `poseBookJourney(p, leaves)` method. Opening plays `p: 0 → 1`; closing plays `p: 1 → 0`. Identical spine axis, same four leaves, exact reciprocal camera pose and page positions.
- Opening and closing both use `max(opening, closing) + .65 * reveal` milliseconds (before the tempo multiplier). For the sample deck both last **2582.5 ms**.
- Incoming ink appears during the final 33% of the book motion; outgoing ink burns away during the first 33% of reverse motion. No extra second of inscription tacked onto opening only.
- Page flipping spans a shared middle section and is automatically reversed in closing. The cover finishes folding last on exit, rather than being abruptly substituted at the end.
- Pressing Home during opening reverses from the **actual partial pose**, with no jump to a fully-open state.
- `tests/book-journey.spec.ts` adds reverse-pose and interruption checks; previous cover test was updated for the revised timing.

## Verification performed here

- Static TypeScript check for all `src/**/*.ts` using global `tsc`: passed.
- Browser rehearsal using Chromium and the fully inlined preview: opening, closing and Home reached expected states with **no JavaScript errors**. Comparing identical normalized fractions showed reciprocal cover/camera poses and matching leaf counts.
- Vite `npm run build` could not be fully run in this container due to missing npm package contents and package installation/network restrictions. Run `npm ci && npm run build` on your PC.

## Visual limitation

This is still CSS 2.5D: paper does not deform like a true 3D mesh. The result has more coherent direction/timing, but you may still want further art-direction polish later. No attempt was made to redesign the book assets or math content.
