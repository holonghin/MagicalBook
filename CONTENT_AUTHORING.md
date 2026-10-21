# Content-folder authoring

The complete `src/content/calculus-1/` is also a subject-content example, with
mathematical demonstrations and a guided branch route. It remains opt-in through
`?deck=calculus-1`; the default generic showcase is unchanged.

Two optional graph fields support larger guided presentations. A graph cue may
declare `routeAdvance: { fromNode, afterNode? }`: clicking that branch advances
only to the next authored cue, after the prerequisite node has been visited.
An edge may declare `layoutConstraint: false` when it is a semantic cross-link
that should render and burn normally without changing the teaching-tree ranks.
Omitting either field preserves the existing behavior. Mathematical meanings and
any connection legend remain content-owned.

A presentation lives entirely in `src/content/<folder>/`. Copy `sample/` for a
small graph presentation or `plain/` for a graph-free presentation. Use `showcase/`
as the full reference. Open `?deck=<folder>`; Vite discovers every `deck.ts`
automatically. No edits to `main.ts`, an engine registry or shared CSS are needed.
The default URL opens `showcase` (`?deck=demo` remains an alias).

## Files you own

```text
src/content/my-book/
  deck.ts                     metadata, composition, lecture order, ending flag
  graph.ts                    node labels, node-to-page references, unlock steps, axis
  connections.ts              edges (import into graph.ts)
  chapters/welcome.ts         ordinary pages or chapter boundaries
  nodes/topic/content.ts      one or more pages
  nodes/topic/demo.ts          optional custom renderer
  nodes/topic/style.css       optional CSS scoped to this book
  nodes/content.ts            compose/export node modules
  ending/content.ts           optional recap text
  assets/                     local media
```

Import these modules from the folder's `deck.ts`. Ordinary content stays typed
TypeScript data; custom demonstrations can be TypeScript/SVG/DOM components.

## Entry point and presentation grammar

```ts
import { definePresentation } from '../../engine/content';
import { welcome } from './chapters/welcome';
import { nodes } from './nodes/content';
import { graph } from './graph';
import { ending } from './ending/content';

export default definePresentation({
  config: {
    id: 'my-book', coverTitle: 'My Book', language: 'en', seed: 42,
    coverNote: { enabled: true, text: 'a note for the reader' },
  },
  chapters: [welcome], nodes, graph,
  sequence: [
    'welcome',
    { graphStep: 0, title: 'Begin.' },
    { graphStep: 1, title: 'Follow the thread.' },
  ],
  secondActEnding: { enabled: true },
  ending,
});
```

`sequence` is the main lecture route. Selectable node pages are separate and
never accidentally enter the linear lecture order. A graph step introduces all
nodes/connections whose `unlockStep` is at or below that step. To omit graphs,
omit `graph` and use only page IDs in `sequence`.

Use `secondActEnding: { enabled: false }` to omit the recap. This is the single narrative
animation choice. With a graph, a completed map is appended automatically after
any recap; Next closes the book. The map's title is `graph.title`, falling back
to the book title. All ending text belongs in the content folder.

Authors do **not** select per-slide effects. The compiler discards legacy effect
overrides in new content folders and applies these conventions:

| Meaning | Template motion |
| --- | --- |
| Ordinary pages/beats | Random-origin ink erase/reveal |
| Page with `kind: 'chapter'` | Whole-paper burn-through |
| Enter a selected graph node | Whole-paper burn-through |
| Return from a node | Content burn-through + gentle restoration of the same graph/camera; no page turn |
| Content ↔ graph page | Paired physical page journey (node visits and recap handoffs keep their own family) |
| Graph step | Focus source → track parallel path fronts → scorch, seal, paper and title |
| Second-act recap pages | Opaque preprinted parchment physically covers the intact previous page |
| Recap → completed map | Existing summary burns through to the map |
| Mini-map shortcut | Cover/content: book/page motion then map inscription; graph: expand remaining network in place; node: restore its graph then expand |

A chapter marker is a structural meaning, not an effect choice. The timing,
ignition count, particle language, camera and accessibility policy are shared.
Legacy `src/decks` imports are compatibility re-exports; their underlying data
now lives in content folders. Legacy examples retain their old effect options.

## Add or change a node and connection

`nodes/topic/content.ts`:

