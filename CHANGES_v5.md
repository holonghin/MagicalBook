# v5 — Reversible book polish + optional Paper Burn Through

Base: ongoing v4 book opening/closing polish (earlier camera recenter, longer cover swing, leaf-edge curl and page timing).

## New reusable scene transition

`paperBurn` is selectable by Content, and not enabled by default.

- For ordinary slides: `effect: 'paperBurn'`, optionally `paperBurn: { duration: 1400, ignitions: 1, charWidth: 10 }`.
- For route graph ↔ node transitions: `routeGraph.transitions: { enterNode: 'paperBurn', returnToGraph: 'paperBurn' }`.
- Route demo: open `?deck=route` and click the first graph node. Press Escape to return.
- The outgoing page remains opaque and legible outside random growing holes. The burn edge is black/brown char with a thin ember rim. New scene is underneath. No floating paper overlay is introduced.
- Each transition uses a seeded random ignition point (or multiple optional points). A new entrance receives a new seed but can be reproduced by deterministic test setup.
- If the special transition is omitted, normal magical-ink navigation remains unchanged.
- Safe cleanups remove masks and overlays on skip/Home/navigation.

## Book motion

The book uses the v4 physical motion revision already in progress: slower visible cover swing, earlier camera recenter, and slight curled page lips. These are visual approximations of a book, not a paper physics simulation.

## Validation

Run `npm ci && npm run build && npm run dev` in the project root. Route smoke test: `?deck=route`; optional Playwright test: `npm test -- tests/paper-burn.spec.ts`.
