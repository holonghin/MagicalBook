import { test, expect, type Page } from '@playwright/test';

async function act(page: Page, action: string) { await page.evaluate(a => (window as any).grimoire.act(a), action); }
async function seek(page: Page, p: number) { await page.evaluate(p => { const t = (window as any).grimoire.timeline; if (!t.paused) t.togglePause(); t.seek(p); }, p); }
async function start(page: Page) {
  await page.goto('/MagicalBook/?deck=showcase&rehearsal'); await page.locator('.cover').click(); await act(page, 'skip');
  for (let i = 0; i < 13; i++) { await act(page, 'next'); await act(page, 'skip'); }
}
const landing = 1 / (.67 + .33 / .85);
test.beforeEach(async ({ page }) => { const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (['warning', 'error'].includes(m.type())) errors.push(m.text()); }); (page as any).errors = errors; });
test.afterEach(async ({ page }) => expect((page as any).errors).toEqual([]));

test('printed paper physically covers the intact old page; active scene changes only after landing', async ({ page }) => {
  await start(page);
  await page.evaluate(() => { (window as any).oldPage = (window as any).grimoire.current.element; (window as any).grimoire.rehearsal.dropSeed = 721; });
  await act(page, 'next'); await seek(page, 0);
  const sheet = page.locator('.falling-paper'), old = page.locator('.paper-underlay');
  await expect(page.locator('article')).toHaveCount(2);
  const before = await old.locator('.page-content').innerHTML();
  const shadows = new Set<string>();
  for (const p of [0, .18, .32, .48, .62, .80, .88, 1]) {
    await seek(page, p * landing);
    await expect(page.locator('#app')).toHaveAttribute('data-scene', 'recap-question');
    expect(await old.evaluate(el => el === (window as any).oldPage)).toBe(true);
    await expect(old).toHaveCSS('opacity', '1'); await expect(old).toHaveCSS('visibility', 'visible');
    expect(await old.locator('.page-content').innerHTML()).toBe(before);
    await expect(sheet).toHaveCSS('opacity', '1');
    await expect(sheet.locator('[data-block="title"] > .ink-content')).toHaveAttribute('data-reveal-progress', '1.000');
    await expect(page.locator('.ink-front,.effect-defs')).toHaveCount(0);
    shadows.add((await page.locator('.paper-drop-shadow').getAttribute('style'))!);
    if (p === .32 || p === .62) {
      const covered = await sheet.evaluate(el => {
        const host = el.parentElement as HTMLElement, old = host.querySelector<HTMLElement>('.paper-underlay')!;
        host.inert = false; (el as HTMLElement).inert = false; old.inert = false;
        (el as HTMLElement).style.pointerEvents = 'auto'; old.style.pointerEvents = 'auto';
        const hit = document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest('article');
        const result = hit === el;
        host.inert = true; (el as HTMLElement).inert = true; old.inert = true;
        (el as HTMLElement).style.pointerEvents = ''; old.style.pointerEvents = '';
        return result;
      });
      expect(covered).toBe(p === .62);
    }
    await page.screenshot({ path: `docs/qa/falling-paper-${Math.round(p * 100)}.png` });
  }
  expect(shadows.size).toBeGreaterThan(5);
  // Probe actual painted stacking at landing, temporarily allowing hit-testing
  // through the normally inert transition surface. Restore the interaction lock.
  const top = await sheet.evaluate(el => {
    const host = el.parentElement as HTMLElement, old = host.querySelector<HTMLElement>('.paper-underlay')!;
    host.inert = false; (el as HTMLElement).inert = false; old.inert = false;
    (el as HTMLElement).style.pointerEvents = 'auto'; old.style.pointerEvents = 'auto';
    const result = document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.closest('article') === el;
    host.inert = true; (el as HTMLElement).inert = true; old.inert = true;
    (el as HTMLElement).style.pointerEvents = ''; old.style.pointerEvents = '';
    return result;
  });
  expect(top).toBe(true);
  await act(page, 'skip');
  await expect(page.locator('#app')).toHaveAttribute('data-scene', 'recap-return');
  await expect(page.locator('article')).toHaveCount(1);
  await expect(page.locator('.paper-underlay,.falling-paper,.paper-drop-shadow')).toHaveCount(0);
});

