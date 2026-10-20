import { test, expect, type Page } from '@playwright/test';
async function act(page: Page, action: string) { await page.waitForFunction(() => !!(window as any).grimoire); await page.evaluate(a => (window as any).grimoire.act(a), action); }
async function seek(page: Page, p: number) { await page.evaluate(p => { const t = (window as any).grimoire.timeline; if (!t.paused) t.togglePause(); t.seek(p); }, p); }
async function next(page: Page) { await act(page, 'next'); await act(page, 'skip'); }
async function roots(page: Page) { await page.goto('/?deck=showcase&rehearsal'); await page.locator('.cover').click(); await act(page, 'skip'); for (let i = 0; i < 5; i++) await next(page); }
const camera = (page: Page) => page.locator('.route-diagram:not(.ink-front)').evaluate(el => ({ x: Number((el as HTMLElement).dataset.cameraX), y: Number((el as HTMLElement).dataset.cameraY), zoom: Number((el as HTMLElement).dataset.zoom) }));
test.beforeEach(async ({ page }) => { const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (['error', 'warning'].includes(m.type())) errors.push(m.text()); }); (page as any).errors = errors; });
test.afterEach(async ({ page }) => expect((page as any).errors).toEqual([]));

test('v3 initial region, visible-only Fit, source-first tracking, exact seal attachment in both axes', async ({ page }) => {
  test.setTimeout(60_000);
  await roots(page);
  await expect(page.locator('.graph-page h1')).toHaveCount(0);
  await expect(page.locator('.route-node:visible')).toHaveCount(2);
  expect((await camera(page)).zoom).toBeGreaterThan(1.4);
  const root = page.locator('.route-diagram');
  await expect(root).toHaveAttribute('data-fit-scope', 'visible');
  await page.getByRole('button', { name: 'Fit graph', exact: true }).click();
  const bounds = JSON.parse((await root.getAttribute('data-fit-bounds'))!);
  const future = await page.locator('[data-node="sharing"]').evaluate(el => (el as HTMLElement).offsetLeft);
  expect(bounds.right).toBeLessThan(future / 2);
  await page.screenshot({ path: 'docs/qa/v3-initial-fit.png' });
  await act(page, 'next'); await seek(page, .2);
  const source = await camera(page); await page.screenshot({ path: 'docs/qa/v3-source.png' });
  await seek(page, .5); const expansion = await camera(page);
  expect(Math.abs(expansion.x - source.x) + Math.abs(expansion.y - source.y)).toBeGreaterThan(20);
  const p = Number(await page.locator('[data-edge="first-thread"]').getAttribute('data-progress'));
  expect(p).toBeGreaterThan(0); expect(p).toBeLessThan(1);
  await page.screenshot({ path: 'docs/qa/v3-tracking.png' }); await act(page, 'skip');
  await act(page, 'next'); await seek(page, .4);
  const branches = await page.locator('[data-edge^="branch-"]').evaluateAll(paths => paths.map(el => Number((el as HTMLElement).dataset.progress)));
  branches.forEach(p => { expect(p).toBeGreaterThan(0); expect(p).toBeLessThan(1); });
  await page.screenshot({ path: 'docs/qa/v3-parallel.png' }); await act(page, 'skip');
  await next(page);
  for (const axis of ['horizontal', 'vertical']) {
    if (axis === 'vertical') for (let i = 0; i < 4; i++) await next(page);
    await expect(root).toHaveAttribute('data-fit-scope', 'full');
    const gaps = await root.evaluate(root => {
      const graph = (window as any).grimoire.deck.routeGraph;
      return graph.edges.flatMap((edge: any) => {
        const line = root.querySelector<SVGPathElement>(`[data-edge="${edge.id}"]`)!;
        return [[edge.from, 0], [edge.to, line.getTotalLength()]].map(([id, length]) => {
          const end = line.getPointAtLength(length as number), node = root.querySelector<HTMLElement>(`[data-node="${id}"]`)!;
          const border = node.querySelector<SVGPathElement>('.node-outline')!, total = border.getTotalLength();
          let gap = Infinity;
          for (let i = 0; i <= 4000; i++) { const p = border.getPointAtLength(total * i / 4000); gap = Math.min(gap, Math.hypot(end.x - (parseFloat(node.style.left) + (p.x / 200 - .5) * node.offsetWidth), end.y - (parseFloat(node.style.top) + (p.y / 78 - .5) * node.offsetHeight))); }
          return gap;
        });
      });
    });
    gaps.forEach(gap => expect(gap).toBeLessThan(.3));
    await page.screenshot({ path: `docs/qa/v3-anchors-${axis}.png` });
  }
});


