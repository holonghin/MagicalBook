# AGENT_TEMPLATE.md — Reusable Grimoire Presentation Engine

> **Role:** You are the visual-design and front-end implementation agent for a reusable, browser-based presentation template. Build the **presentation engine**, not a presentation that is hardcoded to one subject.
>
> **Boundary:** This file defines the look, motion, controls, architecture, and quality requirements. `AGENT_CONTENT_<DECK>.md` (or another deck-specific content file) defines the cover title, subject matter, pages, routes, diagrams, teaching priorities, and timing. Never move subject-specific material into this template spec.

## 1. Product concept

A presentation should feel like an **ancient magical book coming to life**: dark brown leather, gold embossing, parchment pages, handwritten-looking typography, and text that **materializes through spreading magical fire / illuminated ink**. Think of a memorable anime-style spellbook, but with polished typography and the reliability of a real classroom presentation.

This is a **general-purpose presentation template** for many subjects, not a one-off course website. It must support ordinary linear slides, interactive diagrams, and optionally a progressively revealed node/path/knowledge-map experience. The topic, page count, graph structure, and number of branches all come from content data.

**Key experience:** The content does not simply fade or type into existence. It should appear as if many small patches of warm, glowing magic spread across the parchment, **leaving fully formed, permanent ink behind**.

## 2. Strict separation of responsibilities

| Layer | Owns | Must not own |
|---|---|---|
| **Template / presentation engine** | Book cover and opening, page geometry, fonts and palette, page-turn transitions, magical-ink reveal, controls, responsive behavior, reusable layouts, optional graph navigator | Specific slide text, formulas, named theorems, examples, prescribed chapter routes, specific timetable |
| **Deck-specific content** | Title, author/metadata if any, ordering, text, formulas, diagrams, pages per topic, graph nodes/edges, speaker guidance, pacing, reveal sequence | Animation engine code, CSS theme implementation, event handlers |
| **Optional visualizations** | Interactive graph/diagram widgets or subject-specific demos | Presentation navigation and common book rendering |

Build the engine so another presentation can replace the content data without changing any transition or styling code. Do not assume any default first-page concept, branch count, ending title, or that every deck has a graph.

Read the selected deck-specific `AGENT_CONTENT_<DECK>.md` before generating its slides. This does not make that subject part of the generic template.

## 3. The cover and opening

1. Load into a **closed 3D-looking book**, centered on screen; no visible slide or full diagram behind it.
2. Use textured, dark-brown leather-like styling with subtle stitching/ornaments; **emboss the configurable deck title in gold**, rather than hardcoding text.
3. Wait for a real click/tap/Enter. The book must not open automatically.
4. On interaction: cover opens around a believable spine, several parchment sheets flip rapidly, then the first presentation page settles into focus.
5. The opening feels cinematic **once**, but ordinary page transitions should be quick. Provide a skip-opening option for rehearsal.
6. After opening, the viewer enters a consistent book-page presentation environment.

Depth, shadow, page stacking, hinge, and layered page-turn motion matter more than exaggerated particle counts. Avoid sound by default.

## 4. Visual language

**Palette:** deep espresso / leather brown, aged cream parchment, charcoal or dark sepia ink, muted metallic gold, small amber/fire highlights. Contrast is essential for a projected classroom.

**Typography:** distinctive handwriting/calligraphic display face for covers and headings; readable handwriting-inspired or bookish serif for body. Math, code, tables, and symbols (when present) use highly legible specialized glyphs. Do not force ornate script on every letter if it harms legibility. Provide offline-safe fallbacks; don't package or redistribute proprietary font files.

**Page composition:** generous whitespace, restrained ornamental corners, subtle paper grain, optional book margin and page number. Content should **feel like slides, not manuscript pages**. Support one-column formula-centered pages, concise two-column comparisons, illustrated pages, and diagram-focused pages.

**Density:** One main thought or compact derivation per page. Prefer short phrases and a prominent visual/formula. If it becomes crowded, split it into two pages; do not simply shrink all the text. Keep body text readable from the back of the room.

## 5. Signature animation: magical ember / ink propagation

This is the **highest-priority visual feature** and is required on all slide-content reveals, including headings, body text, formulas, and short lists. It should look like **writing emerging from spreading enchanted fire**, NOT like a typewriter or line-by-line ordinary fade-in.

