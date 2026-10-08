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
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).fontFamily)).toMatch(/Avenir|Segoe/i);
  await expect.poll(() => page.locator('.mono').first().evaluate((node) => getComputedStyle(node).fontFamily)).toMatch(/mono|Menlo/i);
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

  await page.goto('/incidents/webhook-retry-spike');
  await expect(page.getByRole('heading', { name: 'Retry volume above normal for signed webhooks' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Notified', exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);

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

test('modern status chrome remains readable without client JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  for (const route of ['/', '/incidents/aurora-latency', '/incidents/webhook-retry-spike', '/snapshot', '/build', '/404']) {
    await page.goto(`http://127.0.0.1:4751${route}`);
    await expect(page.locator('h1')).toBeVisible();
    const styles = await page.evaluate(() => ({
      family: getComputedStyle(document.body).fontFamily,
      bodySize: parseFloat(getComputedStyle(document.body).fontSize),
      background: getComputedStyle(document.body).backgroundImage,
      heading: parseFloat(getComputedStyle(document.querySelector('h1')).fontSize),
      targets: [...document.querySelectorAll('.brand, nav a')].map((node) => node.getBoundingClientRect().height),
      brandDisplay: getComputedStyle(document.querySelector('.brand')).display,
      navColumns: getComputedStyle(document.querySelector('nav')).gridTemplateColumns.split(' ').length,
      navGeometry: [...document.querySelectorAll('nav a')].map((node) => {
        const box = node.getBoundingClientRect();
        return { top: Math.round(box.top), left: Math.round(box.left), bottom: Math.round(box.bottom) };
      }),
      codeScrolling: [...document.querySelectorAll('pre')].every((node) => ['auto', 'scroll'].includes(getComputedStyle(node).overflowX)),
    }));
    expect(styles.family).toMatch(/Avenir|Segoe/);
    expect(styles.bodySize).toBe(16);
    expect(styles.background).toBe('none');
    expect(styles.heading).toBeLessThanOrEqual(32);
    expect(styles.targets.every((height) => height >= 44)).toBeTruthy();
    expect(styles.brandDisplay).toBe('inline-flex');
    expect(styles.navColumns).toBe(2);
    expect(styles.navGeometry).toHaveLength(4);
    const [first, second, third, fourth] = styles.navGeometry;
    expect(first.top).toBe(second.top);
    expect(third.top).toBe(fourth.top);
    expect(first.left).toBe(third.left);
    expect(second.left).toBe(fourth.left);
    expect(third.top).toBeGreaterThanOrEqual(first.bottom);
    expect(styles.codeScrolling).toBeTruthy();
    const clippedFacts = await page.locator('.metric strong').evaluateAll((nodes) => nodes.some((node) => node.scrollWidth > node.clientWidth));
    expect(clippedFacts, `clipped status fact on ${route}`).toBeFalsy();
    await expectNoHorizontalOverflow(page);
  }
  await context.close();
});

async function expectNoHorizontalOverflow(page) {
  const viewportWidth = page.viewportSize().width;
  const sizes = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(sizes.scrollWidth, `document overflow on ${page.url()}`).toBeLessThanOrEqual(viewportWidth);
  expect(sizes.bodyScrollWidth, `body overflow on ${page.url()}`).toBeLessThanOrEqual(viewportWidth);
}