```ts
import type { ContentNode } from '../../../../engine/content';
export const topic: ContentNode = {
  id: 'topic',
  slides: [
    { id: 'topic-intuition', eyebrow: 'TOPIC', layout: 'centered', blocks: [
      { id: 'title', type: 'title', text: 'One clear idea.' },
      { id: 'note', type: 'caption', text: 'A small annotation.', beat: 1 },
    ] },
    { id: 'topic-example', eyebrow: 'AN EXAMPLE', layout: 'centered', blocks: [
      { id: 'formula', type: 'math', tex: String.raw`(a+b)^2=a^2+2ab+b^2` },
    ] },
  ],
};
```

Export the node from `nodes/content.ts`. Add its graph entry with
`slideIds: topic.slides.map(s => s.id)` and an `unlockStep`. Add a connection in
`connections.ts`: `{ id: 'source-topic', from: 'source', to: 'topic', unlockStep: 1 }`.
Its unlock step must not precede either endpoint. IDs must be unique. The loader
shows a readable error for missing pages, invalid connections or missing demos.

`graph.layout` is a legacy initial-layout fallback: horizontal (left → right) or
vertical (top → bottom). Current folders declare `graph.orientation` as described
below; that policy takes precedence. Coordinates are automatic. Optional `x`/`y` percentage overrides are intended for
small, deliberately arranged graphs; authors must avoid collisions in overrides.
Older graph steps can specify `layout`; new folders use named timeline events,
as the showcase does. Cycles are grouped before ranking. Independent roots work.
Long cross-links use outer gutters. Mouse/touch pan and cursor/pinch zoom with Fit support large
graphs; concise labels make an overview much more readable.

All eligible branches begin together when their source is already visible.
Nested new chains begin as their source's ember arrives. A target with several
incoming edges reveals once on **first arrival**. Independent roots ignite at
the beginning. A disconnected cycle receives one stable seed root. Layout and
existing node DOM remain stable across progressive unlocks. R replays the latest
unlock event without re-inscribing previously visible roots.

## Add a custom demonstration

Put the renderer in `nodes/topic/demo.ts`. Use the shared `bookDiagram` wrapper,
`--ink`, `--muted-ink`, `--gold`, `--line`, manuscript labels and themed controls.
Export a `BlockRenderer` and import it in `deck.ts`:

```ts
import { illustration } from './nodes/topic/demo';
// Inside definePresentation:
// demos: { illustration },
// Content block:
// { id: 'figure', type: 'interactive', renderer: 'illustration' }
```

There is no global registration step. A demo may have any number of meaningful
internal steps, native sliders or buttons. Render its initial geometry before
returning DOM so ink measurements stay stable. Inputs keep their own navigation
keys; Home always closes. For custom CSS, import a local stylesheet and scope
selectors to `#app[data-content='my-book']` (the config ID), as the compass does.
Import local images with Vite's asset imports. Do not change shared styles for a
subject-specific diagram.

LaTeX `tex` blocks use bundled KaTeX HTML plus accessible MathML. Local fonts are
loaded before presentation. Invalid TeX stays visible as source with an error
hint. The old structured `mathml` adapter also remains available. No CDN is used.

## Mini-map and verification

G or **⋯ → Mini-map** jumps to the complete graph from the cover or any page.
It bypasses recap, reveals all nodes/edges, and preserves visited status. Clicking
an unvisited node visits its actual pages; Escape or the node's last Next returns
to the completed map. Next from that map closes. Graph background/edge clicks do
nothing. Graph-free books hide the shortcut.

Run `npm run build`, then `npm test`. Add `&rehearsal` to expose the seekable
`window.grimoire` timeline. For visual QA only, set
`grimoire.rehearsal.burnOrigins = 1 | 2 | 3` before an activation; ordinary content
never sets ignition counts. Inspect 15/35/60/85% burn frames, path arrivals,
parallel branches and the target projector aspect ratio. See `docs/QA.md`.

## Clone the complete showcase

1. Copy `src/content/showcase/` to `src/content/my-subject/`.
2. In the copied `deck.ts`, change `config.id`, cover title/note and seed. Change
   the copied compass stylesheet selector from `data-content='showcase'` to your
   config ID (or remove that demo and its import).
3. Edit chapters, `nodes/<id>/content.ts`, optional `demo.ts`, `connections.ts`,
   `graph.ts` and their local composition imports. Keep node IDs, slide IDs,
   connection endpoints and sequence references consistent. Set graph layout to
   horizontal or vertical. Remove graph/graph sequence entries for a plain deck.
4. Set `secondActEnding: { enabled: true | false }`; author recap pages only when
   wanted. The earlier boolean syntax is still supported for migration.
