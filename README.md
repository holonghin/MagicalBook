# Grimoire — Phase 1 template engine

A reusable Vite + TypeScript presentation engine styled as an illustrated fantasy-anime grimoire: painted dark leather, heat-stamped lettering, manuscript parchment, and spatial ember-to-ink inscription.

**Template only.** The default **Atlas of Wonder** is a complete engine showcase. Calculus I remains a content specification pending review.

To create another presentation, copy `src/content/sample/` or `src/content/plain/` to a new folder and edit only that folder. It is discovered automatically at `?deck=<folder>`. See [CONTENT_AUTHORING.md](CONTENT_AUTHORING.md) for the working contract.

## Run

Use Node.js **22.12+**.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. The book waits for a click or Enter.

```sh
npm run build
npm run preview
```

The build runs strict TypeScript checking and writes a static site to `dist/`. Serve it over HTTP; ES modules cannot run by opening `index.html` with `file://`. There are no CDN calls, remote fonts, accounts, or runtime services. After dependency installation, local build and presentation need no Internet.

## Included decks

| Query | Purpose |
| --- | --- |
| none or `?deck=showcase` (`demo` alias) | Complete showcase: ink, three paper burn-throughs, single/parallel graph growth, horizontal/vertical layouts, node demos, two recap leaves, final map and closing |
| `?deck=sample` | Minimal content-folder example with a two-node graph and no second act; copy this folder |
| `?deck=plain` | Different subject, two pages, no diagram, graph, drop or epilogue |
| `?deck=orientation-check&case=THVH` | Content-only orientation/preview specimen; also FH, FV, THV, TVH and TVHV |
| `?deck=scale-check` | Generic 37-node readability specimen with compact titles, branch roles and close-up notes |
| `?deck=route` | Progressive route, node visits/return, two optional summary scenes and saved-map handoff |
| `?deck=type` | Native MathML specimen with fractions, powers, subscripts, radicals and three rows |
| `?deck=wonder` | Original five-scene linear demo, retained through the compatibility path |
| Add `&rehearsal` or use `?rehearsal` | Exposes `window.grimoire` for timeline seeking and integration checks |

## Presenter controls

| Key | Action |
| --- | --- |
| Enter / click cover | Open |
| Right / Space / Page Down | Finish motion; on the next press, reveal a beat or burn into the next scene |
| Left / Page Up | Burn away the current beat or burn back into the previous scene |
| S / R | Finish animation / replay entrance |
| P / M | Pause motion / toggle effects |
| F / Home | Fullscreen / close to the original cover |
| G | Mini-map: cinematic shortcut to the complete graph; Next closes |
| Escape | Return from a route node or close the guide |
| ? | Guide and animation tempo (½× / 1× / 2×) |

Controls live in the quiet **⋯** drawer at the bottom-right; **?** opens the guide. Home immediately starts the complete closing sequence, including from a focused demo control or paused animation. Other form-control keys retain their own behavior. There is no timed page advance. Held navigation keys do not repeat. Switching tabs pauses running motion; use P or S when returning. System reduced-motion preferences are honored.

## Architecture

- `src/engine/`: typed deck data, explicit presenter states, beats, node return state, scene cache and keyboard mapping.
- `src/effects/`: one requestAnimationFrame timeline, seeded reveal/erase masks, full-spread camera and cover/page transforms, focus framing and coordinated parchment drop.
- `src/components/`: book/page renderers, diagram wrapper, persistent graph layouts/path ignition, local KaTeX and legacy MathML support.
- `src/styles/` and `src/assets/`: three-layer typography, original illustrated SVG leather/parchment, layouts and discreet controls.
- `src/content/<deck>/`: all titles, wording, lecture order, nodes, connections, demos, scoped CSS and optional recap. `deck.ts` is the automatically discovered entry point.
- `src/engine/content.ts`: typed content compiler, semantic transition conventions and validation. New folders never register themselves in `main.ts`.
- `src/decks/`: compatibility re-exports for earlier imports; actual example content lives under `src/content`.
- `tests/`: production-build browser checks; `docs/qa/`: representative screenshots.

See [content-folder authoring](CONTENT_AUTHORING.md), [legacy authoring and motion details](docs/AUTHORING.md), and [QA notes and limitations](docs/QA.md).

## Test

```sh
npm ci
npx playwright install chromium
npm run build
npm test
```

Tests launch the production preview and exercise the complete showcase, browser console, book continuity, seeded combustion, graph path/node sequencing, mouse/touch gestures, node return, reduced motion, offline operation and content validation. v6 adds all three authored orientation modes, H→V→H / V→H→V timelines, isolated final previews, exact restart-flash regression, layout anchors and accessible idle controls. Intermediate frames are saved under `docs/qa/v6-*.png`. See [current verification](docs/POLISH_V6.md).

## GitHub Pages deployment

1. Create or choose a GitHub repository and push this project to `main`.
2. Under **Settings → Pages → Build and deployment**, select **GitHub Actions**.
3. Push to `main`, or run **Deploy grimoire to GitHub Pages** manually in Actions.
4. The workflow installs locked dependencies, builds, runs Chromium tests, uploads `dist/` and deploys. The deployment step reports the published URL.

Vite uses `base: '/MagicalBook/'` for this repository. The deployed URL will be
`https://YOUR_USERNAME.github.io/MagicalBook/`. Local dev and preview also use
`/MagicalBook/`; deck queries follow that path, for example
`http://127.0.0.1:4173/MagicalBook/?deck=sample`.

Only the built `dist/` artifact is published to Pages. Git stores the source,
content, tests and project documentation, excluding dependencies, generated output,
archived Codex revision prompts, test recordings, backups and local secrets.
Authoritative `AGENT*.md` contracts and maintained QA/authoring documentation remain
included. See [deployment preparation and exact first-push commands](docs/DEPLOYMENT.md).
No repository, push or live deployment was created during preparation.

## Authoritative specifications

Read [AGENTS.md](AGENTS.md), then [AGENT_TEMPLATE.md](AGENT_TEMPLATE.md), then [AGENT_CONTENT_CALC1.md](AGENT_CONTENT_CALC1.md) before extending the engine or adding its first full subject deck.

Archived local Codex revision prompts are deliberately excluded from Git. Their
implementation history and browser evidence remain in the maintained reports:
[v3](docs/POLISH_V3.md), [v4](docs/POLISH_V4.md),
[v5.1](docs/POLISH_V5_1.md), and [v6](docs/POLISH_V6.md).

The self-contained `src/content/showcase/` is the complete reference to copy;
`demo/` is a compatibility entry. Content declares fixed-horizontal,
fixed-vertical or step-indexed timeline orientation. Mini-map previews the authored
final state without changing slideshow progress. The main optional cinematic
setting remains `secondActEnding: { enabled: boolean }`.

The next step is Phase 1 review, before implementing the full Calculus I deck.

[Graph reveal fix v2](docs/GRAPH_REVEAL_FIX_V2.md) adds repeatable graph entrance
inscription and a centralized 2300 ms full-map budget after physical travel.
Small overviews keep regular path-to-node burning; longer overviews resolve
remaining marks in a coordinated 350 ms ink handoff. Normal teaching keeps its
existing timing. Content folders require no new effect settings.
