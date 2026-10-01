# Signal

Signal is a fictional infrastructure status starter for What Framework and Vura. It demonstrates:

- cached server-rendered pages with `mode: 'server'`, `revalidate`, and cache tags;
- uncached request-time server rendering without `revalidate`;
- a bounded serverless health API;
- incident detail routes and a real 404;
- public build notes agents can use as a reference.

## Prerequisites

- Node.js 22.x
- npm 10+
- After `npm ci`, install Playwright Chromium for browser verification: `npx playwright install chromium`
- Vura credentials only when deploying with `deploy:vura`; local build and verify run offline.

## Run locally

```bash
npm ci
npm run dev
```

Open the printed Vura URL and try:

- `/` for the cached status overview.
- `/snapshot` for a timestamp that changes on each request.
- `/incidents/aurora-latency` for a server-rendered incident timeline.
- `/api/health` for JSON from the same dataset.
- `/build` for implementation notes.

## Build and test

```bash
npm run test
npm run build
npm run test:browser
```

`npm run verify` runs the full local gate. Browser screenshots are saved under `test-results/screenshots`.
On minimal Linux CI images that do not already include browser system libraries, use `npx playwright install --with-deps chromium` instead.

## Deploy on Vura

Local `npm run build` intentionally has no managed adapter configured, so it does not require Vura credentials and does not upload anything. Deployment requires a configured Vura account and project.

```bash
npm ci
npx vura-platform login
npx vura-platform projects
npm run deploy:vura
```

Use `npm run deploy:vura:prod` for production after root review. The starter pins `vura-platform@0.3.0`.

Planned public repo: `CelsianJs/what-starter-signal`.

## Source map for agents

- `src/pages/index.tsx` — cached ISR status overview.
- `src/pages/snapshot.tsx` — uncached request-time SSR proof.
- `src/pages/incidents/aurora-latency.tsx` — server-rendered incident detail.
- `src/api/health.ts` — bounded serverless API route.
- `src/data/status.ts` — synthetic status dataset and health helpers.
- `src/pages/build.tsx` — public implementation notes.

This starter uses synthetic data only. It does not claim to monitor real infrastructure.
