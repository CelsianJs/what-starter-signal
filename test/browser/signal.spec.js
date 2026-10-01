import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';

test('server rendered pages and API respond', async ({ page, request }, testInfo) => {
  const html = await (await request.get('/')).text();
  expect(html).not.toContain('\\n');

  await page.goto('/');
  await expect.poll(() => page.locator('body').innerText()).not.toContain('\\n');
  await expect(page.getByRole('heading', { name: /systems under watch/i })).toBeVisible();
  await expect(page.getByText('cached server overview')).toBeVisible();
  await expectNoHorizontalOverflow(page);
  mkdirSync('test-results/screenshots', { recursive: true });
  await page.screenshot({ path: `test-results/screenshots/signal-overview-${testInfo.project.name}.png`, fullPage: true });

  await page.goto('/incidents/aurora-latency');
  await expect(page.getByRole('heading', { name: /elevated event ingestion latency/i })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: `test-results/screenshots/signal-incident-${testInfo.project.name}.png`, fullPage: true });

  const health = await request.get('/api/health');
  expect(health.ok()).toBeTruthy();
  expect(await health.json()).toMatchObject({ feature: 'bounded-health-api', fictional: true });

  for (const route of ['/snapshot', '/build', '/404']) {
    await page.goto(route);
    await expectNoHorizontalOverflow(page);
  }
});

test('uncached snapshot changes while ISR overview is stable inside the window', async ({ request }) => {
  const firstOverview = await (await request.get('/')).text();
  const secondOverview = await (await request.get('/')).text();
  expect(secondOverview).toBe(firstOverview);

  const firstSnapshot = await (await request.get('/snapshot')).text();
  await new Promise((resolve) => setTimeout(resolve, 25));
  const secondSnapshot = await (await request.get('/snapshot')).text();
  expect(secondSnapshot).not.toBe(firstSnapshot);
});

async function expectNoHorizontalOverflow(page) {
  const sizes = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(sizes.scrollWidth, `document overflow on ${page.url()}`).toBeLessThanOrEqual(sizes.innerWidth);
  expect(sizes.bodyScrollWidth, `body overflow on ${page.url()}`).toBeLessThanOrEqual(sizes.innerWidth);
}
