import type { DeckConfig } from '../engine/types';
import { icons } from './ornaments';
import { presenterIdle } from './presenter-idle';

export function createBook(root: HTMLElement, config: DeckConfig) {
  root.innerHTML = `
    <main class="stage" aria-label="Book presentation">
      <div class="book">
        <div class="spread" aria-hidden="true"><div class="book-outline"></div><div class="page-stack"></div><div class="page-viewport"><div class="spread-pages" aria-hidden="true"><div class="book-half left-page"></div><div class="book-half right-page"></div></div><div class="scene-host"></div><div class="center-fold" aria-hidden="true"></div></div><div class="leaf-host" aria-hidden="true"></div></div>
        <button class="cover" aria-label="Open book">
          <span class="cover-face"><span class="cover-title"></span><span class="cover-note"></span></span><span class="cover-lining" aria-hidden="true"></span>
        </button>
      </div>
    </main>
    <details class="presenter-tools"><summary aria-label="Presenter controls" title="Presenter controls · keyboard guide ?">⋯</summary><div class="toolbar"><nav class="page-controls" aria-label="Page navigation"><button data-action="back" aria-label="Previous beat or page" title="Previous · ←">${icons.back}</button><span class="page-position">—</span><button data-action="next" aria-label="Next beat or page" title="Next · → / Space">${icons.next}</button></nav><div class="tool-controls"></div></div></details>
    <aside class="presenter-cue" hidden aria-label="Presenter cue"><span></span><button type="button" class="restart-demo">Restart demo</button><button type="button" data-action="cue" title="Hide cue · C" aria-label="Hide presenter cue">×</button></aside>
    <p class="sr-only announcer" aria-live="polite" aria-atomic="true"></p>
    <dialog class="help"><button class="dismiss" aria-label="Close keyboard guide">×</button><h2>A few quiet spells.</h2><dl><dt>→ / Space</dt><dd>Finish motion, reveal a beat, or inscribe the next scene</dd><dt>←</dt><dd>Burn away and restore the previous scene</dd><dt>S / R</dt><dd>Finish animation / replay entrance</dd><dt>P / M</dt><dd>Pause motion / toggle effects</dd><dt>F / Home</dt><dd>Fullscreen / close the book immediately</dd><dt>C</dt><dd>Show or hide the quiet presenter cue</dd><dt>Escape</dt><dd>Return from a route node or close this guide</dd></dl><label class="tempo-label">Animation tempo <select class="tempo"><option value="0.5">Slow · ½×</option><option value="1" selected>Normal · 1×</option><option value="2">Swift · 2×</option></select></label></dialog>`;
  const get = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  get('.cover-title').textContent = config.coverTitle;
  get('.cover-note').textContent = config.coverNote?.text ?? '';
  get('.cover-note').hidden = !config.coverNote?.enabled;
  const controls = get('.tool-controls');
  presenterIdle(get<HTMLDetailsElement>('.presenter-tools'));
  for (const [action, label] of Object.entries({ skip: 'Skip animation · S', replay: 'Replay entrance · R', pause: 'Pause animation · P', effects: 'Toggle effects · M', fullscreen: 'Fullscreen · F', minimap: 'Mini-map · G', home: 'Return to cover · Home', help: 'Keyboard guide · ?' })) {
    const button = document.createElement('button');
    button.dataset.action = action;
    button.title = label;
    button.setAttribute('aria-label', label);
    button.textContent = icons[action];
    controls.append(button);
  }
  return { root, get, book: get('.book'), cover: get<HTMLButtonElement>('.cover'), spread: get('.spread'), host: get('.scene-host'), help: get<HTMLDialogElement>('.help') };
}
export type BookElements = ReturnType<typeof createBook>;
