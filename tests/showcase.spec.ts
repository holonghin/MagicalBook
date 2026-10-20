import { test, expect, type Page } from '@playwright/test';
import { definePresentation } from '../src/engine/content';
import { graphRanks, layoutGraph } from '../src/components/graph-layout';
import type { RouteGraph } from '../src/engine/types';
const app = (page: Page) => page.locator('#app');
const engine = async (page: Page, action: string) => page.evaluate(a => (window as any).grimoire.act(a), action);
const finish = async (page: Page) => { await engine(page, 'skip'); };
const next = async (page: Page) => { await engine(page, 'next'); await finish(page); };
async function seek(page: Page, p: number) { await page.evaluate(p => { const t = (window as any).grimoire.timeline; if (!t.paused) t.togglePause(); t.seek(p); }, p); }
async function open(page: Page, deck = 'demo') { await page.goto(`/?deck=${deck}&rehearsal`); await page.locator('.cover').click(); await finish(page); }
async function toGraph(page: Page) { for (let i = 0; i < 5; i++) await next(page); }

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (['error', 'warning'].includes(m.type())) errors.push(m.text()); });
  (page as any).errors = errors;
});
test.afterEach(async ({ page }) => { expect((page as any).errors).toEqual([]); });

test('whole showcase: ink, 1/2/3 paper fires, graph growth in two directions, recap, final graph, closing', async ({ page }) => {
  await open(page); await expect(app(page)).toHaveAttribute('data-scene', 'threshold');
  await engine(page, 'next'); await seek(page, .5);
  await page.screenshot({ path: 'docs/qa/next-ink.png' }); await finish(page);
  for (const origins of [1, 2, 3]) {
    await page.evaluate(n => { (window as any).grimoire.rehearsal.burnOrigins = n; }, origins);
    await engine(page, 'next');
    for (const p of [.2, .4, .6, .8]) {
      await seek(page, p);
      await expect(page.locator('.paper-burn-rim')).toHaveAttribute('data-origins', String(origins));
      await expect(page.locator('.paper-burn-outgoing')).toHaveCount(1);
      expect(await page.locator('.paper-burn-outgoing').evaluate(el => getComputedStyle(el).maskImage)).toContain('paper-burn');
      await page.screenshot({ path: `docs/qa/next-paper-${origins}-${Math.round(p * 100)}.png` });
    }
    await seek(page, .4);
    const mask = await page.locator('.paper-burn-defs path').getAttribute('d');
    await finish(page); await engine(page, 'replay'); await seek(page, .4);
    expect(await page.locator('.paper-burn-defs path').getAttribute('d')).toBe(mask);
    await finish(page); await expect(page.locator('.paper-burn-rim,.paper-burn-defs,.paper-burn-particles')).toHaveCount(0);
  }
  await next(page); // first horizontal graph
  await expect(page.locator('.route-node:visible')).toHaveCount(2);
  await page.evaluate(() => { (window as any).rootButton = document.querySelector('[data-node="wonder"]'); });
  await engine(page, 'next'); await seek(page, .3);
  await expect(page.locator('[data-node="wonder"]')).toBeVisible();
  await expect(page.locator('[data-node="attention"]')).toBeHidden();
  const path = page.locator('[data-edge="first-thread"]');
  expect(Number(await path.getAttribute('data-progress'))).toBeGreaterThan(0);
  expect(Number(await path.getAttribute('data-progress'))).toBeLessThan(1);
  await page.screenshot({ path: 'docs/qa/next-path-first.png' }); await finish(page);
  await engine(page, 'next'); await seek(page, .3);
  for (const id of ['question', 'pattern', 'story', 'experiment', 'reflection']) {
    const p = Number(await page.locator(`[data-edge="branch-${id}"]`).getAttribute('data-progress'));
    expect(p).toBeGreaterThan(.1); expect(p).toBeLessThan(.9); await expect(page.locator(`[data-node="${id}"]`)).toBeHidden();
  }
  expect(await page.evaluate(() => (window as any).rootButton === document.querySelector('[data-node="wonder"]'))).toBe(true);
  await page.screenshot({ path: 'docs/qa/next-parallel.png' }); await finish(page);
  await engine(page, 'replay'); await seek(page, .3);
  await expect(page.locator('[data-node="wonder"]')).toBeVisible();
  await expect(page.locator('[data-node="question"]')).toBeHidden();
  expect(Number(await page.locator('[data-edge="branch-question"]').getAttribute('data-progress'))).toBeGreaterThan(0);
  await finish(page); await next(page);
  await expect(page.locator('[data-node="sharing"]')).toHaveCount(1);
  await page.screenshot({ path: 'docs/qa/next-horizontal.png' });
  for (let i = 0; i < 4; i++) await next(page);
  await expect(page.locator('.route-diagram')).toHaveAttribute('data-axis', 'vertical');
  await page.screenshot({ path: 'docs/qa/next-vertical.png' });
  await engine(page, 'next');
  const landing = 1 / (.67 + .33 / .85);
  await seek(page, .75 * landing);
  expect(Number(await page.locator('[data-block="title"] > .ink-content:not(.ink-front)').getAttribute('data-reveal-progress'))).toBeGreaterThan(0);
  await seek(page, landing);
  await expect(page.locator('[data-drop-progress]')).toHaveAttribute('data-drop-progress', '1.000');
  await expect(page.locator('[data-block="title"] > .ink-content:not(.ink-front)')).toHaveAttribute('data-reveal-progress', '0.850');
  await page.screenshot({ path: 'docs/qa/next-drop.png' }); await finish(page);
  await next(page); await next(page);
  await expect(app(page)).toHaveAttribute('data-scene', '@completed-graph');
  await expect(page.locator('.route-node:visible')).toHaveCount(9);
  await engine(page, 'next'); await seek(page, .5); await page.screenshot({ path: 'docs/qa/next-close.png' }); await finish(page);
  await expect(app(page)).toHaveAttribute('data-phase', 'closed');
});

