import { test, expect, type Page } from '@playwright/test';
async function act(page: Page, a: string) { await page.waitForFunction(() => !!(window as any).grimoire); await page.evaluate(a => (window as any).grimoire.act(a), a); }
async function seek(page: Page, p: number) { await page.evaluate(p => { const t = (window as any).grimoire.timeline; if (!t.paused) t.togglePause(); t.seek(p); }, p); }
async function opened(page: Page, deck = 'showcase') { await page.goto(`/?deck=${deck}&rehearsal`); await page.locator('.cover').click(); await act(page, 'skip'); }
test.beforeEach(async ({ page }) => { const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (['error', 'warning'].includes(m.type())) errors.push(m.text()); }); (page as any).errors = errors; });
test.afterEach(async ({ page }) => { expect((page as any).errors).toEqual([]); });

test('milestone 1: mini-map arrival precedes inscription, Home closes directly', async ({ page }) => {
  await page.goto('/?deck=sample&rehearsal'); await act(page, 'minimap');
  for (const p of [.1, .3, .5]) { await seek(page, p); await expect(page.locator('.scene-host')).toHaveCSS('opacity', '0'); await expect(page.locator('#app')).toHaveAttribute('data-phase', 'opening'); await page.screenshot({ path: `docs/qa/v2-map-cover-${p * 100}.png` }); }
  await seek(page, .6); await expect(page.locator('#app')).toHaveAttribute('data-phase', 'graphing');
  expect(Number(await page.locator('[data-edge="thread"]').getAttribute('data-progress'))).toBeLessThan(1);
  await page.screenshot({ path: 'docs/qa/v2-map-cover-reveal.png' }); await act(page, 'skip');
  await expect(page.locator('.route-node:visible')).toHaveCount(2);
  await act(page, 'next'); await act(page, 'skip'); await expect(page.locator('#app')).toHaveAttribute('data-phase', 'closed');
  await opened(page, 'sample'); await act(page, 'minimap');
  for (const p of [.05, .12, .2]) { await seek(page, p); await expect(page.locator('article[data-scene="@completed-graph"]')).toHaveCSS('opacity', '0'); await expect(page.locator('#app')).toHaveAttribute('data-phase', 'turning'); await page.screenshot({ path: `docs/qa/v2-map-slide-${p * 100}.png` }); }
  await seek(page, .45); await expect(page.locator('#app')).toHaveAttribute('data-phase', 'graphing');
  await act(page, 'home'); await expect(page.locator('#app')).toHaveAttribute('data-phase', 'closing'); await act(page, 'skip');
  await expect(page.locator('article,.flutter-leaf,.effect-defs')).toHaveCount(0);
});


test('milestone 2: source focus precedes path fire, then the seal and title inscribe over 600ms', async ({ page }) => {
  await opened(page, 'sample'); await act(page, 'next'); await act(page, 'skip');
  const source = page.locator('[data-node="begin"]');
  const position = await source.getAttribute('style');
  await act(page, 'next'); await seek(page, 0);
  const initialCamera = await page.locator('.graph-world').getAttribute('style');
  await seek(page, .15);
  await expect(page.locator('.route-diagram')).toHaveAttribute('data-growth-phase', 'focus');
  await expect(page.locator('[data-edge="thread"]')).toHaveAttribute('data-progress', '0.000');
  expect(await page.locator('.graph-world').getAttribute('style')).not.toBe(initialCamera);
  await expect(source).toHaveClass(/source-focus/);
  await page.screenshot({ path: 'docs/qa/v2-source-focus.png' });
  await seek(page, .5);
  const edge = Number(await page.locator('[data-edge="thread"]').getAttribute('data-progress'));
  expect(edge).toBeGreaterThan(0); expect(edge).toBeLessThan(1);
  await expect(page.locator('[data-node="discover"]')).toBeHidden();
  await page.screenshot({ path: 'docs/qa/v2-path.png' });
  await seek(page, .75);
  await expect(page.locator('[data-edge="thread"]')).toHaveAttribute('data-progress', '1.000');
  await expect(page.locator('[data-node="discover"]')).toHaveAttribute('data-node-stage', 'seal');
  await expect(page.locator('[data-node="discover"] .node-ink:not(.ink-front)')).toHaveAttribute('data-reveal-progress', '0.000');
  await page.screenshot({ path: 'docs/qa/v2-node-seal.png' });
  await seek(page, .94);
  const label = Number(await page.locator('[data-node="discover"] .node-ink:not(.ink-front)').getAttribute('data-reveal-progress'));
  expect(label).toBeGreaterThan(0); expect(label).toBeLessThan(1);
  await page.screenshot({ path: 'docs/qa/v2-node-title.png' }); await act(page, 'skip');
  await expect(page.locator('.route-diagram')).toHaveAttribute('data-camera-locked', 'false');
  expect(await source.getAttribute('style')).toBe(position);
  await opened(page); for (let i = 0; i < 6; i++) { await act(page, 'next'); await act(page, 'skip'); }
  await act(page, 'next'); await seek(page, .4);
  const progresses = await page.locator('[data-edge^="branch-"]').evaluateAll(paths => paths.map(p => Number((p as HTMLElement).dataset.progress)));
  expect(progresses).toHaveLength(5); progresses.forEach(p => { expect(p).toBeGreaterThan(0); expect(p).toBeLessThan(1); });
  await page.screenshot({ path: 'docs/qa/v2-parallel.png' }); await act(page, 'skip');
});


