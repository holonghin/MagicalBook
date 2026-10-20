import { test, expect, type Page } from '@playwright/test';
import { graphOrientation } from '../src/engine/graph-orientation';
import type { RouteGraph, Slide } from '../src/engine/types';
async function act(page: Page, action: string) { await page.waitForFunction(() => !!(window as any).grimoire); await page.evaluate(a => (window as any).grimoire.act(a), action); }
async function seek(page: Page, p: number) { await page.evaluate(p => { const t = (window as any).grimoire.timeline; if (!t.paused) t.togglePause(); t.seek(p); }, p); }
async function next(page: Page) { await act(page, 'next'); await act(page, 'skip'); }
test.beforeEach(async ({ page }) => { const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (['warning', 'error'].includes(m.type())) errors.push(m.text()); }); (page as any).errors = errors; });
test.afterEach(async ({ page }) => expect((page as any).errors).toEqual([]));

test('v6 video regression: preview Home restart never exposes the completed graph before resetting', async ({ page }) => {
  await page.goto('/?deck=showcase&rehearsal'); await page.locator('.cover').click(); await act(page, 'skip');
  for (let i = 0; i < 9; i++) await next(page);
  await act(page, 'minimap'); await act(page, 'skip');
  await expect(page.locator('.route-node:visible')).toHaveCount(9);
  await act(page, 'home'); await act(page, 'skip'); await page.locator('.cover').click(); await act(page, 'skip');
  for (let i = 0; i < 4; i++) await next(page);
  await act(page, 'next'); await seek(page, 0);
  expect(await page.locator('.route-node:visible').count()).toBeLessThanOrEqual(2);
  for (const p of [.1, .25, .4, .6, .8, 1]) {
    await seek(page, p);
    await expect(page.locator('[data-node="sharing"]')).toBeHidden();
    expect(await page.locator('.route-node:visible').count()).toBeLessThanOrEqual(2);
    await page.screenshot({ path: `docs/qa/v6-restart-${p * 100}.png` });
  }
  await act(page, 'skip'); await expect(page.locator('.route-node:visible')).toHaveCount(2);
  await expect(page.locator('.route-diagram')).toHaveAttribute('data-axis', 'horizontal');
});