test('mini-map from cover and a slide, selectable unvisited nodes, preserved state and final-step semantics', async ({ page }) => {
  await page.goto('/?deck=demo&rehearsal');
  await page.getByLabel('Presenter controls', { exact: true }).click();
  await page.getByRole('button', { name: 'Mini-map · G' }).click();
  await seek(page, .5); await expect(app(page)).toHaveAttribute('data-phase', 'opening');
  // The compositing gate cannot be overridden by descendant visibility.
  await expect(page.locator('.scene-host')).toHaveCSS('opacity', '0');
  await expect(page.locator('.scene-host')).toHaveAttribute('inert', '');
  await page.screenshot({ path: 'docs/qa/next-map-opening.png' }); await finish(page);
  await expect(app(page)).toHaveAttribute('data-scene', '@completed-graph');
  await expect(page.locator('.route-node:visible')).toHaveCount(9); await expect(page.locator('.route-node.visited')).toHaveCount(0);
  await page.locator('[data-node="attention"]').click(); await finish(page);
  await expect(app(page)).toHaveAttribute('data-scene', 'attention');
  const slider = page.getByRole('slider', { name: 'Compass bearing' }); await slider.fill('73');
  await engine(page, 'escape'); await finish(page);
  await expect(app(page)).toHaveAttribute('data-scene', '@completed-graph');
  await page.locator('[data-node="attention"]').click(); await finish(page); await expect(slider).toHaveValue('73');
  await engine(page, 'minimap'); await seek(page, .45);
  await expect(page.locator('.flutter-leaf')).toHaveCount(0);
  await expect(page.locator('.paper-burn-outgoing')).toHaveCount(1);
  await page.screenshot({ path: 'docs/qa/next-map-flipping.png' }); await finish(page);
  await expect(page.locator('.route-node.visited')).toHaveCount(1);
  await next(page); await expect(app(page)).toHaveAttribute('data-phase', 'closed');
  await open(page); await engine(page, 'minimap'); await finish(page);
  await next(page); await expect(app(page)).toHaveAttribute('data-phase', 'closed');
});