### 5.1 Desired visual stages

1. **Dormant:** parchment is blank where the content will appear (layout space already reserved).
2. **Ignition:** tiny warm glints/embers emerge at one or several locations within the *actual shape/area* of the content.
3. **Propagation:** irregular glowing fronts spread outward through nearby character strokes or content masks. The revealing region follows several organic expanding islands, rather than a perfectly straight horizontal wipe.
4. **Ink settling:** behind each front, dark readable permanent ink is revealed. Glow rapidly subsides; letters and equations remain crisp, opaque, and still.
5. **Complete:** no distracting continuous flame, shimmer, or animation remains on text after the reveal.

The effect is **revelation**, not destructive page burning. Do not leave charred holes that erase content or damage legibility. A hint of ember dust / sparks is fine, but it must be subtle.

### 5.2 Multi-line text is NOT sequential typing

For paragraphs, multiline equations, bullet groups, and multiple content blocks:

- Start **multiple reveal fronts concurrently** (e.g., different positions within different lines, or several spots scattered over the full text group).
- Let the fronts spread and overlap in slightly different directions and speeds.
- Use slight randomness in origin, radius, turbulence, and timing so the next page does **not** always reveal from top-left to bottom-right.
- Some regions can appear earlier than neighboring ones. The overall effect should feel magical and spatial, not like reading-order typewriting.
- **Do not wait for line 1 to finish before line 2 starts.** For 3+ lines, their reveal windows should substantially overlap.
- Use **seeded randomness** per page/element so reverse/forward navigation and rehearsal are reproducible. Different slides may use different seeds.
- Do not reveal totally unrelated offscreen pieces; spread remains visually connected to the words or regions being formed.

**Preferred motion:** several small ignition points → growing irregular glowing islands → content revealed behind them → brief glow dissipates.

### 5.3 Timing and layering

- Small heading or node label: approximately **0.3–0.7 seconds**.
- Typical slide text/formulas: approximately **0.6–1.2 seconds**; complex content may be somewhat longer.
- Page turn: roughly **0.35–0.65 seconds** for ordinary teaching navigation.
- Opening sequence: longer than a normal transition, with a clear skip.
- Make all durations configurable at the template/deck level.
- Animate the content **after** the new page has turned into place, or slightly overlapping its final settling—not while the page is still illegibly moving.
- Keep a low-motion fallback and a **reveal instantly** path. The instructor should never be trapped waiting for decorative effects.

### 5.4 Technical suggestions (not mandatory implementation)

A robust approach is to render the final text/formulas first, then conceal them with an **SVG mask / clip-path or canvas-generated alpha mask**. Animate an organic propagation field with a handful of moving radial sources and slight distortion. Draw a narrow golden/amber glowing edge around the advancing reveal and mild particles there only. When the mask reaches 100%, remove the effect layer and retain **untouched, sharp final text**.

- Mask entire laid-out text groups rather than revealing individual characters in sequence.
- For math formulas, wait until rendering/typesetting and layout measurements are complete before masking. Avoid clipping fraction bars, superscripts, accents, and long radicals.
- A reusable `MagicalReveal` effect should work on DOM text, optional rendered math, SVG labels, diagrams, and headings.
- Pre-allocate final layout dimensions to prevent line jumps and layout shift.
- Use composited transforms/opacity where possible; avoid a large particle simulation or costly per-frame DOM updates.
- The path-writing animation for node edges can be a separate SVG stroke-dashoffset/trim-path effect with a small illuminated leading tip.

### 5.5 Avoid these interpretations

**Not desired:** typewriter character reveal; a global fade-in; a uniform left-to-right wipe; only the first line being burned while later lines wait; flames covering already-readable text indefinitely; excessive smoke obscuring formulas; replaying slow effects on every back step.

### 5.6 Interactive demos must look like illustrations in the ancient book

**Mandatory: the antique magic-book visual style applies to ALL presentation content, not only text and page transitions.** Embedded graphs, dynamic visualizations, geometry diagrams, and mini-simulations must look and behave like enchanted illustrations on parchment. This rule is template-wide and applies to future subjects as well.

