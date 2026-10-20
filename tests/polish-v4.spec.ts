import { test, expect, type Page } from '@playwright/test';
async function act(page: Page, action: string) { await page.waitForFunction(() => !!(window as any).grimoire); await page.evaluate(a => (window as any).grimoire.act(a), action); }
async function seek(page: Page, p: number) { await page.evaluate(p => { const t = (window as any).grimoire.timeline; if (!t.paused) t.togglePause(); t.seek(p); }, p); }
async function next(page: Page) { await act(page, 'next'); await act(page, 'skip'); }
async function roots(page: Page) { await page.goto('/?deck=showcase&rehearsal'); await page.locator('.cover').click(); await act(page, 'skip'); for (let i = 0; i < 5; i++) await next(page); }
const graph = (page: Page) => page.locator('.route-diagram:not(.ink-front)');
const pose = (page: Page) => graph(page).evaluate(el => ({ x: (el as HTMLElement).dataset.cameraX, y: (el as HTMLElement).dataset.cameraY, scale: (el as HTMLElement).dataset.zoom }));
test.beforeEach(async ({ page }) => { const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (['error', 'warning'].includes(m.type())) errors.push(m.text()); }); (page as any).errors = errors; });
test.afterEach(async ({ page }) => expect((page as any).errors).toEqual([]));

test('v4 node roundtrips and node Mini-map reuse the graph without page turns', async ({ page }) => {
  await roots(page); await next(page);
  const origin = await page.locator('#app').getAttribute('data-scene');
  await page.evaluate(() => { (window as any).savedWorld = document.querySelector('.graph-world'); (window as any).savedAttention = document.querySelector('[data-node="attention"]'); });
  const saved = await pose(page);
  for (const action of ['back', 'escape', 'next']) {
    await page.locator('[data-node="attention"]').click(); await act(page, 'skip');
    await act(page, action); await seek(page, 0);
    await expect(page.locator('#app')).toHaveAttribute('data-navigation-intent', 'node-return');
    await expect(page.locator('.flutter-leaf')).toHaveCount(0);
    expect(Number((await pose(page)).scale)).toBeGreaterThan(Number(saved.scale));
    await seek(page, .45); await page.screenshot({ path: `docs/qa/v4-return-${action}.png` });
    await expect(graph(page)).toHaveAttribute('data-camera-locked', 'true');
    await expect(page.locator('[data-node="sharing"]')).toBeHidden();
    await act(page, 'skip');
    await expect(page.locator('#app')).toHaveAttribute('data-scene', origin!);
    expect(await pose(page)).toEqual(saved);
    expect(await page.evaluate(() => (window as any).savedWorld === document.querySelector('.graph-world') && (window as any).savedAttention === document.querySelector('[data-node="attention"]'))).toBe(true);
    await expect(page.locator('.route-node:visible')).toHaveCount(3);
  }
  await page.locator('[data-node="attention"]').click(); await act(page, 'skip');
  await act(page, 'minimap'); await seek(page, .2);
  await expect(page.locator('#app')).toHaveAttribute('data-navigation-intent', 'node-map');
  await expect(page.locator('.flutter-leaf')).toHaveCount(0);
  await expect(page.locator('[data-node="sharing"]')).toBeHidden();
  await page.screenshot({ path: 'docs/qa/v4-node-map-return.png' });
  await seek(page, .7); await page.screenshot({ path: 'docs/qa/v4-node-map-expand.png' }); await act(page, 'skip');
  await expect(page.locator('.route-node:visible')).toHaveCount(9);
  expect(await page.evaluate(() => (window as any).savedWorld === document.querySelector('.graph-world'))).toBe(true);
  await next(page); await expect(page.locator('#app')).toHaveAttribute('data-phase', 'closed');
});

test('v4 graph next/back, orientation changes and Mini-map never turn book pages', async ({ page }) => {
  await roots(page);
  for (let i = 0; i < 7; i++) {
    await act(page, 'next'); await seek(page, .45);
    await expect(page.locator('.flutter-leaf')).toHaveCount(0); await act(page, 'skip');
  }
  for (let i = 0; i < 7; i++) {
    await act(page, 'back'); await seek(page, .45);
    await expect(page.locator('.flutter-leaf')).toHaveCount(0); await act(page, 'skip');
  }
  await act(page, 'minimap'); await seek(page, .4); await expect(page.locator('.flutter-leaf')).toHaveCount(0); await act(page, 'skip');
  await expect(page.locator('article')).toHaveCount(1); await expect(page.locator('.route-node')).toHaveCount(9);
});