test('graph background clicks do nothing; multi-page nodes return to the exact route step', async ({ page }) => {
  await open(page); await toGraph(page);
  const scene = await app(page).getAttribute('data-scene');
  await page.locator('.graph-scroll').click({ position: { x: 10, y: 10 } });
  await expect(app(page)).toHaveAttribute('data-scene', scene!);
  await page.locator('[data-node="wonder"]').focus(); await page.keyboard.press('Enter'); await finish(page);
  await expect(app(page)).toHaveAttribute('data-scene', 'wonder-a');
  await next(page); await expect(app(page)).toHaveAttribute('data-scene', 'wonder-b');
  await engine(page, 'back'); await finish(page); await expect(app(page)).toHaveAttribute('data-scene', 'wonder-a');
  await next(page); await expect(app(page)).toHaveAttribute('data-scene', 'wonder-b');
  await next(page); await expect(app(page)).toHaveAttribute('data-scene', scene!);
  await expect(page.locator('[data-node="wonder"]')).toHaveClass(/visited/);
});

test('content-only minimal folder, no recap, and graph-free presentation', async ({ page }) => {
  await open(page, 'sample');
  await next(page); await next(page); await next(page);
  await expect(app(page)).toHaveAttribute('data-scene', '@completed-graph');
  await next(page); await expect(app(page)).toHaveAttribute('data-phase', 'closed');
  await page.goto('/?deck=plain&rehearsal');
  await expect(page.locator('[data-action="minimap"]')).toBeHidden();
  await page.keyboard.press('g'); await expect(app(page)).toHaveAttribute('data-phase', 'closed');
  await page.locator('.cover').click(); await finish(page); await next(page); await next(page);
  await expect(app(page)).toHaveAttribute('data-phase', 'closed');
});

test('formula authoring, reduced motion, offline operation, skip and interrupted cleanup', async ({ page, context }) => {
  await open(page); await engine(page, 'minimap'); await finish(page);
  await page.locator('[data-node="pattern"]').click(); await finish(page);
  await expect(page.locator('.katex')).toBeVisible(); await page.evaluate(() => document.fonts.ready);
  await context.setOffline(true);
  await engine(page, 'replay'); await seek(page, .4); await page.screenshot({ path: 'docs/qa/next-formula.png' }); await finish(page);
  await engine(page, 'escape'); await seek(page, .4); await engine(page, 'home'); await finish(page);
  await expect(page.locator('article,.paper-burn-rim,.paper-burn-particles,.effect-defs,.flutter-leaf')).toHaveCount(0);
  await context.setOffline(false); await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page); await engine(page, 'minimap');
  await expect(app(page)).toHaveAttribute('data-phase', 'ready'); await expect(page.locator('.paper-burn-rim,.flutter-leaf')).toHaveCount(0);
  await next(page); await expect(app(page)).toHaveAttribute('data-phase', 'closed');
});