test('v3 context Mini-map expands the current map and burns back to its originating state', async ({ page }) => {
  await roots(page); await next(page);
  const origin = await page.locator('#app').getAttribute('data-scene');
  await page.evaluate(() => { (window as any).savedRoot = document.querySelector('[data-node="wonder"]'); (window as any).savedWorld = document.querySelector('.graph-world'); });
  const before = await camera(page);
  await act(page, 'minimap'); await seek(page, 0);
  await expect(page.locator('#app')).toHaveAttribute('data-phase', 'graphing');
  await expect(page.locator('.flutter-leaf,.outgoing-scene')).toHaveCount(0);
  expect(await camera(page)).toEqual(before);
  expect(await page.evaluate(() => (window as any).savedRoot === document.querySelector('[data-node="wonder"]') && (window as any).savedWorld === document.querySelector('.graph-world'))).toBe(true);
  await expect(page.locator('[data-node="wonder"]')).toHaveAttribute('data-ink-progress', '1.000');
  await expect(page.locator('[data-node="attention"]')).toHaveAttribute('data-ink-progress', '1.000');
  // v6: final preview first reflows to the authored final orientation.
  // The bounded overview preserves the natural source focus after reflow;
  // sample path propagation before its final coordinated handoff.
  await seek(page, .65); await page.screenshot({ path: 'docs/qa/v3-map-in-place.png' });
  const p = Number(await page.locator('[data-edge="branch-question"]').getAttribute('data-progress')); expect(p).toBeGreaterThan(0); expect(p).toBeLessThan(1);
  await act(page, 'skip'); await expect(page.locator('.route-diagram')).toHaveAttribute('data-fit-scope', 'full');
  await act(page, 'back'); await seek(page, .4);
  await expect(page.locator('#app')).toHaveAttribute('data-scene', origin!);
  await expect(page.locator('.route-diagram')).toHaveAttribute('data-direction', 'back');
  await expect(page.locator('.flutter-leaf')).toHaveCount(0);
  const back = Number(await page.locator('[data-edge="branch-question"]').getAttribute('data-progress'));
  await seek(page, .7); expect(Number(await page.locator('[data-edge="branch-question"]').getAttribute('data-progress'))).toBeLessThanOrEqual(back);
  await page.screenshot({ path: 'docs/qa/v3-burn-back.png' }); await act(page, 'skip');
  await expect(page.locator('.route-node:visible')).toHaveCount(3);
  await expect(page.locator('.route-diagram')).toHaveAttribute('data-fit-scope', 'visible');
  await expect(page.locator('.route-diagram')).toHaveAttribute('data-camera-locked', 'false');
  // Changing orientation then using Mini-map retains this graph coordinate system.
  for (let i = 0; i < 3; i++) await next(page);
  await expect(page.locator('.route-diagram')).toHaveAttribute('data-axis', 'vertical');
  await act(page, 'minimap'); await act(page, 'skip');
  await expect(page.locator('.route-diagram')).toHaveAttribute('data-axis', 'vertical');
  await next(page); await expect(page.locator('#app')).toHaveAttribute('data-phase', 'closed');
  await act(page, 'minimap'); await act(page, 'skip');
  // v6: the authored final orientation is vertical, independently of Home.
  await expect(page.locator('.route-diagram')).toHaveAttribute('data-axis', 'vertical');
});

test('v3 page journeys reverse, chapter combustion pairs, and recap lifts reverse its fall', async ({ page }) => {
  await page.goto('/?deck=sample&rehearsal'); await page.locator('.cover').click(); await act(page, 'skip');
  await act(page, 'next'); await seek(page, .2);
  await expect(page.locator('#app')).toHaveAttribute('data-phase', 'turning');
  const angles = await page.locator('.flutter-leaf').evaluateAll(leaves => leaves.map(el => (el as HTMLElement).style.transform));
  await act(page, 'skip'); await act(page, 'back'); await seek(page, .3);
  await expect(page.locator('#app')).toHaveAttribute('data-phase', 'turning');
  expect(await page.locator('.flutter-leaf').evaluateAll(leaves => leaves.map(el => (el as HTMLElement).style.transform))).not.toEqual(angles);
  await page.screenshot({ path: 'docs/qa/v3-reverse-page.png' }); await act(page, 'skip');
  await expect(page.locator('#app')).toHaveAttribute('data-scene', 'welcome');
  await act(page, 'minimap'); await act(page, 'skip'); await act(page, 'back');
  await expect(page.locator('#app')).toHaveAttribute('data-phase', 'turning'); await act(page, 'skip');
  await expect(page.locator('#app')).toHaveAttribute('data-scene', 'welcome');
  await roots(page); await act(page, 'back'); await act(page, 'skip'); // chapter before graph
  await act(page, 'back'); await seek(page, .35); await expect(page.locator('.paper-burn-outgoing')).toHaveCount(1); await act(page, 'skip');
  await roots(page); for (let i = 0; i < 8; i++) await next(page); // first recap
  await expect(page.locator('#app')).toHaveAttribute('data-phase', 'ready');
  await act(page, 'back'); await seek(page, .35);
  await expect(page.locator('#app')).toHaveAttribute('data-phase', 'dropping');
  const drop = Number(await page.locator('.loose-parchment[aria-hidden="true"]').getAttribute('data-drop-progress'));
  expect(drop).toBeLessThan(1); expect(drop).toBeGreaterThan(0);
  await page.screenshot({ path: 'docs/qa/v3-reverse-drop.png' }); await act(page, 'skip');
  await expect(page.locator('article')).toHaveCount(1);
});


