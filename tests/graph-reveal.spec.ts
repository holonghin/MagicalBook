import { test, expect, type Page } from '@playwright/test';
import { MAX_FULL_GRAPH_REVEAL_MS } from '../src/effects/graph-reveal-timing';
import { dropTiming } from '../src/effects/book-motion';

async function act(page: Page, action: string) { await page.waitForFunction(() => !!(window as any).grimoire); await page.evaluate(a => (window as any).grimoire.act(a), action); }
async function seek(page: Page, p: number) { await page.evaluate(p => { const t = (window as any).grimoire.timeline; if (!t.paused) t.togglePause(); t.seek(p); }, p); }
async function next(page: Page) { await act(page, 'next'); await act(page, 'skip'); }
test.beforeEach(async ({ page }) => { const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (['warning', 'error'].includes(m.type())) errors.push(m.text()); }); (page as any).errors = errors; });
test.afterEach(async ({ page }) => expect((page as any).errors).toEqual([]));

test('every ordinary-page graph entrance inscribes the same roots, including three repeated visits', async ({ page }) => {
  await page.goto('/?deck=sample&rehearsal'); await page.locator('.cover').click(); await act(page, 'skip');
  let first: string | null = null;
  for (let visit = 0; visit < 4; visit++) {
    await act(page, 'next'); await seek(page, 0);
    await expect(page.locator('.route-node:visible')).toHaveCount(0);
    await seek(page, .55);
    const p = Number(await page.locator('[data-node="begin"]').getAttribute('data-ink-progress'));
    expect(p).toBeGreaterThan(0); expect(p).toBeLessThan(1);
    if (visit === 0) first = await page.locator('.route-diagram').getAttribute('data-graph-id');
    else await expect(page.locator('.route-diagram')).toHaveAttribute('data-graph-id', first!);
    await page.screenshot({ path: `docs/qa/graph-reentry-${visit}.png` });
    await act(page, 'skip'); await expect(page.locator('.route-node:visible')).toHaveCount(1);
    expect(await page.evaluate(() => (window as any).grimoire.graphState.progressStep)).toBe(0);
    await expect(page.locator('.route-diagram')).toHaveCount(1);
    await act(page, 'back'); await act(page, 'skip');
  }
});

test('small overview retains the complete regular path-before-node burn, with no timeout handoff', async ({ page }) => {
  await page.goto('/?deck=sample&rehearsal'); await act(page, 'minimap');
  const timing = await page.evaluate(() => { const g = (window as any).grimoire; return { total: g.timeline.duration, travel: g.journeyDuration() }; });
  expect(timing.travel).toBe(2550); expect(timing.total - timing.travel).toBeLessThanOrEqual(MAX_FULL_GRAPH_REVEAL_MS);
  for (const t of [0, 150, 500, 1000, 1500, timing.total - timing.travel]) {
    await seek(page, (timing.travel + t) / timing.total);
    await expect(page.locator('.route-diagram')).toHaveAttribute('data-reveal-mode', 'regular-burn');
    await expect(page.locator('.route-diagram')).toHaveAttribute('data-handoff-progress', '0.000');
    if (Number(await page.locator('[data-node="discover"]').getAttribute('data-ink-progress')) > 0)
      expect(Number(await page.locator('.route-edge').getAttribute('data-progress'))).toBe(1);
    await page.screenshot({ path: `docs/qa/graph-small-${Math.round(t)}.png` });
  }
  await act(page, 'skip'); await expect(page.locator('.route-node:visible')).toHaveCount(2);
});