const cases: Record<string, string[]> = {
  FH: ['horizontal', 'horizontal', 'horizontal', 'horizontal', 'horizontal'],
  FV: ['vertical', 'vertical', 'vertical', 'vertical', 'vertical'],
  THV: ['horizontal', 'horizontal', 'vertical', 'vertical', 'vertical'],
  TVH: ['vertical', 'vertical', 'horizontal', 'horizontal', 'horizontal'],
  THVH: ['horizontal', 'horizontal', 'vertical', 'vertical', 'horizontal'],
  TVHV: ['vertical', 'vertical', 'horizontal', 'horizontal', 'vertical'],
};
const graph = (page: Page) => page.locator('.route-diagram:not(.ink-front)');
test('v6 fresh cover and ordinary-slide previews establish final geometry before any prior graph mount', async ({ page }) => {
  for (const mode of ['THV', 'TVH']) for (const source of ['cover', 'page']) {
    await page.goto(`/?deck=orientation-check&case=${mode}&rehearsal`);
    if (source === 'page') { await page.locator('.cover').click(); await act(page, 'skip'); }
    await act(page, 'minimap'); await seek(page, 0);
    await expect(page.locator('.route-node:visible')).toHaveCount(0);
    expect(await page.evaluate(() => (window as any).grimoire.graphState.progressStep)).toBe(-1);
    await act(page, 'skip'); await expect(graph(page)).toHaveAttribute('data-axis', mode === 'THV' ? 'vertical' : 'horizontal');
    await expect(page.locator('.route-node:visible')).toHaveCount(6);
    if (source === 'page') { await act(page, 'back'); await act(page, 'skip'); await expect(page.locator('#app')).toHaveAttribute('data-scene', 'welcome'); }
  }
});
const pose = (page: Page) => graph(page).evaluate(el => ({ x: (el as HTMLElement).dataset.cameraX, y: (el as HTMLElement).dataset.cameraY, scale: (el as HTMLElement).dataset.zoom }));
async function start(page: Page, mode: string) { await page.goto(`/?deck=orientation-check&case=${mode}&rehearsal`); await page.locator('.cover').click(); await act(page, 'skip'); await next(page); }
for (const [mode, axes] of Object.entries(cases)) test(`v6 ${mode}: authored orientation, isolated final preview, return and restart`, async ({ page }) => {
  test.setTimeout(60_000);
  await start(page, mode);
  await expect(graph(page)).toHaveAttribute('data-axis', axes[0]); await expect(page.locator('.route-node:visible')).toHaveCount(2);
  await expect(graph(page)).toHaveAttribute('data-fit-scope', 'visible');
  expect(Number(await graph(page).getAttribute('data-zoom'))).toBeGreaterThan(1.4);
  await page.evaluate(() => { (window as any).sameViewport = document.querySelector('.route-diagram'); });
  // Preview from an early state; second three-direction check is from its middle state.
  const at = mode.length === 4 ? 2 : 0;
  for (let i = 0; i < at; i++) await next(page);
  const sourcePose = await pose(page);
  const progress = await page.evaluate(() => { const s = (window as any).grimoire.graphState; return { step: s.progressStep, cue: s.progressCue, orientation: s.orientation }; });
  await act(page, 'minimap');
  for (const p of [0, .2, .45, .7, 1]) {
    await seek(page, p); await expect(page.locator('.flutter-leaf,.outgoing-scene')).toHaveCount(0);
    await expect(graph(page)).toHaveCount(1);
    expect(await page.evaluate(() => { const s = (window as any).grimoire.graphState; return { step: s.progressStep, cue: s.progressCue, orientation: s.orientation }; })).toEqual(progress);
    if (p === 0) await expect(page.locator('.route-node:visible')).toHaveCount(at === 2 ? 5 : 2);
    if (mode === 'THVH' || mode === 'THV') await page.screenshot({ path: `docs/qa/v6-${mode}-preview-${p * 100}.png` });
  }
  await act(page, 'skip'); await expect(graph(page)).toHaveAttribute('data-axis', axes[4]);
  await expect(page.locator('.route-node:visible')).toHaveCount(6); await expect(graph(page)).toHaveAttribute('data-fit-scope', 'full');
  await act(page, 'back'); await act(page, 'skip');
  await expect(graph(page)).toHaveAttribute('data-axis', axes[at]); await expect(page.locator('.route-node:visible')).toHaveCount(at === 2 ? 5 : 2);
  expect(await pose(page)).toEqual(sourcePose);
  expect(await page.evaluate(() => (window as any).sameViewport === document.querySelector('.route-diagram') && (window as any).grimoire.graphViews.size === 1)).toBe(true);
  await act(page, 'minimap'); await act(page, 'skip'); await act(page, 'home'); await act(page, 'skip');
  // Cover preview also uses the authored FINAL axis without changing progress.
  await act(page, 'minimap'); await seek(page, .2); await expect(page.locator('.scene-host')).toHaveCSS('opacity', '0');
  await act(page, 'skip'); await expect(graph(page)).toHaveAttribute('data-axis', axes[4]);
  await act(page, 'home'); await act(page, 'skip'); await page.locator('.cover').click(); await act(page, 'skip');
  await next(page); await expect(graph(page)).toHaveAttribute('data-axis', axes[0]); await expect(page.locator('.route-node:visible')).toHaveCount(2);
  for (let i = 1; i < 5; i++) { await next(page); await expect(graph(page)).toHaveAttribute('data-axis', axes[i]); await expect(page.locator('.route-node:visible')).toHaveCount([2, 3, 5, 6, 6][i]); }
  for (let i = 3; i >= 0; i--) { await act(page, 'back'); await act(page, 'skip'); await expect(graph(page)).toHaveAttribute('data-axis', axes[i]); await expect(page.locator('.route-node:visible')).toHaveCount([2, 3, 5, 6][i]); }
});