- **Canvas and palette:** draw the demo on the book's parchment, with sepia/dark-ink curves, axes, tangent lines, annotations, and restrained amber/gold highlights. Never jump to a modern white chart/dashboard, glass panel, unrelated neon theme, or full-screen app.
- **Typography:** use matching manuscript-like labels and clear mathematical glyphs. All labels and formulas must remain readable at classroom projection distance.
- **Magical entrance:** the *static* geometry and labels should be traced/inscribed with the same enchanted ember-to-ink reveal as other slide content. Curves may be drawn by a brief glowing tip; multiple labels and parts may ignite concurrently at spatially scattered locations.
- **Then animate the subject matter:** after initial inscription, keep the ink permanent and let the meaningful objects move smoothly and accurately (moving points, changing diagrams, highlighted comparisons, evolving timelines, graphs, etc.). Do **not** continuously burn or flicker moving graphs, and do not obscure content with smoke.
- **Progressive explanation:** add successive curves, lines, highlights, equations, and labels using short in-place magical inscribing effects when the presenter advances. Do not require a full page turn for each annotation.
- **Controls:** sliders, buttons, draggable points, hover states, and focus indicators must share the parchment/gold visual system and remain accessible. Controls must not trigger accidental slide navigation.
- **Reusable architecture:** make `BookDiagram` / `InBookDemo` wrappers and theme tokens reusable. A subject-specific demo may implement its own math logic, but cannot bypass the common book aesthetic.
- **Reliability:** interactive demos must not cause page reflow during reveals, must fit the book-page content area, and need reduced-motion and offline fallbacks.

**Acceptance examples across subjects:** a changing scientific plot, a moving geometry construction, an interactive timeline, a code execution trace, a molecular diagram, or a map must all look like animated ink illustrations **within the same manuscript**. Do not switch to generic dashboards, default chart canvases, or clashing tool UIs.

### 5.7 Reusable parchment-drop scene transition — opt-in effect

Offer **one general-purpose `parchmentDrop` visual preset**, usable whenever a deck asks for it: a section introduction, a sequence of short recap cards, a special concept, or a transition into another view. **The template does not prescribe that a deck has an ending recap, how many recap cards it has, or whether/where to use falling parchment.** All choices belong to deck content.

**Visual contract (Japanese-anime-inspired enchanted manuscript):**

1. A parchment sheet descends from the upper **foreground, facing the viewer**, with subtle perspective, slight tilt/flutter and moving shadow; it settles onto the open book/spread. Use a consistent manuscript paper texture and book lighting.
2. For a **content-card arrival**, start the existing multi-origin `magicalReveal()` **while the paper is still falling**, at roughly **two-thirds of its descent** (normalized drop progress ≈ `0.67`). Scattered ignition points spread across the title, caption, and any other lines **concurrently**. **At the instant the paper settles, a small portion (roughly 10–20%) should still be unrevealed.** The remaining fire/ink propagation continues for a short moment **after** landing until the text is completely crisp. Never implement this as sequential “land → start writing,” nor as “finish writing → land.”
3. For a **scene handoff**, use the *same* descending sheet and overlapping timing: any glow / magic-mark transition begins around two-thirds of descent and flows through the landing. The sheet can briefly veil the book, then lift, dissolve into gold dust, or turn away to uncover the content-designated target view. The target scene already exists or is restored by its usual scene renderer. If the sheet carries no text, use the same timing choreography for the transition effect; do not redraw cached graph nodes or labels.
4. A deck may use the same effect on **every beat** in a recap chain, including the transition after its last recap card. A deck may use it only once, in the middle, or not at all.

**Single coordinated timeline (must be implemented as one composition):** `drop(0–100%)` + `reveal(start at drop≈67%, finishes shortly after drop=100%)` + optional `handoff`. Parameterize `revealStartDropProgress` (default ≈ `0.67`) and the reveal tempo; for this presentation target approximately **80–90% text visibility at landing**, then complete the remaining 10–20% just afterward. Treat these as art-direction guides, not brittle frame-specific assertions. Drive the trigger from actual drop progress or a shared animation timeline, not an independent delayed timer, so seeking, replay, fast-forward, and slow-motion remain synchronized.

**Reuse / interface:** Prefer a single parameterized action such as:

- `dropParchment({mode: 'content', slideId, duration, seed, revealStartDropProgress: 0.67, ...})` — begin inscription during descent; land with some ink still forming; then finish
- `dropParchment({mode: 'transition', targetSceneId, exitStyle, duration, revealStartDropProgress: 0.67, ...})` — coordinate magical transition during descent, then uncover the chosen already-rendered scene

