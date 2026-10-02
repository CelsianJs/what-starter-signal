import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';

test('server rendered pages and API respond', async ({ page, request }, testInfo) => {
  const css = await request.get('/styles.css');
  expect(css.status()).toBe(200);
  expect(css.headers()['content-type']).toContain('text/css');
  expect(await css.text()).toContain('--green');

  const html = await (await request.get('/')).text();
  expect(html).not.toContain('\\n');
  expect(html).not.toContain('render proof unknown');
  expect(html).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);

  await page.goto('/');
  await expect.poll(() => page.locator('body').innerText()).not.toContain('\\n');
  await expect(page.getByRole('heading', { name: /systems under watch/i })).toBeVisible();
  await expect(page.getByText('cached server overview')).toBeVisible();
  await expect(page.getByText(/Cached overview · revalidates every 30 seconds/i)).toBeVisible();
  await expect(page.getByText(/unknown/i)).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).fontFamily)).toMatch(/mono|Menlo|Consolas|Plex/i);
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
  await expectNoHorizontalOverflow(page);
  mkdirSync('test-results/screenshots', { recursive: true });
  await page.screenshot({ path: `test-results/screenshots/signal-overview-${testInfo.project.name}.png`, fullPage: true });

  await page.goto('/incidents/aurora-latency');
  await expect(page.getByRole('heading', { name: /elevated event ingestion latency/i })).toBeVisible();
  await expect(page.getByText(/Rendered .*cached for 45-second incident-read bursts/)).toBeVisible();
  await expect(page.getByText(/unknown/i)).toHaveCount(0);
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