test('v6 reflow anchors, progression/selection, reduced motion, blank clicks, gestures and rapid interruption', async ({ page }) => {
  test.setTimeout(60_000); await start(page, 'THVH'); await next(page);
  await page.locator('[data-node="thread"]').click(); await act(page, 'skip'); await act(page, 'escape'); await act(page, 'skip');
  await act(page, 'next');
  for (const p of [0, .15, .3, .7, 1]) {
    await seek(page, p); await expect(graph(page)).toHaveCount(1);
    const gaps = await graph(page).evaluate(root => {
      return (window as any).grimoire.deck.routeGraph.edges.flatMap((edge: any) => {
        const line = root.querySelector<SVGPathElement>(`[data-edge="${edge.id}"]`)!;
        if (line.style.visibility === 'hidden') return [];
        return [[edge.from, 0], [edge.to, line.getTotalLength()]].map(([id, length]) => {
          const end = line.getPointAtLength(length as number), node = root.querySelector<HTMLElement>(`[data-node="${id}"]`)!;
          const border = node.querySelector<SVGPathElement>('.node-outline')!, total = border.getTotalLength(); let gap = Infinity;
          for (let i = 0; i <= 4000; i++) { const q = border.getPointAtLength(total * i / 4000); gap = Math.min(gap, Math.hypot(end.x - (parseFloat(node.style.left) + (q.x / 200 - .5) * node.offsetWidth), end.y - (parseFloat(node.style.top) + (q.y / 78 - .5) * node.offsetHeight))); }
          return gap;
        });
      });
    });
    gaps.forEach((gap: number) => expect(gap).toBeLessThan(.3));
    await page.screenshot({ path: `docs/qa/v6-reflow-${p * 100}.png` });
  }
  await act(page, 'skip'); await expect(page.locator('[data-node="thread"]')).toHaveClass(/visited/);
  await act(page, 'effects'); await act(page, 'back'); await expect(graph(page)).toHaveAttribute('data-axis', 'horizontal');
  await expect(page.locator('.route-node:visible')).toHaveCount(3); await act(page, 'next'); await expect(graph(page)).toHaveAttribute('data-axis', 'vertical');
  await expect(page.locator('.route-node:visible')).toHaveCount(5); await act(page, 'effects');
  const scene = await page.locator('#app').getAttribute('data-scene'); const viewport = (await page.locator('.graph-scroll').boundingBox())!;
  await page.mouse.click(viewport.x + 8, viewport.y + 8); await expect(page.locator('#app')).toHaveAttribute('data-scene', scene!);
  const zoom = Number(await graph(page).getAttribute('data-zoom'));
  await page.mouse.move(700, 400); await page.mouse.wheel(0, -60);
  await page.waitForFunction(expected => Math.abs(Number(document.querySelector<HTMLElement>('.route-diagram')?.dataset.zoom) - expected) < .002, zoom * Math.exp(.096));
  for (const action of ['next', 'back', 'next', 'minimap', 'home']) { await act(page, action); await seek(page, .22); }
  await act(page, 'skip'); await act(page, 'minimap'); await act(page, 'skip'); await act(page, 'home'); await act(page, 'skip');
  await page.locator('.cover').click(); await act(page, 'skip'); await act(page, 'next'); await seek(page, .2);
  await page.waitForTimeout(160); await expect(page.locator('[data-node="gather"]')).toBeHidden();
  await act(page, 'skip'); await expect(page.locator('.route-node:visible')).toHaveCount(2);
  await expect(page.locator('article')).toHaveCount(1); await expect(page.locator('.paper-burn-rim,.flutter-leaf,.outgoing-scene')).toHaveCount(0);
});

test('v6 validates the three orientation policies and ordered authored references', () => {
  const steps = ['start', 'turn', 'return'].map(id => ({ id, routeStep: 0 } as Slide));
  const base: RouteGraph = { nodes: [], edges: [] };
  const invalid = [
    { mode: 'diagonal' }, { mode: 'fixed-horizontal', initial: 'horizontal' },
    { mode: 'fixed-vertical', changes: [] }, { mode: 'timeline', changes: [] },
    { mode: 'timeline', initial: 'horizontal', changes: [{ atStep: 'missing', to: 'vertical' }] },
    { mode: 'timeline', initial: 'horizontal', changes: [{ atStep: 'return', to: 'vertical' }, { atStep: 'turn', to: 'horizontal' }] },
    { mode: 'timeline', initial: 'horizontal', changes: [{ atStep: 'turn', to: 'sideways' }] },
  ];
  invalid.forEach(orientation => expect(() => graphOrientation({ ...base, orientation } as RouteGraph, steps)).toThrow());
  const policy = graphOrientation({ ...base, orientation: { mode: 'timeline', initial: 'vertical', changes: [{ atStep: 'turn', to: 'horizontal' }, { atStep: 'return', to: 'vertical' }] } }, steps);
  expect(steps.map(s => policy.at(s.id))).toEqual(['vertical', 'horizontal', 'vertical']); expect(policy.final).toBe('vertical');
});

test('v6 quiet toolbar remains recoverable on pointer and keyboard focus', async ({ page }) => {
  await page.goto('/?deck=plain&rehearsal');
  const tools = page.locator('.presenter-tools'); await expect(tools).toHaveAttribute('data-idle', 'true', { timeout: 5000 });
  await page.getByLabel('Presenter controls', { exact: true }).hover(); await expect(tools).toHaveAttribute('data-idle', 'false');
  await page.getByLabel('Presenter controls', { exact: true }).click(); await page.getByLabel('Next beat or page', { exact: true }).focus();
  await page.waitForTimeout(3000); await expect(tools).toHaveAttribute('open', '');
  await page.locator('.cover').focus(); await page.mouse.move(40, 40); await expect(tools).not.toHaveAttribute('open', '', { timeout: 5000 });
});
