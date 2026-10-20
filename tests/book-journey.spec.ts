import { test, expect } from '@playwright/test';

/** Browser-level regression tests: opening and closing use the same book poses. */
test('opening and closing are exact reverse poses of the same four leaves', async ({ page }) => {
  await page.goto('/?rehearsal');
  await page.locator('.cover').click();
  await page.evaluate(() => (window as any).grimoire.timeline.togglePause());
  const opening: { cover: string; camera: string; leaves: string[] }[] = [];
  const fractions = [.1, .2, .35, .5, .65, .8, .95];
  for (const fraction of fractions) {
    await page.evaluate(f => (window as any).grimoire.timeline.seek(f), fraction);
    await page.screenshot({ path: `docs/qa/next-opening-${Math.round(fraction * 100)}.png` });
    opening.push(await page.evaluate(() => ({
      cover: document.querySelector('.cover')!.getAttribute('data-open-progress')!,
      camera: document.querySelector('.book')!.getAttribute('data-camera-progress')!,
      leaves: Array.from(document.querySelectorAll<HTMLElement>('.flutter-leaf')).map(el =>
        `${el.style.visibility}:${Number(el.style.transform.match(/rotateY\(([-\d.]+)deg\)/)?.[1]).toFixed(3)}`),
    })));
  }
  await page.evaluate(() => (window as any).grimoire.timeline.finish());
  await page.keyboard.press('Home');
  await page.evaluate(() => (window as any).grimoire.timeline.togglePause());
  for (let i = 0; i < fractions.length; i++) {
    await page.evaluate(f => (window as any).grimoire.timeline.seek(f), 1 - fractions[i]);
    const closing = await page.evaluate(() => ({
      cover: document.querySelector('.cover')!.getAttribute('data-open-progress')!,
      camera: document.querySelector('.book')!.getAttribute('data-camera-progress')!,
      leaves: Array.from(document.querySelectorAll<HTMLElement>('.flutter-leaf')).map(el =>
        `${el.style.visibility}:${Number(el.style.transform.match(/rotateY\(([-\d.]+)deg\)/)?.[1]).toFixed(3)}`),
    }));
    expect(closing).toEqual(opening[i]);
    await page.screenshot({ path: `docs/qa/next-closing-${Math.round((1 - fractions[i]) * 100)}.png` });
  }
  await page.evaluate(() => (window as any).grimoire.timeline.finish());
  expect(await page.evaluate(() => (window as any).grimoire.state.phase)).toBe('closed');
});

test('Home reverses an in-progress opening without jumping to a fully open book', async ({ page }) => {
  await page.goto('/?rehearsal');
  await page.locator('.cover').click();
  await page.evaluate(() => { const g = (window as any).grimoire; g.timeline.togglePause(); g.timeline.seek(.45); });
  const before = await page.locator('.cover').getAttribute('data-open-progress');
  // Freeze in the same keyboard event, before a later browser round-trip can
  // sample an already-moving closing cover on a busy machine.
  await page.evaluate(() => document.addEventListener('keydown', event => {
    if (event.key === 'Home') (window as any).grimoire.timeline.togglePause();
  }, { once: true }));
  await page.keyboard.press('Home');
  const after = await page.locator('.cover').getAttribute('data-open-progress');
  expect(Number(after)).toBeCloseTo(Number(before), 2);
  await page.evaluate(() => (window as any).grimoire.timeline.finish());
  expect(await page.evaluate(() => (window as any).grimoire.state.phase)).toBe('closed');
});