5. Run the build, open `?deck=my-subject`, and rehearse its pages, node returns,
   map, Home and closing. Every subject-specific change stays in the new folder.

The loader discovers folders at **build/dev-server time**; a deployed static
site must be rebuilt after adding or editing a folder. URLs select the folder,
whereas `config.id` scopes its local stylesheet. No engine registry changes.

## Camera and animation policy

An incremental graph event spends 430 ms focusing the existing source or local
subgraph, then tracks toward its expanding routes while tracing each eligible
path by its real SVG arc length.
Each arriving target takes 600 ms to scorch, trace its seal, grow its parchment
fill from irregular fronts, and inscribe its title last. Branches run in
parallel; a convergence uses its first arrival. The local focused view remains
at the end instead of snapping back to a full-map fit.

From the cover or ordinary content, Mini-map hides and disables its destination during opening or
page-flip. Only after arrival does a 2.4-second condensed root/path/seal wave
reveal the whole map. The finished map initially fits the page, then unlocks.
During both graph cinematics, manual graph input is locked. Presenter commands
remain available; Home cancels safely and closes immediately.

After any graph reveal, drag anywhere (including over a node) to pan; use the
wheel to zoom smoothly about the cursor, one finger to pan, or two fingers to
pinch about their centroid. A 6 px movement threshold suppresses accidental
node clicks after dragging. Keyboard node activation remains available. The
small minus/plus/Fit controls also work. Node visits preserve the current camera,
including scale; resize preserves the user's view, or refits a fitted overview.

## v3 visible-state framing and reversible navigation

Early graph states use **visible bounds**: the currently painted node bodies and
revealed portions of connecting paths. Future nodes do not affect Fit. Initial
roots receive an enlarged close-up. Fit changes to **full bounds** after the graph
is complete or when Mini-map explicitly requests the completed graph. Resize
recomputes the same scope; returning from a node preserves a manually chosen view.

Graph pages display the authored title as a small upper-left manuscript label,
without a large heading block. Node seals, connector endpoints and traveling
embers share the actual painted outline geometry. Authors do not place anchors.

Mini-map from an existing graph retains its graph DOM and starting camera,
reflows to the final authored orientation when needed, then inscribes the remaining
routes and nodes in place. It uses no book or
page transition. Completed-map Next still closes. Back from a shortcut returns
to its actual origin: cover → close; content → reverse page journey; progressive
graph → burn routes back and zoom toward their source region.

Ordinary transitions pair with the family used to enter: page journeys reverse
the same leaf clock, paper burns use paper burns in either direction, and recap
falls reverse into lifting sheets. Graph additions retract along the same paths,
with labels and seals disappearing before their connecting routes retreat.
All of this is template behavior; the content-folder schema is unchanged.

## v4 persistent graph and readable detail

Returning with Back, Escape or the last Next from a node restores the exact
progressive graph step and saved camera. The content burns away while the camera
gently returns; there is no page flip or graph reset. Mini-map inside a node
first restores that existing map, then inscribes its remaining network in place.
Mini-map from graph mode also expands in place. Progressive Next/Back never turn
book pages, including when a sequence changes graph orientation. Home always
starts closing directly. Graph input unlocks as soon as scripted motion ends.

Camera framing uses the source and the complete new branch group, including the
actual connecting paths. Progressive Fit keeps its visible-only scope. Completed
maps use full bounds. A new graph arriving through a physical page transition
prepares its source framing behind the paper and starts inscription on arrival.
Everyday ink erase/reveal overlap; cover/closing/recap keep ceremonial timing.
None of these timings or transition choices need content-level settings.

Graph entries can optionally supply semantic detail:

```ts
{
  id: 'topic', label: 'A complete topic title',
  shortLabel: 'Topic',       // authored equivalent for an overview; never auto-truncated
  note: 'A supporting annotation', // appears at close zoom
  role: 'branch',           // optional structural emphasis; roots/forks are inferred
  unlockStep: 1, slideIds: topic.slides.map(s => s.id),
}
```

All three additions are optional. Active nodes use warm gold tracing; visited
nodes keep stable aged ink; intentionally visible upcoming nodes are subdued.
Hidden future nodes remain hidden. Overview uses compact titles and suppresses
fine annotations; mid-range uses full labels; close zoom also shows notes.
Hysteresis prevents flickering between detail levels. Seal size, positions and
path anchors remain fixed when detail changes. Title size compensates graph zoom
to a minimum of 18 CSS pixels at the presentation view; it still shrinks with
the physical book during closing.