test('milestone 3: mouse drag, cursor zoom, click suppression and saved camera on node return', async ({ page }) => {
  await opened(page); await act(page, 'minimap'); await act(page, 'skip');
  const root = page.locator('.route-diagram');
  const pose = () => root.evaluate(el => ({ x: Number((el as HTMLElement).dataset.cameraX), y: Number((el as HTMLElement).dataset.cameraY), scale: Number((el as HTMLElement).dataset.zoom) }));
  const initial = await pose();
  const node = page.locator('[data-node="attention"]'); const r = (await node.boundingBox())!;
  await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2); await page.mouse.down();
  await page.mouse.move(r.x + r.width / 2 + 75, r.y + r.height / 2 + 35, { steps: 10 }); await page.mouse.up();
  await expect(page.locator('#app')).toHaveAttribute('data-scene', '@completed-graph');
  const panned = await pose(); expect(panned.x).toBeGreaterThan(initial.x + 50);
  const view = (await page.locator('.graph-scroll').boundingBox())!;
  const local = { x: view.width * .43, y: view.height * .46 };
  await page.mouse.move(view.x + local.x, view.y + local.y); await page.mouse.wheel(0, -190); await page.waitForTimeout(220);
  const zoomed = await pose(); expect(zoomed.scale).toBeGreaterThan(panned.scale);
  // Cursor anchoring in graph-local coordinates (outer book is scaled 1.025).
  const scale = await page.locator('.graph-scroll').evaluate(el => el.getBoundingClientRect().width / (el as HTMLElement).clientWidth);
  const worldBefore = (local.x / scale - panned.x) / panned.scale, worldAfter = (local.x / scale - zoomed.x) / zoomed.scale;
  expect(Math.abs(worldAfter - worldBefore)).toBeLessThan(1);
  await page.waitForTimeout(410); await node.click(); await act(page, 'skip');
  await page.keyboard.press('Escape'); await act(page, 'skip');
  const restored = await pose(); expect(restored).toEqual(zoomed);
  await page.setViewportSize({ width: 1280, height: 800 }); await page.waitForTimeout(100);
  expect((await pose()).scale).toBeCloseTo(zoomed.scale, 3);
  await page.getByRole('button', { name: 'Fit graph', exact: true }).click();
  await page.screenshot({ path: 'docs/qa/v2-interactive-map.png' });
});

test('milestone 3: native touch-emulated pan and centroid pinch; motion lock and cleanup', async ({ page, context }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  const cdp = await context.newCDPSession(page);
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 2 });
  await opened(page); await act(page, 'minimap'); await seek(page, .55);
  const root = page.locator('.route-diagram');
  await expect(root).toHaveAttribute('data-camera-locked', 'true');
  const lockedPose = await page.locator('.graph-world').getAttribute('style');
  const bounds = (await page.locator('.graph-scroll').boundingBox())!;
  let x = Math.round(bounds.x + bounds.width * .5), y = Math.round(bounds.y + bounds.height * .6);
  const touch = (type: string, points: { x: number; y: number; id: number }[]) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points.map(p => ({ ...p, radiusX: 3, radiusY: 3, force: 1 })) });
  await touch('touchStart', [{ id: 1, x, y }]); await touch('touchMove', [{ id: 1, x: x + 40, y: y + 20 }]); await touch('touchEnd', []);
  expect(await page.locator('.graph-world').getAttribute('style')).toBe(lockedPose);
  await act(page, 'skip'); await expect(root).toHaveAttribute('data-camera-locked', 'false');
  const nodeBounds = (await page.locator('[data-node="wonder"]').boundingBox())!;
  x = Math.round(nodeBounds.x + nodeBounds.width / 2); y = Math.round(nodeBounds.y + nodeBounds.height / 2);
  const before = Number(await root.getAttribute('data-camera-x'));
  await touch('touchStart', [{ id: 1, x, y }]);
  for (let i = 1; i <= 6; i++) await touch('touchMove', [{ id: 1, x: x + i * 10, y: y + i * 4 }]);
  await touch('touchEnd', []);
  expect(Number(await root.getAttribute('data-camera-x'))).toBeGreaterThan(before + 30);
  const initialScale = Number(await root.getAttribute('data-zoom'));
  await touch('touchStart', [{ id: 1, x: x - 45, y }, { id: 2, x: x + 45, y }]);
  for (let i = 1; i <= 7; i++) await touch('touchMove', [{ id: 1, x: x - 45 - i * 7, y }, { id: 2, x: x + 45 + i * 7, y }]);
  await touch('touchEnd', []);
  expect(Number(await root.getAttribute('data-zoom'))).toBeGreaterThan(initialScale * 1.6);
  await expect(page.locator('#app')).toHaveAttribute('data-scene', '@completed-graph');
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await page.screenshot({ path: 'docs/qa/v2-touch-map.png' });
  await touch('touchStart', [{ id: 1, x, y }]); await touch('touchMove', [{ id: 1, x: x + 30, y }]);
  await act(page, 'home'); await touch('touchEnd', []); await act(page, 'skip');
  await expect(page.locator('#app')).toHaveAttribute('data-phase', 'closed');
  await expect(page.locator('article,.effect-defs,.paper-burn-rim,.flutter-leaf')).toHaveCount(0);
});

