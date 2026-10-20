# Book animation repair — revision 2

This patch addresses the opening/closing defects visible in `IMG_7034.mp4` while preserving the existing illustrated appearance.

## Changes

- **Cover title showing through the back**: the front face of the cover has a controlled visibility curve derived from the same hinge angle as the outer cover. `cover-face` and its text descendants explicitly prevent backface rendering. The inside lining remains separate from the stamped front cover.
- **Closing pages emerging as stiff, upright cards**: replace the half-turn `-90° → 0°` closing motion with `-180° → 0°` around the shared center hinge; introduce sheets at staggered intervals only after the halfway turn and reduce the closing sequence to three ceremonial sheets.
- **Timing and alignment**: overlap the last turning leaves with the closing of the outer cover, and keep the page ink attached to the same retreating camera transform.
- **Previous repair retained**: narrower fold gradient, no abrupt cover `z-index` switch, and a single closing-sheet direction.
- Added regression checks under `tests/cover-continuity.spec.ts`.

## Installation

1. Back up your current project directory.
2. Prefer the **complete** repaired project ZIP, which includes `src`, `docs`, configuration, lockfile and test files. Or take just the three modified source files from the patch ZIP and copy them to the matching paths in an otherwise complete original project.
3. In PowerShell, from the project root:

   ```powershell
   npm ci
   npm run build
   npm run dev
   ```

4. Test opening, the Home closing sequence, and replay. Avoid mixing only part of this patch with old versions of `presentation.ts` and `book-motion.ts`.

## Verification and remaining limitations

- TypeScript source check completed successfully with the global TypeScript compiler.
- Browser-tested in Chromium using a local in-memory ES2022 transpilation of the actual source, with representative mid-animation screenshots and no JavaScript errors. This bypasses the package manager but executes the same animation code.
- Full `npm run build` (Vite) and the packaged Playwright suite were **not** run in this environment because package dependencies could not be fetched. These commands must be run on your machine.
- The book remains a CSS 2.5D book: its sheets are flat hinged planes, **not** real flexible / curved paper. A fully physical paper deformation would require a larger refactor than this safe bug fix.