At a dense overview, conflicting titles are selectively suppressed rather than
reduced to unreadable type. Roots, branches, active/visited and hovered/focused
titles have priority. Every node body remains visible, with its full accessible
name and tooltip; hover/focus or pan/zoom exposes the title. Author concise,
meaning-preserving aliases and use zoom for detail. Arbitrarily many titles
cannot all fit at a readable size on one projected page. `scale-check/` is a
content-only 37-node example of these optional fields.

## v6 graph modes, progression and Mini-map

Graph entrances replay the existing burn inscription on each visit, independently
of saved slideshow progress. Full-map/Mini-map inscription is limited by the
template to 2300 ms **after** book/page travel, including returns to a completed
graph. Short maps use regular burning throughout; longer maps coordinate their
remaining ink in the final 350 ms. Incremental teaching steps are not capped.
There are no new content settings for this behavior.

The v6 policy supersedes the v5.1 last-view preference. A presentation supplies
one logical graph and exactly one author-selected orientation mode in `graph.ts`:

```ts
orientation: { mode: 'fixed-horizontal' }
// or:
orientation: { mode: 'fixed-vertical' }
// or:
orientation: {
  mode: 'timeline', initial: 'horizontal',
  changes: [
    { atStep: 'turn-map', to: 'vertical' },
    { atStep: 'final-review', to: 'horizontal' },
  ],
}
```

Give the referenced sequence entries stable IDs inside the same folder:

```ts
sequence: [
  'welcome',
  { id: 'begin', graphStep: 0, title: 'Two beginnings.' },
  { id: 'turn-map', graphStep: 1, title: 'Another direction.' },
  { id: 'final-review', graphStep: 2, title: 'The whole journey.' },
],
```

A graph entry's `id` names an authored timeline cue; `graphStep` is the numeric
node/edge unlock threshold. Separate cues can share a threshold to reorient
without revealing more. If both orientation and threshold change, the same
viewport first reflows its existing ink, then reveals/retracts the requested
routes. Back derives the previous authored cue's layout and threshold.

Fixed modes need no `initial` or `changes`; contradictory settings are rejected.
Timeline mode requires a valid initial orientation, ordered unique change events
and references to existing graph cue IDs. The latest event at or before a cue
sets its orientation, independently of render/camera history. Final graph and
Mini-map use the last authored orientation (H→V→H finishes H; V→H→V finishes V).

For older folders without `orientation`, the compiler maps `graph.layout` and
legacy sequence `layout` declarations to one of the same three policies. New
folders should declare `orientation` explicitly; `sample/` shows fixed mode,
`showcase/` shows timeline mode. `orientation-check/` is content-only QA for all
fixed/directional combinations, selected with `&case=FH|FV|THV|TVH|THVH|TVHV`.
No engine registry or effect configuration is required.

`GraphState.progressStep` and `progressCue` describe actual slideshow progress;
the viewport's temporary final map does not overwrite either. Mini-map from a
cover/ordinary page completes book/page travel before revealing the final graph.
From a graph or node, it expands the existing map without a book flip, reflowing
to the final authored orientation if necessary. Back from a temporary preview
restores its source cue, visible nodes/edges, orientation and graph camera.
Next from the full map closes. Home closes directly and ends preview mode.

Starting the PPT normally from the cover is an intentional restart: progression,
selection and visits reset to the authored beginning, including its initial
orientation. Cached final-map geometry is made dormant before it mounts; first
nodes inscribe forward, with no full-then-disappear frame. The graph identity and
one viewport are reused. State remains in memory; loading a different book starts
that book's declared defaults. The optional `graph.id` is scoped by presentation
ID and defaults to `route`.

One real text element per seal switches between authored compact/full labels;
its accessible name remains complete. Visible-only Fit, gesture support, active/
visited/upcoming hierarchy and the minimum projected title size are retained.
The presenter drawer dims/collapses after idle, with pointer/focus recovery and
no automatic folding while keyboard focus is inside it.

## Living parchment (current falling-paper revision)

Each parchment invocation (including R replay) samples a fresh restrained motion
profile: travel time, start offset, lateral drift, rotation, pitch/yaw, flutter
phase/amplitude/frequency, air drag, contact/settle and tiny corner movement.
One profile remains fixed for the active timeline, including seeks and reverse
lifting. The incoming opaque sheet carries its content fully printed from the
start. The actual outgoing page stays rendered beneath it, with no premature
erase/fade. Gravity/air resistance, seeded drift/tilt, a moving shadow and a small
damped landing settle share one clock. Logical navigation commits only after the
sheet has landed; covered content can then be detached. Back lifts the printed
sheet, and Back during descent retraces its current motion without snapping it
down first. A reverse lift exposes the retained completed graph directly; other
graph entrances retain their magical burn reveal. Ordinary ink, combustion,
opening/closing and Mini-map choreography are unchanged. No new content settings
are required; former drop inscription options remain compatibility timing data.

