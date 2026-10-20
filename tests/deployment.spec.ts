import { test, expect } from '@playwright/test';

test('GitHub Pages project path loads scripts, fonts, lazy content and the presentation without root assets', async ({ page, request }) => {
  const errors: string[] = [], failed: string[] = [], assets: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (['warning', 'error'].includes(message.type())) errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`); });
  page.on('request', request => { if (['script', 'stylesheet', 'font', 'image'].includes(request.resourceType())) assets.push(new URL(request.url()).pathname); });
  await page.goto('/MagicalBook/?deck=sample&rehearsal');
  await expect(page.locator('.cover')).toBeVisible();
  await page.locator('.cover').click();
  await page.evaluate(() => (window as any).grimoire.act('skip'));
  await page.evaluate(() => (window as any).grimoire.act('minimap'));
  await page.evaluate(() => (window as any).grimoire.act('skip'));
  await expect(page.locator('.route-node:visible')).toHaveCount(2);
  await page.evaluate(() => { (window as any).grimoire.act('home'); (window as any).grimoire.act('skip'); });
  await expect(page.locator('#app')).toHaveAttribute('data-phase', 'closed');
  expect(assets.length).toBeGreaterThan(3);
  expect(assets.every(path => path.startsWith('/MagicalBook/'))).toBe(true);
  const license = await request.get('/MagicalBook/licenses/KaTeX-LICENSE.txt');
  expect(license.ok()).toBe(true);
  expect(await license.text()).toContain('MIT');
  expect(failed).toEqual([]); expect(errors).toEqual([]);
});
