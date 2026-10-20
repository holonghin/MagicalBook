import { test, expect, type Page } from '@playwright/test';
async function act(page: Page, action: string) { await page.waitForFunction(() => !!(window as any).grimoire); await page.evaluate(a => (window as any).grimoire.act(a), action); }
async function seek(page: Page, p: number) { await page.evaluate(p => { const t = (window as any).grimoire.timeline; if (!t.paused) t.togglePause(); t.seek(p); }, p); }
async function next(page: Page) { await act(page, 'next'); await act(page, 'skip'); }
async function vertical(page: Page) {
  await page.goto('/?deck=showcase&rehearsal'); await page.locator('.cover').click(); await act(page, 'skip');
  for (let i = 0; i < 9; i++) await next(page);
  await expect(page.locator('.route-diagram')).toHaveAttribute('data-axis', 'vertical');
}
test.beforeEach(async ({ page }) => { const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (['warning', 'error'].includes(m.type())) errors.push(m.text()); }); (page as any).errors = errors; });
test.afterEach(async ({ page }) => expect((page as any).errors).toEqual([]));

test('v5.1 exact vertical Mini-map Home Mini-map regression', async ({ page }) => {
  await vertical(page); await act(page, 'minimap'); await act(page, 'skip');
  await expect(page.locator('.route-diagram')).toHaveAttribute('data-axis', 'vertical');
  await act(page, 'home'); await act(page, 'skip');
  await expect(page.locator('#app')).toHaveAttribute('data-phase', 'closed');
  await act(page, 'minimap');
  for (const p of [.1, .3, .5, .7, .9, 1]) {
    await seek(page, p);
    await expect(page.locator('.route-diagram')).toHaveCount(1);
    await expect(page.locator('.route-diagram')).toHaveAttribute('data-axis', 'vertical');
    await page.screenshot({ path: `docs/qa/v5-map-reopen-${p * 100}.png` });
  }
  await act(page, 'skip'); await expect(page.locator('.route-node:visible')).toHaveCount(9);
});

test('v6 restart resets slideshow state while graph identity and final preview remain stable', async ({ page }) => {
  test.setTimeout(60_000);
  await vertical(page); await act(page, 'minimap'); await act(page, 'skip');
  await page.evaluate(() => { (window as any).savedGraph = (window as any).grimoire.graphState; (window as any).savedViewport = document.querySelector('.route-diagram'); });
  await page.locator('[data-node="wonder"]').click(); await act(page, 'skip');
  await act(page, 'home'); await seek(page, .35); await page.screenshot({ path: 'docs/qa/v5-node-home.png' }); await act(page, 'skip');
  await page.locator('.cover').click(); await act(page, 'skip'); // v6: ordinary opening intentionally restarts slideshow progress
  for (let i = 0; i < 5; i++) await next(page); // first authored orientation, independent of the previous preview
  await expect(page.locator('.route-diagram')).toHaveAttribute('data-axis', 'horizontal');
  await act(page, 'minimap'); await act(page, 'skip');
  await expect(page.locator('.route-diagram')).toHaveAttribute('data-axis', 'vertical');
  await expect(page.locator('[data-node="wonder"]')).not.toHaveClass(/visited/);
  expect(await page.evaluate(() => (window as any).savedGraph === (window as any).grimoire.graphState && (window as any).savedViewport === document.querySelector('.route-diagram'))).toBe(true);
  await act(page, 'home'); await act(page, 'skip'); await act(page, 'minimap'); await seek(page, .31);
  await act(page, 'home'); await seek(page, .3); await act(page, 'skip');
  await act(page, 'minimap'); await seek(page, .8);
  await expect(page.locator('.route-diagram')).toHaveAttribute('data-axis', 'vertical');
  await act(page, 'skip');
  // Deliberate authored horizontal/vertical choices via normal graph navigation.
  await act(page, 'home'); await act(page, 'skip'); await page.locator('.cover').click(); await act(page, 'skip');
  for (let i = 0; i < 9; i++) await next(page);
  await expect(page.locator('.route-diagram')).toHaveAttribute('data-axis', 'vertical');
  await act(page, 'minimap'); await act(page, 'skip'); await act(page, 'home'); await act(page, 'skip'); await act(page, 'minimap'); await act(page, 'skip');
  await expect(page.locator('.route-diagram')).toHaveAttribute('data-axis', 'vertical');
  expect(await page.evaluate(() => (window as any).grimoire.graphViews.size)).toBe(1);
  // A different book gets its declared default, never the previous instance's state.
  await page.goto('/?deck=sample&rehearsal'); await act(page, 'minimap'); await act(page, 'skip');
  await expect(page.locator('.route-diagram')).toHaveAttribute('data-axis', 'horizontal');
  await expect(page.locator('#app')).toHaveAttribute('data-active-graph-id', 'sample:route');
});