For deterministic motion QA only, set `grimoire.rehearsal.dropSeed = 510` before
activating a drop under `?deck=showcase&rehearsal`. This generates a reproducible
sequence of distinct profiles; `data-drop-seed` records each invocation's seed.
Normal playback samples fresh seeds. Content authors configure none of these
motion parameters. Reduced motion settles directly as before.

## Optional guided teaching routes

Decks may declare `guidedRoute: { steps: [{ sceneId, nodeId, unlock }] }` in
their content entry. Each scene is an authored graph cue; `unlock` lists the
newly accessible nodes, independently of the cue's visual `graphStep`. An
optional `advanceOnly: true` makes a branch overview advance to its next cue
instead of opening a lesson. A final step without `nodeId` continues the normal
ending. Decks omitting this option keep their original navigation.

Right/Enter enters the current teaching node. Right finishes its demo beats and
pages, then returns to the next graph cue. Escape returns without advancing;
past-node revisits leave the scheduled lesson unchanged. Mini-map previews temporarily allow every content node to be opened, including untaught
lessons. A branch with `slideIds: []` is a non-interactive category label and
needs no placeholder page. Browsing does not advance or unlock the guided teaching route; leaving
the preview restores the normal teaching locks. Left retraces the teaching cursor and restores
the previous lesson's final page. Visibility, access, visits and completion are
separate states. Home closes directly; a normal cover opening restarts teaching.

For a multi-step subject demo, use `demoSequence` from
`src/components/demo-sequence.ts`. Create one controller per rendered scene,
provide the last step number and a reversible render callback, and call
`setStep(0)` after constructing its controls. Buttons call `request(step)`;
Right/Left use the same controller. The callback can return newly inscribed
elements; the shared presentation clock applies the standard magical reveal.
An optional `transition(from, to, progress)` interpolates diagram geometry on
that same clock. No independent slide timer or global mutable demo state is
needed. Keep the scenario, formulas, labels and styling in the content folder.



The guided presenter now retains known graph ink across ordinary node returns;
only the next authored delta is burned in. Long primary routes establish source
context and settle locally on their destination; semantic cross-links do not
force a global fit. Mini-map remains a separate final-state preview. The quiet
presenter cue can be hidden with C and offers a current-demo restart.

A subject may author labelled semantic states with its own helper around
`demoSequence`. The Calculus folder's `teachingBeats` is one example: each state
contains mathematically valid values, and an explicit list of numeric fields
may interpolate on the shared clock. Do not infer teaching progression by
clicking controls or traversing widget DOM. Manual exploration must remain
optional; every required teaching observation must be reachable through the
registered sequence.


### Continuous guided lessons

An optional `continuationGroup` on adjacent `guidedRoute.steps` keeps a coherent
teaching demonstration on the page across node boundaries. Each step still has
its own node ID, slides, unlocks and completion state. The first cue is shown;
later cues inside that group are deferred. After the group, the retained graph
reveals the accumulated nodes and paths together. Left crosses the same boundary
back to the preceding node's final demonstration beat; Home and Mini-map keep
their existing behavior. Use this only for a single developing mathematical or
subject-specific story, not merely because two nodes share a renderer.

For state continuity, a demo's registered `DemoSequence` can expose
`continuity: { key, capture, restore, reset? }`. Matching keys transfer
content-owned state. Mark its figure with `data-demo-continuity` to keep the
illustration visible while the new title, equation and caption inscribe.
`reset` clears imported state when a fresh slideshow opens from the cover.
The engine has no subject IDs, slider names or mathematical state in this API.
The Calculus folder's X1 → X2 → X3 group is the reference implementation.


For a persistent demo, `continuity.revealTargets()` can return only the newly
introduced annotation elements after `restore`. The common scene reveal then
inscribes those elements while leaving the existing illustration visible.
Use stable DOM annotation containers so masks stay attached to their content.
A moving demo can set `DemoSequence.revealAfterMotion` to let its existing camera
or geometry motion finish before the standard inscription of `targets`. Both
phases share the presentation timeline, including seek, skip, pause and cleanup;
no additional timers or per-slide effect settings are needed.
