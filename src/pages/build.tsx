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
          <h2>Server pages</h2>
          <p><code>src/pages/index.tsx</code> exports <code>mode: 'server'</code>, <code>revalidate: 30</code>, and <code>tags</code>. Its loader returns a timestamp that should be reused inside the ISR window.</p>
          <pre>{`export const page = {
  mode: 'server',
  revalidate: 30,
  tags: ['signal-overview']
};`}</pre>
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
      </div>
    </Layout>
  );
}
