import { test, expect } from '@playwright/test';

test('route uses optional charred paper burn for both directions', async ({ page }) => {
  await page.goto('/?deck=route&rehearsal');
  await page.locator('.cover').click();
  await page.waitForFunction(() => document.querySelector('#app')?.getAttribute('data-phase') === 'ready');
  await page.locator('.route-node').first().click();
  await expect(page.locator('.paper-burn-outgoing')).toHaveCount(1);
  await expect(page.locator('.paper-burn-rim path')).toHaveCount(4);
  await page.waitForFunction(() => document.querySelector('#app')?.getAttribute('data-phase') === 'ready');
  await expect(page.locator('.paper-burn-outgoing')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('.paper-burn-outgoing')).toHaveCount(1);
  await page.waitForFunction(() => document.querySelector('#app')?.getAttribute('data-phase') === 'ready');
  await expect(page.locator('.paper-burn-outgoing')).toHaveCount(0);
});