test('the outgoing live illustration and canvas survive beneath the falling sheet', async ({ page }) => {
  await page.goto('/MagicalBook/?deck=showcase&rehearsal'); await page.locator('.cover').click(); await act(page, 'skip');
  const pixels = await page.evaluate(() => {
    const g = (window as any).grimoire, canvas = document.createElement('canvas'); canvas.width = 32; canvas.height = 16;
    canvas.getContext('2d')!.fillRect(2, 2, 20, 10); g.current.element.querySelector('.page-content').append(canvas);
    (window as any).liveCanvas = canvas; (window as any).liveIllustration = document.querySelector('.compass-illustration');
    const data = canvas.toDataURL(); g.enter(g.slides.findIndex((s: any) => s.id === 'recap-question'), 1); return data;
  });
  await seek(page, .3);
  expect(await page.locator('.paper-underlay canvas').evaluate(el => el === (window as any).liveCanvas && (el as HTMLCanvasElement).toDataURL())).toBe(pixels);
  expect(await page.locator('.paper-underlay .compass-illustration').evaluate(el => el === (window as any).liveIllustration)).toBe(true);
  await expect(page.locator('#app')).toHaveAttribute('data-scene', 'threshold');
  await act(page, 'skip'); await expect(page.locator('#app')).toHaveAttribute('data-scene', 'recap-question');
  await act(page, 'replay'); await seek(page, .3);
  expect(await page.locator('.paper-underlay canvas').evaluate(el => (el as HTMLCanvasElement).toDataURL())).toBe(pixels);
  await act(page, 'skip');
});

test('reverse lifts printed paper over an already rendered page; Back mid-fall retraces its pose', async ({ page }) => {
  await start(page); await act(page, 'next'); await act(page, 'skip');
  await act(page, 'back'); await seek(page, .45);
  await expect(page.locator('#app')).toHaveAttribute('data-scene', 'recap-return');
  await expect(page.locator('.lifting-paper')).toHaveCSS('opacity', '1');
  await expect(page.locator('.lifting-paper [data-block="title"] > .ink-content')).toHaveAttribute('data-reveal-progress', '1.000');
  await expect(page.locator('.paper-underlay [data-block="title"] > .ink-content')).toHaveAttribute('data-reveal-progress', '1.000');
  await expect(page.locator('.ink-front,.effect-defs')).toHaveCount(0);
  await page.screenshot({ path: 'docs/qa/falling-paper-lift.png' });
  await act(page, 'skip'); await expect(page.locator('#app')).toHaveAttribute('data-scene', 'recap-question');
  await act(page, 'next'); await seek(page, .4);
  const pose = await page.locator('.falling-paper').getAttribute('style');
  await act(page, 'back'); await seek(page, 0);
  expect(await page.locator('.falling-paper').getAttribute('style')).toBe(pose);
  await seek(page, .5); await act(page, 'skip');
  await expect(page.locator('#app')).toHaveAttribute('data-scene', 'recap-question');
  await expect(page.locator('article')).toHaveCount(1);
  await act(page, 'next'); await seek(page, .4); await act(page, 'back'); await seek(page, .2); await act(page, 'back');
  await expect(page.locator('#app')).toHaveAttribute('data-scene', 'recap-question');
  await expect(page.locator('#app')).toHaveAttribute('data-phase', 'ready');
  await expect(page.locator('.falling-paper,.paper-drop-shadow')).toHaveCount(0);
  await act(page, 'next'); await act(page, 'skip'); await act(page, 'back'); await seek(page, .2); await act(page, 'back');
  await expect(page.locator('#app')).toHaveAttribute('data-scene', 'recap-question');
  await expect(page.locator('#app')).toHaveAttribute('data-phase', 'ready');
});

test('replay, skip, effects, Mini-map and Home clean up both paper layers', async ({ page }) => {
  test.setTimeout(60_000);
  await start(page); await act(page, 'next'); await seek(page, .3); await act(page, 'replay'); await seek(page, .2);
  await expect(page.locator('article')).toHaveCount(2); await expect(page.locator('.paper-drop-shadow')).toHaveCount(1);
  await act(page, 'minimap'); await act(page, 'skip');
  await expect(page.locator('.route-node:visible')).toHaveCount(9);
  await expect(page.locator('.paper-drop-shadow,.paper-underlay')).toHaveCount(0);
  await act(page, 'home'); await act(page, 'skip');
  await expect(page.locator('article,.paper-drop-shadow')).toHaveCount(0);
  await start(page); await act(page, 'next'); await seek(page, .6); await act(page, 'home');
  await expect(page.locator('#app')).toHaveAttribute('data-phase', 'closing'); await act(page, 'skip');
  await expect(page.locator('article,.paper-drop-shadow,.ink-front,.effect-defs')).toHaveCount(0);
  await start(page); await act(page, 'effects'); await act(page, 'next');
  await expect(page.locator('#app')).toHaveAttribute('data-scene', 'recap-return');
  await expect(page.locator('#app')).toHaveAttribute('data-phase', 'ready');
  await expect(page.locator('article')).toHaveCount(1);
});
