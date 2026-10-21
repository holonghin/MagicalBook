import './styles/book.css';
import { Presentation } from './engine/presentation';
import { RendererRegistry } from './components/slide';
import { routeGraph } from './components/route-graph';
import { mathml } from './components/mathml';
import type { Deck } from './engine/types';
import { validateDeck } from './engine/content';
import 'katex/dist/katex.min.css';

const choice = new URLSearchParams(location.search).get('deck');
const root = document.querySelector<HTMLElement>('#app')!;
try {
  const entries = import.meta.glob<{ default: Deck }>('./content/*/deck.ts');
  const selected = entries[`./content/${choice ?? 'showcase'}/deck.ts`];
  if (!selected) throw new Error(`Unknown presentation: ${choice}. Available: ${Object.keys(entries).map(p => p.split('/')[2]).join(', ')}`);
  const deck = (await selected()).default;
  validateDeck(deck);
  const registry = new RendererRegistry().register('route', routeGraph).register('mathml', mathml);
  for (const [id, renderer] of Object.entries(deck.renderers ?? {})) registry.register(id, renderer);
  // Local manuscript and formula fonts are ready before measuring any later node or going
  // offline. No remote fonts or CDN typesetter are involved.
  await Promise.all([...document.fonts].map(font => font.load()));
  await document.fonts.ready;
  const presentation = new Presentation(root, deck, registry);

// Opt-in rehearsal / integration-test API; no global hook in ordinary sessions.
  if (new URLSearchParams(location.search).has('rehearsal')) Object.assign(window, { grimoire: presentation });
} catch (error) {
  const message = document.createElement('p'); message.className = 'content-error'; message.setAttribute('role', 'alert');
  message.textContent = `Unable to open this book. ${error instanceof Error ? error.message : error}`;
  root.replaceChildren(message);
}
