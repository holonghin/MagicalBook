# Authoring a presentation

For new work, use [CONTENT_AUTHORING.md](../CONTENT_AUTHORING.md): one automatically
discovered content folder, semantic transitions, and a single second-act flag.
The direct Deck/effect configuration below documents the retained legacy API.

## A deck is data

Create a module in `src/decks/<your-deck>/`, export a `Deck`, then select it at
the composition root in `src/main.ts`. Replacing the subject requires no engine,
effect, or style edits.

```ts
import type { Deck } from '../../engine/types';

export const deck: Deck = {
  config: {
    id: 'garden', coverTitle: 'A Garden in Time',
    coverNote: { enabled: true, text: 'Notes from the seasons' },
    language: 'en', seed: 42,
    camera: { closedScale: .72, contentScale: 1.025 },
    timings: { opening: 1900, turn: 520, erase: 430, reveal: 1000, drop: 1300, closing: 1900 },
    keys: { next: ['ArrowRight', ' ', 'PageDown'] },
  },
  sections: [{ id: 'seasons', title: 'Seasons', slides: [{
    id: 'spring', eyebrow: '01 / SPRING', layout: 'centered',
    blocks: [
      { id: 'title', type: 'title', text: 'Begin with a seed.' },
      { id: 'thought', type: 'paragraph', text: 'Small beginnings need time.' },
      { id: 'later', type: 'caption', text: 'Make room for growth.', beat: 1 },
    ],
  }] }],
  // routeGraph and ending may simply be absent.
};
```

Use unique slide and block IDs. Beat 0 appears with the page; subsequent beats
require separate next actions. Blocks on the same beat reveal concurrently. Use
contiguous beat numbers to avoid empty steps. Ordinary text is never interpreted
as HTML. Timings are milliseconds before applying presenter tempo.

Layouts: `editorial`, `centered`, `split`, `diagram`. Split places prose left and
a `diagram` or `interactive` block right. Keep one main idea per page; overflowing
content is not automatically paginated or shrunk.

Blocks: `title`, `paragraph`, `caption`, `quotation`, `bullets`, `code`, `table`,
`image`, `comparison`, `math`, `diagram`, `interactive`.

- `text`: single string; `lines`: deliberate line breaks or list items.
- Tables use `rows`, with the first row treated as headings.
- Comparisons use `columns: [{ title, text }, ...]`.
- Images use local `src` and descriptive `alt`.
- `reveal: false` explicitly opts a block out of inscription.
- Missing specialist renderers show the block's text fallback or a visible
  unavailable-illustration message; content is not silently discarded.

## Diagrams and math

Register a plug-in at the composition root:

```ts
registry.register('my-illustration', (block, context) => {
  const figure = bookDiagram('An accessible description');
  // Add local SVG and themed controls; geometry stays fixed during inscription.
  return figure;
});
```

The host applies inscription and preserves returned DOM while a scene is cached.
Use `var(--ink)`, `var(--muted-ink)`, `var(--gold)` and `var(--line)`. Render all
static geometry before inscription. Interactions then update meaningful objects
without restarting fire. See `src/decks/wonder/compass.ts` for a working example.

The optional `mathml` adapter accepts `data.expression`, a typed `MathNode` tree.
See the typography fixture. It uses native browser layout and system math fonts;
it is not a TeX parser. A future local KaTeX/MathJax adapter can be registered
without changing the engine, provided typesetting completes before measurement.
Preload asynchronous assets before constructing `Presentation`; the present
renderer contract returns DOM synchronously.

## Parchment drop

Select the same effect on any scene, anywhere in a deck:

```ts
{
  id: 'letter', eyebrow: 'A LETTER', layout: 'centered',
  effect: 'parchmentDrop',
  drop: {
    mode: 'content', duration: 1300,
    revealStartDropProgress: 0.67,
    targetRevealAtLanding: 0.85,
  },
  blocks: [{ id: 'title', type: 'title', text: 'Something to remember.' }],
}
```

One timeline drives the paper and every ink front. For duration `D`, ignition
fraction `S`, and landing visibility target `V`:

```
revealStart    = D × S
revealDuration = D × (1 − S) / V
end           = revealStart + revealDuration
```

Defaults ignite at 871 ms, land at 1300 ms with progress 0.85, and finish near
1376 ms. The spatial field maps progress to an approximate visible-area quantile
of the laid-out content. Actual glyph coverage is an art-direction target, not
a pixel-perfect 85% assertion. Pause, seek, tempo, skip and cancellation operate
on the whole composition.

