import { Layout } from '../components/Layout';

export const page = {
  mode: 'static' as const,
  title: 'How Signal is built',
  meta: [{ name: 'description', content: 'Agent-readable notes for the Signal What/Vura starter.' }],
  head: '<meta name="viewport" content="width=device-width, initial-scale=1"> <meta name="robots" content="noindex"> <meta name="description" content="Agent-readable notes for the Signal What/Vura starter."> <link rel="stylesheet" href="/styles.css">',
};

export default function BuildPage() {
  return (
    <Layout section="build">
      <p class="eyebrow">agent reference</p>
      <h1>How Signal uses What + Vura.</h1>
      <div class="build-grid">
        <section class="panel">
          <h2>Every incident needs a real route</h2>
          <p>The overview listed two fictional incidents but only the ingestion incident had a page. Both <code>aurora-latency.tsx</code> and <code>webhook-retry-spike.tsx</code> now export literal server-page configs and loaders. They share <code>IncidentDetail</code> for facts and timeline rendering; the second route is no longer a dead end.</p>
          <pre>{`export function loader() {
  return { renderedAt: new Date().toISOString(),
    incident: findIncident('webhook-retry-spike') };
}

const { incident, renderedAt } = useLoaderData<typeof loader>();`}</pre>
          <p>Add a concrete page for each bundled incident, keep config literals static, and browser-test every overview link plus CSS and cached/private render stamps before deploying.</p>
        </section>
        <section class="panel">
          <h2>Server pages</h2>
          <p><code>src/pages/index.tsx</code> exports <code>mode: 'server'</code>, <code>revalidate: 30</code>, and <code>tags</code>. Its loader returns a timestamp read with <code>useLoaderData</code>, so the product UI can show a real ISO render stamp instead of fallback copy.</p>
          <pre>{`export const page = {
  mode: 'server',
  revalidate: 30,
  tags: ['signal-overview']
};

const { renderedAt } = useLoaderData<typeof loader>();`}</pre>
        </section>
        <section class="panel">
          <h2>Uncached SSR</h2>
          <p><code>src/pages/snapshot.tsx</code> also uses <code>mode: 'server'</code>, but omits <code>revalidate</code>. That gives a fresh request-time render and private/no-store behavior.</p>
          <pre>{`const a = await fetch('/snapshot').then(r => r.text());
const b = await fetch('/snapshot').then(r => r.text());
expect(b).not.toBe(a);`}</pre>
        </section>
        <section class="panel">
          <h2>Health API</h2>
          <p><code>src/api/health.ts</code> is a bounded serverless route returning JSON derived from the same dataset as the UI.</p>
        </section>
        <section class="panel">
          <h2>Rendering issue fixed</h2>
          <p>Vura 0.8.3 scans page config statically. Helper calls, dataset identifiers, and template literals are rejected. Escaped <code>\\n</code> inside literal head strings also rendered visibly, so the final head strings are single-line literals.</p>
          <pre>{`// before: visible escape text
head: '<meta ...>\\\\n<link ...>'

// after: static and not visible
head: '<meta ...> <link ...>'`}</pre>
        </section>
        <section class="panel">
          <h2>Public CSS delivery check</h2>
          <p>A hosted review found the deployed URL could return 404 for <code>/styles.css</code> even while local Vura served <code>200 text/css</code>. The platform asset fix is tracked outside this repo; this starter now keeps a browser smoke assertion for local CSS status, content type, and computed mono styling so regressions are caught before deploy.</p>
          <pre>{`const css = await request.get('/styles.css');
expect(css.status()).toBe(200);
expect(css.headers()['content-type']).toContain('text/css');`}</pre>
        </section>
      </div>
    </Layout>
  );
}