test('v3 material: reveal and erase use irregular fronts, page fires remain replayable', async ({ page }) => {
  await page.goto('/?deck=showcase&rehearsal'); await page.locator('.cover').click(); await act(page, 'skip');
  await act(page, 'next'); await seek(page, .15);
  const out = page.locator('.outgoing-scene [data-block="title"] > .ink-content:not(.ink-front)');
  await expect(out).toHaveAttribute('data-ink-direction', 'out');
  const p = Number(await out.getAttribute('data-reveal-progress')); expect(p).toBeGreaterThan(0); expect(p).toBeLessThan(1);
  await page.screenshot({ path: 'docs/qa/v3-ink-erase.png' });
  await seek(page, .7); await page.screenshot({ path: 'docs/qa/v3-ink-multiline.png' }); await act(page, 'skip');
  for (const origins of [1, 3]) {
    await page.evaluate(n => { (window as any).grimoire.rehearsal.burnOrigins = n; }, origins);
    await act(page, 'next');
    for (const p of [.15, .35, .6, .85]) { await seek(page, p); await expect(page.locator('.paper-burn-rim')).toHaveAttribute('data-origins', String(origins)); await page.screenshot({ path: `docs/qa/v3-paper-${origins}-${p * 100}.png` }); }
    await act(page, 'skip'); await act(page, 'back'); await seek(page, .35);
    await expect(page.locator('.paper-burn-outgoing')).toHaveCount(1);
    await expect(page.locator('.paper-burn-rim feGaussianBlur')).toHaveCount(2);
    await page.screenshot({ path: `docs/qa/v3-paper-reverse-${origins}.png` }); await act(page, 'skip');
    if (origins === 1) await next(page);
  }
  await act(page, 'home'); await act(page, 'skip');
  await expect(page.locator('article,.paper-burn-rim,.paper-burn-particles,.effect-defs,.flutter-leaf')).toHaveCount(0);
});

test('v3 contextual replay, cover Back, and reduced-motion node return preserve navigation', async ({ page }) => {
  await page.goto('/?deck=showcase&rehearsal'); await act(page, 'minimap'); await seek(page, .2);
  await act(page, 'replay'); await seek(page, .3);
  await expect(page.locator('#app')).toHaveAttribute('data-scene', '@completed-graph');
  await expect(page.locator('.scene-host')).toHaveCSS('opacity', '0');
  await act(page, 'skip'); await act(page, 'back');
  await expect(page.locator('#app')).toHaveAttribute('data-phase', 'closing'); await act(page, 'skip');
  await roots(page);
  const initial = await camera(page), node = (await page.locator('[data-node="wonder"]').boundingBox())!;
  await page.mouse.move(node.x + node.width / 2, node.y + node.height / 2); await page.mouse.down(); await page.mouse.move(node.x + node.width / 2 + 40, node.y + node.height / 2 + 20, { steps: 5 }); await page.mouse.up();
  expect((await camera(page)).x).toBeGreaterThan(initial.x + 30);
  await expect(page.locator('#app')).not.toHaveAttribute('data-scene', 'wonder-a');
  await page.getByRole('button', { name: 'Fit graph', exact: true }).click();
  await page.setViewportSize({ width: 1280, height: 720 }); await page.waitForTimeout(100);
  await expect(page.locator('.route-diagram')).toHaveAttribute('data-fit-scope', 'visible');
  const fit = JSON.parse((await page.locator('.route-diagram').getAttribute('data-fit-bounds'))!);
  const hidden = await page.locator('[data-node="attention"]').evaluate(el => parseFloat((el as HTMLElement).style.left));
  expect(fit.right).toBeLessThan(hidden);
  await act(page, 'effects'); // reduced-motion semantics in the same graph
  const pose = await camera(page);
  await page.waitForTimeout(420); await page.locator('[data-node="wonder"]').click();
  await act(page, 'escape');
  expect(await camera(page)).toEqual(pose);
  await act(page, 'home'); await expect(page.locator('#app')).toHaveAttribute('data-phase', 'closed');
});