These are **illustrative API shapes**. The same paper mesh/DOM, physics-inspired transforms, shadow, easing and reveal primitives must be reused. Do not create an ending-only renderer or an alternative text animation.

**Practical constraints:** cinematic but short; manual step progression; no perpetual flicker. In particular, the text-reveal overlap with paper descent must remain smooth under back/skip/restart and at different frame rates; cancel the complete timeline together if interrupted. Reduced-motion mode may show the sheet and ink at once. Support offline resources, 16:9 projection, and readable content. If cards stack, manage the previous parchment's layering discreetly so pages never pile into illegible clutter. The presenter can advance before the optional flourish finishes.

## 6. Book page transitions

- A forward action should turn a page **toward the next spread**; backward reverses it.
- Keep page-turn depth/shadows and spine direction physically coherent.
- Use a fixed page frame during transitions so projected text doesn't bounce or resize.
- Prefer the impression of a **single readable page/spread** rather than squeezing real text across two tiny pages.
- Distinct page states and a reliable transition state machine are required: no double-turn or skipping due to rapid clicks.
- Content may be revealed through one or more beats per page when requested by content data; page-turn is not required between every equation line.

## 7. Optional route / knowledge-map mode

The **template must support** a progressive-route navigator, but it is **optional for future decks**.

When a deck supplies a graph:

1. Do not expose the completed graph prematurely if the deck requests a hidden-map narrative.
2. Reveal roots / branch labels / paths / nodes incrementally according to **content-supplied route steps**.
3. Paths trace outward with ember-lit strokes; a newly reached node blooms into ink.
4. Clicking an available node opens its content pages; after those pages, return to the route at the correct place.
5. Visited nodes remain identifiable; previously completed content should not disappear.
6. Cross-links appear only when content data says they are pedagogically ready.
7. The final reveal can pull back to show the entire connected map.
8. The number of branches and nodes, their labels, placement, path timing, and special detours come **only** from the deck content.

For decks without a graph, the same template should work as an elegant, ordinary linear magical-book presentation.

**Optional ending/epilogue (not required):** The engine must support **no recap at all** as well as a deck-defined sequence of recap cards or other final scenes. Ending recap presence, card order, text, and visual effects (including repeated parchment drops) are **deck-content settings**, not defaults in the engine. A graph deck may return to its existing completed-map state; a non-graph deck may return to an outline, closing title, or cover. The presenter advances between beats. Returning to a saved graph must **restore** it without rebuilding or re-inscribing its nodes.


## 8. Interaction / presenter UX

Default keys (make configurable):

- `→` / Space: next **reveal beat** or page
- `←`: previous beat or page, restoring the correct finished state without brittle reverse simulations
- Enter / click: activate focused node or begin opening
- Esc: exit a node to its route/section if relevant
- `Home`: start or return to cover (with confirmation if necessary)
- `F`: toggle fullscreen when browser permission allows

Use click/tap-friendly targets on branch/node screens, with simple navigation in normal slides. Prevent accidental advancing on interactive demos/sliders. Offer a discreet progress indicator and optional presenter/animation-skip control, without visible dashboard clutter.

**All visual effects must be interruptible**: fast-forward/skip-to-complete, back/forward stability, pause during discussion. Do not automatically advance lesson content on a timer. The instructor controls the pace.

## 9. Content interface / reusable components

Implement generic entities such as:

- `DeckConfig`: coverTitle, subtitle?, author?, language, theme, duration defaults, opening settings
- `Section`: title, pages, optional navigation/route metadata
- `Slide`: id, layout, content blocks, stepwise reveal groups, optional demo id
- `ContentBlock`: type (`heading`, `text`, `math`, `list`, `table`, `diagram`, etc.), content, emphasis, reveal behavior
- `RouteGraph` (optional): nodes, edges, coordinates, unlock and visit order
- `PresenterState`: current section, slide, reveal step, route state, visited nodes
- `EndingConfig` (optional): `enabled`, an ordered scene/step sequence, per-step effects (including optional `parchmentDrop`), target view, and close-book preference. Omitted or `enabled: false` means **no second-act recap**, not an error.

Do not make authors write raw HTML for ordinary content. Custom diagrams/demos can be plug-in components. Math renderer (e.g., MathJax/KaTeX) is an optional adapter for math-heavy decks, not a requirement imposed on non-math subjects.

