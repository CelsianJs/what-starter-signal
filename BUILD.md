# Signal build journal

## Status

- 2026-10-01 12:58 America/New_York — Created starter scope after the initially referenced tracker entries were not present.
- 2026-10-01 13:05 America/New_York — Implemented Vura server pages, health API, design contract, tests, and docs.

## What it demonstrates

- `/` is a server page with `revalidate: 30` and `tags: ['signal-overview']`; repeat reads during the cache window should reuse the rendered HTML.
- `/snapshot` is a server page with no `revalidate`; it should render fresh per request.
- `/incidents/aurora-latency` is a routeable incident detail page with a short cache window.
- `/api/health` is serverless JSON derived from the same local dataset as the UI.

## Actual rendering issue and fix

- The status product is intentionally fictional. The copy says this in the hero, API docs, and README so the demo does not imply real production telemetry.
- The CSS is duplicated into `public/styles.css` because Vura serves public assets at runtime; a runtime stylesheet cannot import from private source paths.
- Vura 0.8.3 requires `export const page` config values to be statically literal. Helper calls, dataset-derived identifiers, and template literals in page config are rejected during route scanning, so repeated single-line head strings are intentional. A follow-up browser pass also caught that escaped `\\n` inside head strings renders visibly; the fixed pages avoid escape sequences entirely.
- Design/runtime review found the page components were expecting loader return values as top-level props, so the public UI printed `unknown` instead of proving SSR/cache timing. The fix imports `useLoaderData` from `@celsian/vura-core` in overview, incident, and snapshot pages, then renders compact ISO timestamps in product UI and keeps the implementation explanation on `/build`.
- A hosted review also found `/styles.css` returning 404 on the deployed Vura URL while local Vura served `200 text/css`; the platform public-asset delivery fix is owned separately. Signal now has browser smoke coverage for local stylesheet status, content type, source token, and computed mono styling so the app cannot look like unstyled browser defaults in local verification.
- The default `vura.config.ts` intentionally has no managed adapter. Local `npm run build` and `npm run verify` stay offline and require no Vura credentials. Publishing still uses the separate pinned `vura-platform@0.3.0` deploy scripts after root review.

Before:

```tsx
head: '<meta name="robots" content="noindex">\\n<link rel="stylesheet" href="/styles.css">'
```

Actual result: browser body showed literal `\n` text in the top-left of the rendered page.

After:

```tsx
head: '<meta name="robots" content="noindex"> <link rel="stylesheet" href="/styles.css">'
```

Regression proof added in `test/browser/signal.spec.js`:

```js
const html = await (await request.get('/')).text();
expect(html).not.toContain('\\n');
await expect.poll(() => page.locator('body').innerText()).not.toContain('\\n');
```

## Smooth path for agents

1. Keep page config literals boring: no helper calls, no identifiers, no template literals.
2. Put live request data in `loader()`, not in `page`.
3. Use `revalidate` only on routes that should be cached.
4. Browser-test both HTML text and request body when teaching SSR behavior.
5. Keep the default Vura config adapter-free; deploy commands can be explicit, but starter builds should never need hosted-platform credentials.

## Verification checklist

- `npm ci` — clean install with 0 vulnerabilities in the local verification run.
- `npm run verify` — unit tests, offline Vura build, and browser smoke. A required follow-up run used `VURA_TOKEN` and team env vars explicitly unset to prove no hosted adapter/auth path is needed for local verification.
- Runtime proof: browser test fetches `/` twice and `/snapshot` twice to compare cached vs uncached bodies.
- Visual proof: desktop and mobile screenshots are written to `test-results/screenshots`.

## Known limitations

- Cache behavior is verified against the local Vura Node runtime before root deployment. Distributed platform invalidation is not claimed here.
- The health API is deliberately bounded and read-only; it is not a monitoring ingestion service.
- Both bundled incidents have concrete detail routes and share `src/components/IncidentDetail.tsx`. Add another concrete page or a verified dynamic route pattern before expanding the dataset.

## Complete incident routes

The second active incident used to link to a 404 because its bundled data had no page. `src/pages/incidents/webhook-retry-spike.tsx` now has literal server-page configuration with 45-second caching and a loader read through `useLoaderData`. The ingestion and webhook routes share facts/timeline rendering. The browser suite visits both details while retaining CSS, real loader stamp and cached-versus-private snapshot assertions.

Smooth path: keep page configs statically literal, put request data in loaders, add a concrete route for every overview href, and test the full dataset's links. Timeline dates are fictional October 1, 2026 fixtures; nothing connects to real provider telemetry.
