import { test, expect, type Page } from '@playwright/test';
const live = (p: Page) => p.locator('article:not(.outgoing-scene)');
async function key(p: Page, k = 'ArrowRight') { await p.keyboard.press(k); }
async function start(p: Page) { await p.emulateMedia({ reducedMotion: 'reduce' }); await p.goto('/MagicalBook/?deck=calculus-1&rehearsal'); await expect(p.locator('.cover-title')).toHaveText('CALCULUS I'); await key(p, 'Enter'); }
async function scene(p: Page, id: string) { await p.evaluate(id => { const g = (window as any).grimoire; g.enter(g.slides.findIndex((s: any) => s.id === id), 1); }, id); }
async function seek(p: Page, f: number) { await p.evaluate(f => { const t = (window as any).grimoire.timeline; if (!t.paused) t.togglePause(); t.seek(f); }, f); }
async function fits(p: Page) {
  const problems = await live(p).evaluate(root => {
    const page = root.getBoundingClientRect(), content = root.querySelector('.page-content')!;
    const issues: string[] = [];
    if (content.scrollHeight > content.getBoundingClientRect().height + 8) issues.push('page height');
    root.querySelectorAll<HTMLElement>('.ink-slot,.calc-controls,.calc-readout,.calc-form-card,.calc-transform-row,.calc-area-equations').forEach(el => {
      if (getComputedStyle(el).visibility === 'hidden') return;
      const r = el.getBoundingClientRect(); if (r.top < page.top - 2 || r.bottom > page.bottom - 4) issues.push(`outside page: ${el.className}`);
    });
    root.querySelectorAll<HTMLElement>('.katex-html').forEach(el => {
      if (getComputedStyle(el).visibility === 'hidden') return;
      const r = el.getBoundingClientRect(), b = el.parentElement!.getBoundingClientRect();
      if (r.left < b.left - 3 || r.right > b.right + 3) issues.push(`formula overflow: ${el.textContent}`);
    });
    const controls = root.querySelector('.calc-controls')?.getBoundingClientRect();
    root.querySelectorAll('.calc-area-illustration text').forEach(el => { const r = el.getBoundingClientRect(); if (controls && r.bottom > controls.top - 2) issues.push('circle label overlaps controls'); });
    return issues;
  }); expect(problems).toEqual([]);
}
test.beforeEach(async ({ page }) => { const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (['warning', 'error'].includes(m.type())) errors.push(m.text()); }); (page as any).errors = errors; });
test.afterEach(async ({ page }) => expect((page as any).errors).toEqual([]));
const additions = ['L6-forms', 'L6-product', 'L6-difference', 'L6-powers', 'X3-magnitudes', 'X3-area'];
for (const size of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }, { width: 1024, height: 768 }]) test(`new lessons fit and advance by keyboard at ${size.width}x${size.height}`, async ({ page }) => {
  test.setTimeout(120_000); await page.setViewportSize(size); await start(page);
  for (const id of additions) {
    await scene(page, id); const demo = live(page).locator('.calc-demo'); const max = Number(await demo.getAttribute('data-demo-max'));
    for (let step = 0; step <= max; step++) {
      await expect(demo).toHaveAttribute('data-demo-step', String(step)); await fits(page);
      await expect(page.locator('.katex-error,.content-error,.renderer-fallback')).toHaveCount(0);
      if (step < max) await key(page);
    }
    await page.screenshot({ path: `docs/qa/calculus-additions/${id}-${size.width}.png` });
    await key(page, 'ArrowLeft'); await key(page); await expect(demo).toHaveAttribute('data-demo-step', String(max));
  }
});
test('classification, transformations, and both oscillatory witnesses retain correct hypotheses', async ({ page }) => {
  await start(page); await scene(page, 'L6-forms');
  await expect(page.locator('[data-classification=indeterminate]')).toHaveCount(7); await expect(page.locator('[data-classification=determined]')).toHaveCount(2);
  for (let i = 0; i < 8; i++) await key(page);
  await expect(page.locator('.is-determined')).toContainText('Not indeterminate'); await expect(page.locator('.calc-readout')).toContainText('Positive bases');
  await scene(page, 'L6-product'); await key(page); await expect(page.locator('.calc-readout')).toContainText('differentiable for x > 0'); await key(page); await expect(page.locator('.calc-readout')).toContainText('All conditions'); await key(page);
  await scene(page, 'L6-difference'); await key(page); await expect(page.locator('.calc-transform-row').nth(1)).toContainText('x2+x−x2'); await key(page); await expect(page.locator('.calc-readout')).toContainText('no differentiation');
  await scene(page, 'L6-powers');
  for (let i = 0; i < 9; i++) { await expect(page.locator('.calc-demo')).toHaveAttribute('data-case', String(Math.floor(i / 3))); if (i < 8) await key(page); }
  await expect(page.locator('.calc-readout')).toContainText('equals e');
  await scene(page, 'L6-diagnosis'); for (let i = 0; i < 6; i++) await key(page);
  await expect(page.locator('.calc-verdict')).toContainText('Inconclusive'); await expect(page.locator('.calc-readout')).toContainText('oscillates');
  await key(page); await expect(page.locator('.calc-verdict')).toContainText('Use the bound'); await expect(page.locator('.calc-diagnosis')).toContainText('sin'); await expect(page.locator('.calc-readout')).toContainText('no limit');
});
test('circle annulus, exact vs differential changes, negative errors and exploration are coherent', async ({ page }) => {
  await start(page); await scene(page, 'X3-area');
  const demo = live(page).locator('.calc-demo');
  for (const fraction of [.01, -.01, .005]) {
    await key(page); await expect(demo).toHaveAttribute('data-relative-radius', String(fraction));
    expect(Number(await demo.getAttribute('data-relative-differential'))).toBeCloseTo(2 * fraction, 12);
    expect(Number(await demo.getAttribute('data-relative-actual'))).toBeCloseTo(2 * fraction + fraction ** 2, 12);
    expect(Number(await demo.getAttribute('data-actual-area')) - Number(await demo.getAttribute('data-differential-area'))).toBeCloseTo(Math.PI * (10 * fraction) ** 2, 12);
    expect(Number(await page.locator('.calc-area-new').getAttribute('r'))).toBeCloseTo(110 * (1 + fraction), 9);
    const localX = Number((await page.locator('.calc-area-gap').getAttribute('d'))!.match(/^M([^ ]+)/)![1]);
    expect(localX - 350).toBeCloseTo(fraction * 110 * 10, 9);
  }
  await key(page, 'ArrowLeft'); await expect(demo).toHaveAttribute('data-relative-radius', '-0.01');
  await page.getByRole('slider', { name: 'Radius change (%)', exact: true }).fill('5');
  await expect(demo).toHaveAttribute('data-relative-radius', '0.05'); expect(Number(await demo.getAttribute('data-relative-actual'))).toBeCloseTo(.1025, 12);
  await page.getByRole('slider', { name: 'Radius change (%)', exact: true }).fill('-5'); expect(Number(await demo.getAttribute('data-relative-actual'))).toBeCloseTo(-.0975, 12);
});
test('new ink plays on repeated entrances and reversible beats, while the physical circle stays stable', async ({ page }) => {
  test.setTimeout(120_000); await start(page);
  for (const id of additions) {
    await scene(page, id); await key(page, 'm');
    for (let repeat = 0; repeat < 2; repeat++) {
      await key(page); await seek(page, id === 'X3-area' ? .82 : .5);
      await expect(live(page).locator('.calc-readout:not(.ink-front)')).toHaveAttribute('data-reveal-id', /ink-/);
      const bad = await page.locator('[data-ink-for]').evaluateAll(fronts => fronts.filter(front => {
        const target = document.querySelector(`[data-reveal-id="${(front as HTMLElement).dataset.inkFor}"]`); if (!target) return true;
        const a = front.getBoundingClientRect(), b = target.getBoundingClientRect(); return Math.abs(a.x - b.x) > 2 || Math.abs(a.y - b.y) > 2 || Math.abs(a.width - b.width) > 2 || Math.abs(a.height - b.height) > 2;
      }).length); expect(bad).toBe(0);
      if (!repeat) await page.screenshot({ path: `docs/qa/calculus-additions/${id}-ink-middle.png` });
      await key(page, 's'); await key(page, 'ArrowLeft'); await key(page, 's');
      await key(page, 'r'); await seek(page, .8); await expect(live(page).locator('.calc-demo:not(.ink-front)')).toHaveAttribute('data-reveal-id', /ink-/); await key(page, 's');
    }
    if (id === 'X3-area') {
      await page.locator('.calc-area-new').evaluate(el => (window as any).areaCircle = el);
      await key(page); await seek(page, .25); const start = Number(await page.locator('.calc-area-new').getAttribute('r'));
      await expect(live(page).locator('.calc-readout:not(.ink-front)')).toHaveCSS('visibility', 'hidden');
      await seek(page, .5); expect(Number(await page.locator('.calc-area-new').getAttribute('r'))).toBeGreaterThan(start);
      expect(await page.locator('.calc-area-new').evaluate(el => el === (window as any).areaCircle)).toBe(true); await page.screenshot({ path: 'docs/qa/calculus-additions/area-motion-middle.png' }); await key(page, 's');
    }
    await expect(page.locator('.ink-front,.effect-defs')).toHaveCount(0);
    if (id === 'X3-area') { await key(page); await seek(page, .25); await key(page, 'Home'); await key(page, 's'); await expect(page.locator('#app')).toHaveAttribute('data-phase', 'closed'); await expect(page.locator('.scene-host article')).toHaveCount(0); }
    await key(page, 'm');
  }
});