A minimal example of **generic data shape** (illustrative only):

```js
const deck = {
  config: { coverTitle: "PRESENTATION TITLE" },
  sections: [{ id: "chapter-a", title: "Chapter A", slides: [
    { id: "slide-1", blocks: [
      { type: "heading", text: "Main idea" },
      { type: "text", text: "One concise thought." }
    ] }
  ] }],
  routeGraph: null, // optional; supply only for a graph-based presentation
  ending: { enabled: false } // optional; no second-act summary by default
};
```

The slide's content and the reveal engine must remain separate.

### 9.1 Reusable scene actions — especially the ending

The ending is a **composition of the same functions / components used during the main presentation**, not a separately coded cinematic scene. Write general-purpose, parameterized operations once, and call them in different sequences from deck data:

- `openBook(options)` / `closeBook(options)`: share the same book-cover/spine geometry, transform state, and motion system. Closing reverses the physical opening (with suitable easing), not a second visual implementation.
- `turnPage(direction, options)`: used for ordinary slides and recap pages alike.
- `magicalReveal(target, options)`: the same multi-origin ember/ink animation for headings, formulas, labels, and epilogue text; accept a seeded random origin and tempo.
- `focusView(target, options)` / `restoreView(options)`: zoom in on a point, node, or graph area, and return; avoid duplicating camera logic.
- `tracePath(edgeIds, options)` / `showGraph(options)`: graph path reveals, final overview, and restored overview reuse the same graph renderer and state.
- `playSceneSequence(steps)` (or equivalent orchestration): executes a data-driven list of generic actions, with explicit wait-for-input points.
- `dropParchment(options)` (optional): one reusable descending-sheet preset with `mode: 'content'` that **starts** the common `magicalReveal` at about two-thirds of the descent and **finishes it just after settling**, or `mode: 'transition'` that overlaps its magical handoff with the descent in the same way. It is **not limited to a finale**.

These are **illustrative API names**, not an imposed framework. Equivalent reusable abstractions are fine.

**Engineering requirements:**

1. Avoid ending-only copies of animation functions or copied DOM/graph construction code.
2. State transitions are explicit and replayable; going backward, skipping, or restarting cannot corrupt the active animation.
3. Cache/preserve the final graph layout and visited state. When returning from recap, display the same already illuminated graph, without burning all labels in again unless deck data explicitly requests it.
4. Use shared animation primitives (timeline, easing, mask, page transform, camera transform), with parameters for direction, target, speed, and appearance.
5. The closed end state returns to the **same initial cover component and deck title**, ready for another presentation, instead of creating a separate imitation cover.
6. Subject-specific ending **stages, recap enabled/disabled, text, selected effects and destination scenes** belong in the content file; the template exposes only generic sequence actions.
7. The *same* parchment-drop effect can be called repeatedly for multiple recap cards and for the final handoff back to a saved graph (if the deck has one); do not assume a recap uses ordinary page turns or that the final card gets a unique implementation.

### 9.2 Subject-agnostic modes and schemas

The engine must accept **any** subject, including mathematics, sciences, humanities, programming, or project presentations. It must not require the terms "theorem", "function", "node", or "graph" to appear in the content. Presenters can use:

- **Linear deck:** ordinary sections/slides, without any graph.
- **Outline/route deck:** a staged section path, optionally clickable.
- **Knowledge map deck:** a graph with cross-links and revisit points.
- **Hybrid deck:** ordinary slides plus optional route/graph transitions.

Generic block types should include: `title`, `paragraph`, `bullets`, `quotation`, `math`, `code`, `table`, `image`, `diagram`, `interactive`, `comparison`, and `caption`. Unknown specialized block types must fail gracefully or use a deck-supplied renderer; never silently discard content.

**Content-driven ending:** expose reusable scene actions (`focus`, `pageTurn`, `reveal`, `restoreMap`, `closeBook`, optional `parchmentDrop`) but **never** hardcode what the ending is about. A non-map deck may close directly after its final slide. A deck may also choose no theatrical finale.

**Avoid over-automation:** no automatic next-page timing; only the instructor advances. Multiple blocks on a single page may reveal concurrently within the same requested beat. Do not interpret every line as a separate step.

## 10. Project organization

Suggested module boundaries (adapt names to project tooling):