for (const source of ['cover', 'slide', 'graph']) test(`37-node full-map budget and intermediate burn frames from ${source}`, async ({ page }, testInfo) => {
  await page.goto('/?deck=scale-check&rehearsal');
  await page.waitForFunction(() => !!(window as any).grimoire);
  if (source !== 'cover') { await page.locator('.cover').click(); await act(page, 'skip'); }
  if (source === 'graph') await next(page);
  const progress = await page.evaluate(() => { const s = (window as any).grimoire.graphState; return { step: s.progressStep, cue: s.progressCue, axis: s.orientation }; });
  await act(page, 'minimap'); await seek(page, 0);
  const travel = source === 'cover' ? 2550 : source === 'slide' ? 700 : 0;
  const total = await page.evaluate(() => (window as any).grimoire.timeline.duration);
  const reveal = total - travel;
  expect(reveal).toBeLessThanOrEqual(MAX_FULL_GRAPH_REVEAL_MS);
  await expect(page.locator('.route-node:visible')).toHaveCount(source === 'graph' ? 1 : 0);
  if (source === 'graph') await expect(page.locator('.flutter-leaf,.outgoing-scene')).toHaveCount(0);
  if (travel) { await seek(page, (travel - 1) / total); expect(await page.locator('.route-node:visible').count()).toBe(0); }
  for (const t of [250, 750, 1400, reveal - 400, reveal - 175, reveal]) {
    await seek(page, (travel + t) / total);
    await expect(page.locator('.route-diagram')).toHaveAttribute('data-reveal-mode', 'bounded-burn');
    if (t < reveal - 350) {
      await expect(page.locator('.route-diagram')).toHaveAttribute('data-handoff-progress', '0.000');
      expect(await page.locator('.route-node:visible').count()).toBeLessThan(37);
      if (source === 'cover' && t === 750) expect(Number(await page.locator('.route-edge').first().getAttribute('data-progress'))).toBeGreaterThan(0);
    }
    await page.screenshot({ path: `docs/qa/graph-large-${source}-${t}.png` });
  }
  await act(page, 'skip');
  await expect(page.locator('.route-node:visible')).toHaveCount(37);
  expect(await page.locator('.route-edge[data-progress="1.000"]').count()).toBe(36);
  await expect(page.locator('.route-diagram')).toHaveAttribute('data-camera-locked', 'false');
  expect(await page.locator('.route-ember:visible,.route-flame:visible,.ink-front').count()).toBe(0);
  expect(await page.evaluate(() => { const s = (window as any).grimoire.graphState; return { step: s.progressStep, cue: s.progressCue, axis: s.orientation }; })).toEqual(progress);
  // Real elapsed/RAF measurement, without screenshots or seeking during playback.
  await act(page, 'home'); await act(page, 'skip');
  if (source !== 'cover') { await page.locator('.cover').click(); await act(page, 'skip'); }
  if (source === 'graph') await next(page);
  const measurement = await page.evaluate(async travel => {
    const g = (window as any).grimoire; const frames: number[] = [], draws: number[] = []; let previous = 0;
    const originalDraw = g.drawReveal.bind(g);
    g.drawReveal = (p: number) => { const start = performance.now(); originalDraw(p); draws.push(performance.now() - start); };
    return await new Promise<{ elapsed: number; maxFrame: number; p95Frame: number; frames: number; maxDraw: number }>(resolve => {
      g.act('minimap');
      const start = g.timeline.start + travel;
      const sample = (now: number) => {
        if (now >= start && previous) frames.push(now - previous);
        if (now >= start && g.state.phase === 'ready') { g.drawReveal = originalDraw; frames.sort((a, b) => a - b); resolve({ elapsed: now - start, maxFrame: Math.max(...frames), p95Frame: frames[Math.floor(frames.length * .95)], frames: frames.length, maxDraw: Math.max(...draws) }); return; }
        if (now >= start) previous = now; requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
  }, travel);
  expect(measurement.elapsed).toBeLessThanOrEqual(MAX_FULL_GRAPH_REVEAL_MS + 120);
  console.log(`37 nodes (${source})`, JSON.stringify(measurement));
  await testInfo.attach(`timing-${source}`, { body: JSON.stringify(measurement, null, 2), contentType: 'application/json' });
});

test('normal teaching is not capped; completed teaching-page re-entry burns without changing logical progress', async ({ page }) => {
  await page.goto('/?deck=scale-check&rehearsal'); await page.locator('.cover').click(); await act(page, 'skip');
  await page.keyboard.press('?'); await page.locator('.tempo').selectOption('0.5'); await page.locator('.dismiss').click();
  await next(page); await next(page); await act(page, 'next');
  expect(await page.evaluate(() => (window as any).grimoire.timeline.duration)).toBeGreaterThan(MAX_FULL_GRAPH_REVEAL_MS);
  await expect(page.locator('.route-diagram')).toHaveAttribute('data-reveal-mode', 'regular-burn');
  await act(page, 'skip');
  await page.keyboard.press('?'); await page.locator('.tempo').selectOption('1'); await page.locator('.dismiss').click();
  for (let i = 0; i < 3; i++) {
    await page.locator('[data-node="atlas"]').click(); await act(page, 'skip'); await act(page, 'escape'); await seek(page, 0);
    await expect(page.locator('.route-diagram')).toHaveAttribute('data-reveal-mode', 'bounded-burn');
    expect(await page.evaluate(() => (window as any).grimoire.graphState.progressStep)).toBe(2);
    await expect(page.locator('.route-node:visible')).toHaveCount(0);
    await seek(page, .5); expect(Number(await page.locator('.route-edge').first().getAttribute('data-progress'))).toBeGreaterThan(0);
    await act(page, 'skip'); await expect(page.locator('.route-node:visible')).toHaveCount(37);
  }
});

test('vertical re-entry and full preview repeat burns preserve identity, progress and orientation through interruptions', async ({ page }) => {
  await page.goto('/?deck=orientation-check&case=FV&rehearsal'); await page.locator('.cover').click(); await act(page, 'skip'); await next(page); await next(page);
  await page.locator('[data-node="thread"]').click(); await act(page, 'skip');
  for (let i = 0; i < 3; i++) {
    await act(page, 'escape'); await seek(page, 0);
    await expect(page.locator('.route-node:visible')).toHaveCount(0);
    await seek(page, .25);
    const values = await page.locator('.route-node').evaluateAll(nodes => nodes.map(n => Number((n as HTMLElement).dataset.inkProgress)));
    expect(values.some(p => p > 0 && p < 1)).toBe(true);
    await expect(page.locator('.route-diagram')).toHaveAttribute('data-axis', 'vertical');
    expect(await page.evaluate(() => (window as any).grimoire.graphState.progressStep)).toBe(1);
    await act(page, 'skip'); await page.locator('[data-node="thread"]').click(); await act(page, 'skip');
  }
  await act(page, 'escape'); await seek(page, .35); await act(page, 'back'); await act(page, 'next'); await act(page, 'minimap'); await seek(page, .7); await act(page, 'home'); await act(page, 'skip');
  await expect(page.locator('article,.effect-defs,.flutter-leaf')).toHaveCount(0);
  await page.locator('.cover').click(); await act(page, 'skip');
  const progress = await page.evaluate(() => (window as any).grimoire.graphState.progressStep);
  for (let i = 0; i < 3; i++) {
    await act(page, 'minimap'); await seek(page, 0); await expect(page.locator('.route-node:visible')).toHaveCount(0);
    await seek(page, .4);
    expect(Number(await page.locator('[data-node="seed"]').getAttribute('data-ink-progress'))).toBeGreaterThan(0);
    await page.screenshot({ path: `docs/qa/graph-full-reentry-${i}.png` });
    await act(page, 'skip'); await expect(page.locator('.route-diagram')).toHaveAttribute('data-axis', 'vertical');
    await expect(page.locator('.route-node:visible')).toHaveCount(6); await expect(page.locator('.route-diagram')).toHaveCount(1);
    expect(await page.evaluate(() => (window as any).grimoire.graphState.progressStep)).toBe(progress);
    await act(page, 'back'); await act(page, 'skip');
  }
});

test('full-map cap survives slow tempo, reduced motion, rewind, skip and Home cleanup', async ({ page }) => {
  await page.goto('/?deck=scale-check&rehearsal'); await page.locator('.cover').click(); await act(page, 'skip');
  await page.keyboard.press('?'); await page.locator('.tempo').selectOption('0.5'); await page.locator('.dismiss').click();
  await act(page, 'minimap');
  expect(await page.evaluate(() => (window as any).grimoire.timeline.duration)).toBeLessThanOrEqual(1400 + MAX_FULL_GRAPH_REVEAL_MS);
  await seek(page, .96); await seek(page, .4); await seek(page, .7); await act(page, 'skip');
  await expect(page.locator('.route-node:visible')).toHaveCount(37);
  await expect(page.locator('.ink-front,.effect-defs')).toHaveCount(0);
  await act(page, 'home'); await seek(page, .4); await act(page, 'skip');
  await expect(page.locator('article,.ink-front,.effect-defs,.flutter-leaf')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'reduce' }); await act(page, 'minimap');
  await expect(page.locator('#app')).toHaveAttribute('data-phase', 'ready');
  await expect(page.locator('.route-node:visible')).toHaveCount(37);
  await expect(page.locator('.route-diagram')).toHaveAttribute('data-camera-locked', 'false');
});

test('legacy saved-map recap handoff reuses the graph and inscribes it only after the departing paper', async ({ page }) => {
  await page.goto('/?deck=route&rehearsal'); await page.locator('.cover').click(); await act(page, 'skip');
  // The legacy deck includes ordinary node pages in its linear rehearsal flow.
  for (let i = 0; i < 7; i++) await next(page);
  await act(page, 'next'); await seek(page, 0);
  await expect(page.locator('#app')).toHaveAttribute('data-scene', 'saved-map');
  await expect(page.locator('.route-node:visible')).toHaveCount(0);
  const total = await page.evaluate(() => (window as any).grimoire.timeline.duration);
  expect(total - 1250).toBeLessThanOrEqual(MAX_FULL_GRAPH_REVEAL_MS);
  await seek(page, 1249 / total); await expect(page.locator('article[data-scene="route-2"]')).toHaveCSS('opacity', '0');
  await seek(page, 1500 / total);
  const p = Number(await page.locator('[data-node="observe"]').getAttribute('data-ink-progress'));
  expect(p).toBeGreaterThan(0); expect(p).toBeLessThan(1);
  await page.screenshot({ path: 'docs/qa/graph-legacy-handoff.png' });
  await act(page, 'skip'); await expect(page.locator('.route-node:visible')).toHaveCount(3);
  await expect(page.locator('.route-diagram')).toHaveCount(1); await expect(page.locator('.ink-front,.effect-defs')).toHaveCount(0);
});

test('a reverse paper lift exposes the retained printed map at slow tempo without adding a graph reveal', async ({ page }) => {
  await page.goto('/?deck=showcase&rehearsal'); await page.locator('.cover').click(); await act(page, 'skip');
  for (let i = 0; i < 13; i++) await next(page);
  const source = await page.evaluate(() => { const g = (window as any).grimoire; return { profile: g.dropProfiles.get(g.current.slide.id), options: g.current.slide.drop ?? { mode: 'content' }, duration: g.timings.drop }; });
  const travel = dropTiming(source.options, source.duration, source.profile).total / .5;
  await page.keyboard.press('?'); await page.locator('.tempo').selectOption('0.5'); await page.locator('.dismiss').click();
  await act(page, 'back'); await seek(page, 0);
  await expect(page.locator('.route-node:visible')).toHaveCount(9);
  const total = await page.evaluate(() => (window as any).grimoire.timeline.duration);
  expect(total).toBeCloseTo(travel, 4);
  await seek(page, .45);
  await expect(page.locator('[data-node="wonder"]')).toHaveAttribute('data-ink-progress', '1.000');
  await expect(page.locator('.lifting-paper')).toHaveCSS('opacity', '1');
  await expect(page.locator('.ink-front,.effect-defs')).toHaveCount(0);
  await act(page, 'skip'); await expect(page.locator('.route-node:visible')).toHaveCount(9);
});