// The v5.1 last-view/layout-mutation contract is superseded by the authored
// v6 policy matrix and reflow/anchor tests in polish-v6.spec.ts.

test('five printed parchment invocations vary, stay deterministic in flight and settle at the page', async ({ page }) => {
  test.setTimeout(60_000); // five complete invocations and fifteen frame captures
  await vertical(page); for (let i = 0; i < 4; i++) await next(page); // first recap
  await expect(page.locator('#app')).toHaveAttribute('data-scene', 'recap-question');
  const landingBounds = (await page.locator('article').boundingBox())!;
  await page.evaluate(() => { (window as any).grimoire.rehearsal.dropSeed = 510; });
  const transforms: string[] = [], seeds: string[] = [], durations: number[] = [];
  const landing = 1 / (.67 + .33 / .85);
  for (let invocation = 0; invocation < 5; invocation++) {
    await act(page, 'replay'); await seek(page, .4 * landing);
    const sheet = page.locator('article.falling-paper');
    const mid = await sheet.evaluate(el => (el as HTMLElement).style.transform);
    transforms.push(mid); seeds.push((await sheet.getAttribute('data-drop-seed'))!);
    durations.push(await page.evaluate(() => (window as any).grimoire.timeline.duration));
    await page.screenshot({ path: `docs/qa/v5-drop-${invocation + 1}-40.png` });
    await seek(page, .8 * landing); await seek(page, .4 * landing);
    expect(await sheet.evaluate(el => (el as HTMLElement).style.transform)).toBe(mid);
    await seek(page, .66 * landing);
    await expect(sheet.locator('[data-block="title"] > .ink-content')).toHaveAttribute('data-reveal-progress', '1.000');
    await seek(page, .75 * landing);
    await expect(sheet.locator('[data-block="title"] > .ink-content')).toHaveAttribute('data-reveal-progress', '1.000');
    await expect(sheet).not.toHaveAttribute('data-drop-progress', '1.000');
    expect(await sheet.locator('[data-block="title"]').count()).toBe(1); // ink is inside moving sheet
    await page.screenshot({ path: `docs/qa/v5-drop-${invocation + 1}-75.png` });
    await seek(page, landing);
    await expect(sheet.locator('[data-block="title"] > .ink-content')).toHaveAttribute('data-reveal-progress', '1.000');
    expect(await sheet.evaluate(el => new DOMMatrix(getComputedStyle(el).transform).isIdentity)).toBe(true);
    // The shared book camera deliberately crops the outer paper by 2.5%.
    // Landing must match the settled page exactly; its readable content is safe.
    const box = (await sheet.boundingBox())!;
    for (const key of ['x', 'y', 'width', 'height'] as const) expect(box[key]).toBeCloseTo(landingBounds[key], 2);
    const content = (await sheet.locator('.page-content').boundingBox())!;
    expect(content.x).toBeGreaterThan(0); expect(content.y).toBeGreaterThan(0); expect(content.x + content.width).toBeLessThan(1440); expect(content.y + content.height).toBeLessThan(900);
    await page.screenshot({ path: `docs/qa/v5-drop-${invocation + 1}-land.png` });
    await act(page, 'skip'); await expect(page.locator('.effect-defs,.ink-front')).toHaveCount(0);
  }
  expect(new Set(transforms).size).toBe(5); expect(new Set(seeds).size).toBe(5);
  durations.forEach(t => { expect(t).toBeGreaterThan(1300 * .88); expect(t).toBeLessThan(1500 * 1.12); });
  // Fresh normal invocations use sampled seeds rather than the rehearsal source.
  await page.evaluate(() => { delete (window as any).grimoire.rehearsal.dropSeed; });
  await act(page, 'replay'); await seek(page, .4); const first = await page.locator('.falling-paper').getAttribute('data-drop-seed'); await act(page, 'skip');
  await act(page, 'replay'); await seek(page, .4); expect(await page.locator('.falling-paper').getAttribute('data-drop-seed')).not.toBe(first); await act(page, 'skip');
  await act(page, 'effects'); await act(page, 'replay'); await expect(page.locator('#app')).toHaveAttribute('data-phase', 'ready');
  await expect(page.locator('.effect-defs,.flutter-leaf')).toHaveCount(0);
});