- `index.html` — application shell
- `src/engine/` — navigation, state machine, transitions
- `src/effects/` — burn/ink spread, page-turn, edge reveal
- `src/components/` — cover, book, slide layouts, optional route graph
- `src/styles/` — theme tokens and typography
- `src/decks/<deck-id>/` — **subject-specific** configuration, content, route, diagrams
- `AGENT_TEMPLATE.md` — **this generic template spec**
- `AGENT_CONTENT_<DECK>.md` — content brief for the selected deck
- `AGENTS.md` — small Codex bootstrap file that points to these specs

Aim for clean reusable modules instead of a monolithic HTML document.

## 11. Accessibility, reliability, and performance

- Ensure all content is readable **without** animation (reduced-motion or effects-disabled mode).
- Honor `prefers-reduced-motion`: use an instant reveal/simple transition alternative.
- Keyboard navigation and focus should remain usable.
- Ensure high text contrast and projector-friendly sizes.
- Once text is revealed, it remains sharp and selectable, not a canvas-only screenshot.
- Graceful fallback if animations fail or GPU acceleration is limited.
- Layout should work in widescreen projector mode (16:9) and a normal browser window.
- No dependence on network during class for core content or any essential specialist rendering; test offline mode.
- Avoid huge GPU filters, giant full-screen particle systems, or continuous unnecessary animation.
- If any external assets are used, ensure appropriate usage rights. Do not package font files for sharing.

## 12. Acceptance criteria / self-test

The template is not finished until these conditions hold:

- [ ] Replacing the deck data with a completely different topic does **not** require editing the engine.
- [ ] Cover title is data-driven; no subject name is hardcoded in the template.
- [ ] The closed book opens only on interaction; rapid page flip works.
- [ ] Normal pages turn smoothly and are readable.
- [ ] **Every text-content entry uses magical propagation reveal** (unless intentionally disabled in data).
- [ ] A three-line text block shows **concurrent, spatially scattered ignition fronts** across multiple lines—not a typewriter effect.
- [ ] Multi-line formulas or other complex text blocks reveal without clipping or reflow.
- [ ] Every diagram and interactive demo uses the same parchment, manuscript ink, amber highlights, themed controls, and magical geometry entrance as the rest of the book.
- [ ] Once inscribed, interactive visual objects animate clearly without perpetual burning or obscuring the underlying content.
- [ ] Different pages can ignite at different positions; same page is reproducible during rehearsal.
- [ ] Reversing, skipping, rapid clicking, and restarting do not corrupt the current slide.
- [ ] Graph mode works with arbitrary node/branch counts; without a graph, linear mode still works.
- [ ] A deck may **enable OR omit** a second-act recap through its content. No graph, recap titles, finale effect, or number of recap cards is required by the template.
- [ ] A deck may configure any ending sequence from reusable actions (e.g. focus a chosen object → repeated parchment-drop recap cards → parchment-drop transition back to an existing graph, if present → close book → original cover). Every step's effect and text come from deck data, without subject defaults.
- [ ] If selected in deck content, a front-facing parchment sheet falls onto the book, settles, and reveals content with the **same multi-origin magical-ink engine**; the **identical effect** can be used repeatedly and can hand off back to an already-built map/other scene without redrawing it.
- [ ] The parchment-drop effect is selectable per scene and works in reduced-motion mode; it must never be mandatory for non-recap decks.
- [ ] Effects-disabled/reduced-motion and offline modes remain usable.
- [ ] Visual clarity and subject-specific diagram/text legibility take priority over spectacle.

## 13. Work order for the coding agent

1. Parse this generic template specification and the **separate** deck-specific content brief.
2. Build a functional **cover → open book → ordinary slide → page turn → magical reveal** vertical slice first.
3. Prove the **multi-origin, multi-line simultaneous burn-to-ink effect** on a multiline heading, short paragraph, and rendered formula.
4. Add navigation/state stability, responsive layout, and fallbacks.
5. Add optional progressive route/graph mode.
6. Load the current content file, build the actual deck, and test the complete route.
7. Polish cinematic details only after usability and content accuracy work.

**Non-negotiable:** This is a reusable **magic-book presentation template**. All deck-specific substance lives outside `AGENT_TEMPLATE.md`. Reuse the same animation functions for the opening, main deck, final recap, and closing.