test('milestone 4: seeded fibrous combustion through real holes at 15/35/60/85 percent', async ({ page }) => {
  await opened(page); await act(page, 'next'); await act(page, 'skip');
  for (const origins of [1, 2, 3]) {
    await page.evaluate(n => { (window as any).grimoire.rehearsal.burnOrigins = n; }, origins);
    await act(page, 'next');
    let previous = '';
    for (const p of [.15, .35, .6, .85]) {
      await seek(page, p);
      const rim = page.locator('.paper-burn-rim');
      await expect(rim).toHaveAttribute('data-origins', String(origins));
      const d = (await page.locator('.paper-burn-defs path').getAttribute('d'))!;
      expect(d).not.toBe(previous); previous = d;
      expect((d.match(/M/g) ?? []).length).toBe(origins);
      const outgoing = page.locator('.paper-burn-outgoing');
      await expect(outgoing).toHaveCSS('opacity', '1');
      expect(await outgoing.evaluate(el => getComputedStyle(el).maskImage)).toContain('paper-burn');
      expect(Number(await rim.locator('path').nth(2).getAttribute('stroke-width'))).toBeLessThanOrEqual(2.4);
      expect(Number(await page.locator('.paper-burn-particles').getAttribute('data-live-ash'))).toBeLessThanOrEqual(96);
      await page.screenshot({ path: `docs/qa/v2-burn-${origins}-${p * 100}.png` });
    }
    await seek(page, .35);
    const mask = await page.locator('.paper-burn-defs path').getAttribute('d');
    await seek(page, .6); await seek(page, .35);
    expect(await page.locator('.paper-burn-defs path').getAttribute('d')).toBe(mask);
    await act(page, 'skip'); await act(page, 'replay'); await seek(page, .35);
    expect(await page.locator('.paper-burn-defs path').getAttribute('d')).toBe(mask);
    await act(page, 'skip');
    await expect(page.locator('.paper-burn-defs,.paper-burn-rim,.paper-burn-particles')).toHaveCount(0);
  }
});


test('milestone 5: object ending choice is compiled without exposing per-page effects', async ({ page }) => {
  await opened(page);
  await expect(page.locator('#app')).toHaveAttribute('data-content', 'showcase');
  await act(page, 'minimap'); await act(page, 'skip');
  await page.locator('[data-node="pattern"]').click(); await act(page, 'skip');
  await expect(page.locator('.katex')).toHaveCount(1);
  await expect(page.locator('.katex-error')).toHaveCount(0);
  await page.screenshot({ path: 'docs/qa/v2-formula.png' });
  await act(page, 'home'); await act(page, 'skip');
  await opened(page, 'plain'); await expect(page.locator('[data-action="minimap"]')).toBeHidden();
  await act(page, 'next'); await act(page, 'skip'); await act(page, 'next'); await act(page, 'skip');
  await expect(page.locator('#app')).toHaveAttribute('data-phase', 'closed');
});

test('closing interrupts a partial map without completing its hidden network first', async ({ page }) => {
  await opened(page); await act(page, 'minimap'); await seek(page, .72);
  const progress = () => page.locator('.route-diagram:not(.ink-front) .route-node').evaluateAll(nodes => nodes.map(n => ({ visible: (n as HTMLElement).style.visibility, ink: (n as HTMLElement).dataset.inkProgress })));
  const before = await progress(); expect(before.some(n => n.ink !== '1.000')).toBe(true);
  await act(page, 'home');
  expect(await progress()).toEqual(before);
  await seek(page, .1); expect(await progress()).toEqual(before);
  await page.screenshot({ path: 'docs/qa/v2-interrupted-map-close.png' });
  await act(page, 'home'); await act(page, 'skip');
  await expect(page.locator('article,.effect-defs,.paper-burn-rim,.flutter-leaf')).toHaveCount(0);
  await page.locator('.cover').click(); await act(page, 'skip');
  await act(page, 'minimap'); await seek(page, .45); await act(page, 'back'); await act(page, 'skip');
  await act(page, 'minimap'); await act(page, 'skip');
  await expect(page.locator('article')).toHaveCount(1);
  await expect(page.locator('.route-node')).toHaveCount(9);
});
