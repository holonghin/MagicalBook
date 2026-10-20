import { expect, test } from '@playwright/test';

// Run after `npm run build` with `npm test` (tests run on Vite preview).
// Rehearsal API lets us seek deterministic intermediate animation frames.
test('closing pages share the same center hinge and Home reaches the closed cover', async ({ page }) => {
  await page.goto('/?rehearsal');
  await page.locator('.cover').click();
  await page.evaluate(() => (window as any).grimoire.timeline.finish());
  await page.keyboard.press('Home');

  const poses = await page.evaluate(() => {
    const result = [] as Array<{ angles: number[]; origins: string[]; z: string; foldWidth: number }>;
    for (const fraction of [.36, .44, .5, .58, .64]) {
      (window as any).grimoire.timeline.seek(fraction);
      const visible = [...document.querySelectorAll<HTMLElement>('.flutter-leaf')]
        .filter(leaf => leaf.style.visibility !== 'hidden');
      result.push({
        angles: visible.map(leaf => Number(leaf.style.transform.match(/rotateY\(([-.\d]+)deg\)/)?.[1] ?? NaN)),
        origins: visible.map(leaf => leaf.style.transformOrigin),
        z: (document.querySelector<HTMLElement>('.cover')!).style.zIndex,
        foldWidth: document.querySelector<HTMLElement>('.center-fold')!.getBoundingClientRect().width,
      });
    }
    return result;
  });
  for (const pose of poses) {
    expect(pose.angles.length).toBeGreaterThan(0);
    // No one page turns towards -180 while another goes towards 0.
    expect(pose.angles.every(angle => angle >= -180 && angle <= 0)).toBe(true);
    expect(pose.origins.every(origin => origin === 'left center')).toBe(true);
    expect(pose.z).toBe('20');
    expect(pose.foldWidth).toBeLessThan(80); // Slim fold, not a 7%-wide strip.
  }
  await page.evaluate(() => (window as any).grimoire.timeline.finish());
  expect(await page.evaluate(() => (window as any).grimoire.state.phase)).toBe('closed');
  await expect(page.locator('.flutter-leaf')).toHaveCount(0);
  await expect(page.locator('.page')).toHaveCount(0);
});

test('opened cover never changes stacking order mid-rotation', async ({ page }) => {
  await page.goto('/?rehearsal');
  await page.locator('.cover').click();
  const values = await page.evaluate(() => {
    const results: Array<{z:string; opacity:number}> = [];
    for (const fraction of [.03, .12, .28, .42, .63]) {
      (window as any).grimoire.timeline.seek(fraction);
      const cover = document.querySelector<HTMLElement>('.cover')!;
      results.push({z:cover.style.zIndex, opacity:Number(cover.style.opacity)});
    }
    return results;
  });
  expect(values.every(item => item.z === '20')).toBe(true);
  expect(values.every(item => item.opacity >= 0 && item.opacity <= 1)).toBe(true);
});