test('v4 source and complete branch groups stay within the safe graph viewport', async ({ page }) => {
  await roots(page);
  const safe = async (ids: string[]) => {
    const viewport = (await page.locator('.graph-scroll').boundingBox())!;
    for (const id of ids) {
      const node = page.locator(`[data-node="${id}"]`);
      if (await node.getAttribute('data-ink-progress') === '0.000') continue;
      const r = (await node.boundingBox())!;
      expect(r.x).toBeGreaterThan(viewport.x + 14); expect(r.y).toBeGreaterThan(viewport.y + 14);
      expect(r.x + r.width).toBeLessThan(viewport.x + viewport.width - 14); expect(r.y + r.height).toBeLessThan(viewport.y + viewport.height - 14);
    }
  };
  for (const [event, ids] of [['single', ['wonder', 'attention']], ['parallel', ['attention', 'question', 'pattern', 'story', 'experiment', 'reflection']]] as const) {
    await act(page, 'next');
    for (const p of [.2, .5, .7, .85, 1]) {
      await seek(page, p);
      if (p >= .5) await safe([...ids]);
      await page.screenshot({ path: `docs/qa/v4-${event}-${p * 100}.png` });
    }
    await act(page, 'skip'); await expect(graph(page)).toHaveAttribute('data-camera-locked', 'false');
  }
  await expect(graph(page)).toHaveAttribute('data-fit-scope', 'visible');
  await page.getByRole('button', { name: 'Fit graph', exact: true }).click();
  await safe(['wonder', 'memory', 'attention', 'question', 'pattern', 'story', 'experiment', 'reflection']);
});

test('v4 semantic zoom keeps readable ink, stable seals, useful overview labels and distinct states', async ({ page }) => {
  await page.goto('/?deck=scale-check&rehearsal'); await act(page, 'minimap'); await act(page, 'skip');
  await expect(page.locator('.route-node:visible')).toHaveCount(37);
  await expect(graph(page)).toHaveAttribute('data-lod', 'overview');
  const ink = await page.locator('[data-node="atlas"] .node-title').evaluate(el => {
    const root = el.closest<HTMLElement>('.route-diagram')!;
    const label = el.closest<HTMLElement>('.node-label')!;
    return parseFloat(getComputedStyle(el).fontSize) * new DOMMatrix(getComputedStyle(label).transform).a * Number(root.dataset.zoom);
  });
  expect(ink).toBeGreaterThanOrEqual(17.99);
  const boxes = await page.locator('.route-node[data-label-visible="true"] .node-compact').evaluateAll(labels => labels.map(el => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right, bottom: r.bottom }; }));
  expect(boxes.length).toBeGreaterThan(4);
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) expect(boxes[i].right <= boxes[j].x || boxes[j].right <= boxes[i].x || boxes[i].bottom <= boxes[j].y || boxes[j].bottom <= boxes[i].y).toBe(true);
  expect(await page.locator('[data-node-state="active"]').count()).toBeGreaterThan(0);
  expect(await page.locator('[data-node-state="upcoming"]').count()).toBeGreaterThan(0);
  await page.screenshot({ path: 'docs/qa/v4-overview-37.png' });
  const position = await page.locator('.route-node').evaluateAll(nodes => nodes.map(el => ({ left: (el as HTMLElement).style.left, top: (el as HTMLElement).style.top, width: (el as HTMLElement).offsetWidth, height: (el as HTMLElement).offsetHeight })));
  const zoom = async (target: number) => {
    const current = Number(await graph(page).getAttribute('data-zoom'));
    const viewport = (await page.locator('.graph-scroll').boundingBox())!;
    await page.mouse.move(viewport.x + viewport.width / 2, viewport.y + viewport.height / 2);
    await page.mouse.wheel(0, -Math.log(target / current) / .0016);
    await page.waitForFunction(target => Math.abs(Number(document.querySelector<HTMLElement>('.route-diagram')?.dataset.zoom) - target) < .01, target);
    await page.waitForTimeout(40);
  };
  await zoom(.76); await expect(graph(page)).toHaveAttribute('data-lod', 'overview');
  await zoom(.80); await expect(graph(page)).toHaveAttribute('data-lod', 'overview');
  await zoom(.86); await expect(graph(page)).toHaveAttribute('data-lod', 'mid');
  await expect(page.locator('[data-node="atlas"] .node-note')).toHaveCSS('opacity', '0');
  await page.screenshot({ path: 'docs/qa/v4-detail-mid.png' });
  await zoom(1.36); await expect(graph(page)).toHaveAttribute('data-lod', 'close');
  await expect(page.locator('[data-node="atlas"] .node-note')).toHaveCSS('opacity', '1');
  await zoom(1.22); await expect(graph(page)).toHaveAttribute('data-lod', 'close');
  expect(await page.locator('.route-node').evaluateAll(nodes => nodes.map(el => ({ left: (el as HTMLElement).style.left, top: (el as HTMLElement).style.top, width: (el as HTMLElement).offsetWidth, height: (el as HTMLElement).offsetHeight })))).toEqual(position);
  await page.screenshot({ path: 'docs/qa/v4-detail-close.png' });
  await zoom(1.08); await expect(graph(page)).toHaveAttribute('data-lod', 'mid');
  await zoom(.65); await expect(graph(page)).toHaveAttribute('data-lod', 'overview');
  await page.getByRole('button', { name: 'Fit graph', exact: true }).click();
  await page.locator('[data-node="leaf-0"]').click(); await act(page, 'skip'); await act(page, 'back'); await act(page, 'skip');
  await page.locator('[data-node="atlas"]').click(); await act(page, 'skip'); await act(page, 'back'); await act(page, 'skip');
  await expect(page.locator('[data-node="atlas"]')).toHaveAttribute('data-node-state', 'active');
  await expect(page.locator('[data-node="leaf-0"]')).toHaveAttribute('data-node-state', 'visited');
  await expect(page.locator('[data-node="leaf-1"]')).toHaveAttribute('data-node-state', 'upcoming');
  await page.screenshot({ path: 'docs/qa/v4-hierarchy.png' });
});