test('graph labels fit representative screens; resize preserves anchored paths', async ({ page }) => {
  await open(page); await engine(page, 'minimap'); await finish(page);
  for (const size of [{ width: 1920, height: 1080 }, { width: 1280, height: 720 }, { width: 768, height: 500 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(size); await page.waitForTimeout(100);
    const bounds = await page.locator('.route-node').evaluateAll(nodes => nodes.map(n => { const r = n.getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right, bottom: r.bottom }; }));
    for (const r of bounds) { expect(r.x).toBeGreaterThanOrEqual(0); expect(r.y).toBeGreaterThanOrEqual(0); expect(r.right).toBeLessThanOrEqual(size.width); expect(r.bottom).toBeLessThanOrEqual(size.height); }
    for (let i = 0; i < bounds.length; i++) for (let j = i + 1; j < bounds.length; j++) expect(bounds[i].right <= bounds[j].x || bounds[j].right <= bounds[i].x || bounds[i].bottom <= bounds[j].y || bounds[j].bottom <= bounds[i].y).toBe(true);
  }
  await page.screenshot({ path: 'docs/qa/next-mobile-map.png' });
});

test('content validation rejects missing references and demos; layouts handle convergence and cycles', () => {
  const config = { id: 'test', coverTitle: 'Test', language: 'en', seed: 1 };
  const content = { config, chapters: [{ id: 'a', eyebrow: '', layout: 'centered' as const, blocks: [] }], sequence: ['a'], ending: [{ id: 'recap', eyebrow: '', layout: 'centered' as const, blocks: [] }] };
  expect(definePresentation({ ...content, secondActEnding: { enabled: false } }).flow).toEqual(['a']);
  expect(definePresentation({ ...content, secondActEnding: { enabled: true } }).flow).toEqual(['a', 'recap']);
  expect(() => definePresentation({ config, chapters: [], sequence: ['missing'], secondActEnding: false })).toThrow('Unknown sequence');
  expect(() => definePresentation({ config, chapters: [{ id: 'x', eyebrow: '', layout: 'centered', blocks: [{ id: 'd', type: 'interactive', renderer: 'missing' }] }], sequence: ['x'], secondActEnding: false })).toThrow('Missing demo');
  const graph: RouteGraph = { nodes: ['a', 'b', 'c'].map(id => ({ id, label: id, unlockStep: 0, slideIds: [id] })), edges: [{ id: 'ab', from: 'a', to: 'b', unlockStep: 0 }, { id: 'bc', from: 'b', to: 'c', unlockStep: 0 }, { id: 'cb', from: 'c', to: 'b', unlockStep: 0 }] };
  expect(graphRanks(graph).get('b')).toBe(1);
  expect(layoutGraph(graph, 'vertical', 900, 450).points.get('b')!.y).toBeGreaterThan(layoutGraph(graph, 'vertical', 900, 450).points.get('a')!.y);
  expect(() => definePresentation({ config, chapters: [{ id: 'a', eyebrow: '', layout: 'centered', blocks: [] }], sequence: ['a'], graph: { nodes: [{ id: 'a', label: 'A', slideIds: ['a'], unlockStep: 0 }], edges: [{ id: 'broken', from: 'a', to: 'z', unlockStep: 0 }] }, secondActEnding: false })).toThrow('unknown node');
});

test('mini-map retargets an opening pose; rapid jumps and Home leave no temporary layers', async ({ page }) => {
  await page.goto('/?deck=demo&rehearsal'); await page.locator('.cover').click(); await seek(page, .4);
  const before = Number(await page.locator('.book').getAttribute('data-camera-progress'));
  await page.evaluate(() => { const g = (window as any).grimoire; g.act('minimap'); g.timeline.togglePause(); });
  await expect(app(page)).toHaveAttribute('data-phase', 'opening');
  const after = Number(await page.locator('.book').getAttribute('data-camera-progress'));
  expect(after).toBeLessThan(before + .1);
  await finish(page); await expect(app(page)).toHaveAttribute('data-scene', '@completed-graph');
  await page.locator('[data-node="wonder"]').click(); await seek(page, .35);
  await engine(page, 'minimap'); await engine(page, 'minimap'); await engine(page, 'home'); await finish(page);
  await expect(app(page)).toHaveAttribute('data-phase', 'closed');
  await expect(page.locator('article,.flutter-leaf,.paper-burn-rim,.paper-burn-particles,.effect-defs')).toHaveCount(0);
  await page.goto('/?deck=does-not-exist'); await expect(page.getByRole('alert')).toContainText('Unknown presentation');
});
