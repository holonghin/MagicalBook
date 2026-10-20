import { test, expect } from '@playwright/test';

test('front-cover ink does not bleed through the back of the book', async ({ page }) => {
  await page.goto('/?rehearsal');
  await page.locator('.cover').click();
  await page.evaluate(() => (window as any).grimoire.timeline.togglePause());
  for (const fraction of [.2, .23, .26]) {
    await page.evaluate(f => (window as any).grimoire.timeline.seek(f), fraction);
    const front = await page.locator('.cover-face').evaluate(el => Number(getComputedStyle(el).opacity));
    expect(front).toBe(0);
  }
  await page.evaluate(() => (window as any).grimoire.timeline.finish());
  await page.keyboard.press('Home');
  await page.evaluate(() => (window as any).grimoire.timeline.togglePause());
  for (const fraction of [.74, .77, .8]) {
    await page.evaluate(f => (window as any).grimoire.timeline.seek(f), fraction);
    const front = await page.locator('.cover-face').evaluate(el => Number(getComputedStyle(el).opacity));
    expect(front).toBe(0);
  }
  await page.evaluate(() => (window as any).grimoire.timeline.finish());
  await expect(page.locator('.cover')).toBeVisible();
  expect(await page.evaluate(() => (window as any).grimoire.state.phase)).toBe('closed');
});

test('closing leaves share the same spine and do not alternate turn direction', async ({ page }) => {
  await page.goto('/?rehearsal');
  await page.locator('.cover').click();
  await page.evaluate(() => (window as any).grimoire.timeline.finish());
  await page.keyboard.press('Home');
  await page.evaluate(() => (window as any).grimoire.timeline.togglePause());
  let numberOfVisibleLeaves = 0;
  for (const fraction of [.3, .4, .5, .6, .7]) {
    await page.evaluate(f => (window as any).grimoire.timeline.seek(f), fraction);
    const visible = await page.locator('.flutter-leaf').evaluateAll(elements =>
      elements.filter(el => (el as HTMLElement).style.visibility !== 'hidden').map(el => {
        const leaf = el as HTMLElement;
        return { origin: leaf.style.transformOrigin,
          angle: Number(leaf.style.transform.match(/rotateY\(([-\d.]+)deg\)/)?.[1]) };
      }));
    numberOfVisibleLeaves += visible.length;
    for (const leaf of visible) {
      expect(leaf.origin).toBe('left center');
      expect(leaf.angle).toBeGreaterThanOrEqual(-180);
      expect(leaf.angle).toBeLessThanOrEqual(0);
    }
  }
  expect(numberOfVisibleLeaves).toBeGreaterThan(0);
  await page.evaluate(() => (window as any).grimoire.timeline.finish());
  await expect(page.locator('.flutter-leaf')).toHaveCount(0);
});