test('v4 everyday ink overlaps, page arrival gates graph reveal, and rapid input cleans up', async ({ page }) => {
  await page.goto('/?deck=showcase&rehearsal'); await page.locator('.cover').click(); await act(page, 'skip');
  await act(page, 'next'); await seek(page, .25);
  const outgoing = Number(await page.locator('.outgoing-scene [data-block="title"] > .ink-content:not(.ink-front)').getAttribute('data-reveal-progress'));
  const incoming = Number(await page.locator('article[data-scene="sparks"] [data-block="title"] > .ink-content:not(.ink-front)').getAttribute('data-reveal-progress'));
  expect(outgoing).toBeGreaterThan(0); expect(outgoing).toBeLessThan(1); expect(incoming).toBeGreaterThan(0); expect(incoming).toBeLessThan(1);
  expect(await page.evaluate(() => (window as any).grimoire.timeline.duration)).toBeLessThan(1300);
  await page.screenshot({ path: 'docs/qa/v4-overlap.png' }); await act(page, 'skip');
  await act(page, 'minimap'); await seek(page, .2);
  await expect(page.locator('#app')).toHaveAttribute('data-phase', 'turning');
  await expect(page.locator('article[data-scene="@completed-graph"]')).toHaveCSS('opacity', '0');
  await page.screenshot({ path: 'docs/qa/v4-page-before-arrival.png' });
  await seek(page, .27); await expect(page.locator('#app')).toHaveAttribute('data-phase', 'graphing');
  await expect(page.locator('[data-node="wonder"]')).toBeVisible();
  await page.screenshot({ path: 'docs/qa/v4-page-after-arrival.png' });
  await act(page, 'skip'); await page.locator('[data-node="attention"]').click(); await seek(page, .3);
  await act(page, 'minimap'); await seek(page, .3); await act(page, 'back'); await act(page, 'next'); await act(page, 'minimap'); await act(page, 'home'); await act(page, 'skip');
  await expect(page.locator('#app')).toHaveAttribute('data-phase', 'closed');
  await expect(page.locator('article,.paper-burn-rim,.paper-burn-particles,.effect-defs,.flutter-leaf')).toHaveCount(0);
  await page.locator('.cover').click(); await act(page, 'skip'); await act(page, 'minimap'); await act(page, 'skip');
  await expect(page.locator('article')).toHaveCount(1); await expect(page.locator('.route-node')).toHaveCount(9);
});
