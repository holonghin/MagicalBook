# Book animation fixes — 2026-10-19

Based on the user-supplied `MagicalBook.zip`, these changes target the opening/closing geometry without redesigning the subject-independent presentation engine.

## Fixed in source

1. **Closing leaf direction:** Removed the `i % 2 === 0` alternating reverse flag. All ceremonial leaves now turn around the **same central hinge**. During closing, visible leaves go from edge-on (-90°) to lying on the right half (0°). Opening continues turning right-to-left (0° to -180°).
2. **Brown center stripe:** Narrowed `.center-fold` from 7% to 2.4%; softened its gradient, removed the extra hard 1px line, and reduced opacity. The fold still fades while zooming toward content.
3. **Cover layer pop:** Removed the instant `z-index` jump at fully open. Cover stays on one stacking plane with a short opacity handoff while nearly open, to reduce popping of its dark lining.
4. **Content disappearing during closing:** The page ink now fades with the shrinking book while leaves pass over it instead of vanishing abruptly at one progress value. Opacity is reset after transitions and on cleanup.
5. Added browser-level regression checks in `tests/book-geometry.spec.ts` for leaf turning directions, spine behavior and Home cleanup.

## Verification performed

- Static TypeScript type check of application sources with a globally available TypeScript compiler **passed** (`tsc --noEmit --target ES2022 --module ESNext --moduleResolution Bundler --strict --skipLibCheck --lib DOM,ES2022,DOM.Iterable --typeRoots /tmp/empty-types src/main.ts`).
- The regular `npm run build` could **not be completed here**: installing the ZIP's dependencies did not finish in this environment, leaving incomplete `node_modules`; the resulting TypeScript complaint was about a missing `@types/estree` package, not the edited application code.
- Browser visual regression tests also could **not run here**: browser navigation was blocked by the execution environment. **Please visually inspect the repaired animation on your computer**, especially the intermediate opening and closing frames. No claim of visual perfection is made.

## Run locally

```bash
npm ci
npm run build
npm run dev
# optional automated checks after successful build:
npm test
```

This repair is intentionally targeted. A truly deforming, physically accurate 3D page stack would be a more extensive rewrite than the CSS 2.5D illustration presently used.