For a handoff, the existing summary burns away and drifts off, revealing the
saved scene. No additional sheet drops over the destination:

```ts
{
  id: 'return', eyebrow: 'RETURN', layout: 'diagram', blocks: [],
  effect: 'parchmentExit',
  exit: { duration: 1250, style: 'drift' }, // or 'dissolve'
  restoreSceneId: 'previous-illustration',
}
```

The cached target retains its exact DOM, controls, visited markers and geometry.
It does not re-inscribe. It is hidden at the first handoff frame and emerges
behind the departing summary. Replay uses the saved outgoing summary, not a
copy of the map. Backward navigation uses ordinary burn erase/reveal without
simulating the drop in reverse. Cards never accumulate into an unreadable pile.
Legacy `drop.mode: 'transition'` also selects this exit; use `exit.duration` for
its timing. `drop.exitDuration` is retained in the type for old data only.

## Book camera, typography and ordinary transitions

The cover is the opening control. Cover and half-pages have the same width and
share the spine at 50% of the book's coordinate system. A single `.book` camera
transforms the binding, clipped `.page-viewport`, live scene and turning sheets.
The cover has opaque leather and parchment faces; it does not fade away.
`bindingPose` clips the spread to the projected edge of the opening/closing
binding. Temporary blank sheets live in `.leaf-host`, never in the slide DOM.

Opening uses one timeline: cover rotation in the first 34% of `opening`, page
flips from 26–87%, and camera approach from 20–100%. The entire live scene stays
concealed until `opening` has elapsed; then the ordinary ink reveal runs for
`reveal` milliseconds. Thus `opening + reveal` is the complete entrance time.
The center fold and outer binding become unobtrusive as the camera arrives.

Closing zooms out over 0–80% of `closing`, with opaque sheets turning over both
halves during 28–68%. Landed sheets stay opaque. Only once they cover both halves
is the underlying ink released at 70%; the cover shuts during 72–100%. There is
no delayed slide fade after closure. Home during opening reverses that exact
sampled pose, including the leaves, camera and ink. R during opening restarts
the entrance; ordinary R still replays the current inscription. Skip completes
the whole composition. All motion uses one seekable timeline, without timers.

Omit `effect` (or use `burn`) for ordinary navigation. Current ink is erased by
an inverse spatial mask, then the next scene is revealed by a growing mask.
Both directions apply to text and diagrams. `pageTurn` remains an explicit
special-scene option, not the default. Parchment entrances are separate authored
events; their falling motion and inscription remain on one timeline.

`coverNote.enabled` controls the optional lower-right note. `subtitle` and
`author` remain metadata; they do not add cover ornament. CSS uses separate
cover-serif, manuscript-title and handwritten-note font stacks. On Windows the
handwritten layers use Segoe Print and Segoe Script; other systems use local
fallbacks. The painted leather and parchment are editable original SVG assets,
with no scanned textures or network font dependency.

## Routes, ending and focus

`routeGraph` supplies nodes, edges, percentage coordinates and `unlockStep`.
A map slide supplies `routeStep` and a diagram block with `renderer: 'route'`.
Only unlocked objects enter the DOM. Node `slideIds` define its content sequence;
completion or Escape returns to the saved map position. Visited state persists
until a fresh opening. Coordinates and unlock order belong to the author; no
automatic graph layout is imposed.

`focus: { blockId, scale }` frames a chosen block. Ordinary scenes restore their
own framing. This is a fixed content view rather than a free camera editor.

`ending: { enabled: true, slides: [...] }` appends ordinary scenes using the same
renderers/effects. Omission or `enabled: false` adds nothing. `closeBook: false`
holds the last page; Home still closes. No engine branch knows an ending's topic,
names or scene count. The default generic demo has no second act.

## Rehearsal

With `?rehearsal`, integration tools can access:

```js
grimoire.act('replay');
grimoire.timeline.togglePause();
grimoire.timeline.seek(0.5); // fraction of the entire current composition
grimoire.timeline.finish();
```

Each new scene visit derives a seed from the deck seed, scene ID and visit
counter. Every measured line gets two to four independently varied ignition
origins; erasure uses its own field. Returning to a scene gives it a new pattern.
R reuses that entrance's seed, so replay is exact for the same viewport and font
metrics. Closing and reopening resets the visit sequence reproducibly.
Resizing completes active motion to avoid stale measurements. Different layout
or font metrics intentionally produce a newly measured field.
