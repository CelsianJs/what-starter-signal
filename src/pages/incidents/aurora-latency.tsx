import { useLoaderData } from '@celsian/vura-core';
import { Layout } from '../../components/Layout';
import { findIncident } from '../../data/status';

const incident = findIncident('aurora-latency');

export const page = {
  mode: 'server' as const,
  revalidate: 45,
  tags: ['signal-incidents'],
  title: 'Incident: elevated event ingestion latency',
  meta: [{ name: 'description', content: 'A fictional event ingestion incident timeline rendered by Vura.' }],
  head: '<meta name="viewport" content="width=device-width, initial-scale=1"> <meta name="robots" content="noindex"> <meta name="description" content="A fictional event ingestion incident timeline rendered by Vura."> <link rel="stylesheet" href="/styles.css">',
};

export function loader() {
  return {
    renderedAt: new Date().toISOString(),
    incident,
  };
}

export default function IncidentPage() {
  const { renderedAt, incident: current = incident } = useLoaderData<typeof loader>();
  if (!current) return <Layout><h1>Incident missing.</h1></Layout>;
  return (
    <Layout section="incident">
      <p class="eyebrow">server-rendered incident detail</p>
      <h1>{current.title}</h1>
      <p>{current.summary}</p>
      <section class="summary-strip" aria-label="Incident facts">
        <div class="metric"><strong>{current.service}</strong><span>service</span></div>
        <div class="metric"><strong>{current.severity}</strong><span>severity</span></div>
        <div class="metric"><strong>{current.status}</strong><span>status</span></div>
      </section>
      <section class="panel">
        <p class="eyebrow">timeline</p>
        <div class="timeline">
          {current.timeline.map((item) => (
            <article>
              <h2>{item.event}</h2>
              <p class="mono">{item.at}</p>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
      </section>
      <p class="mono">Rendered <time datetime={renderedAt}>{renderedAt}</time>; cached for 45-second incident-read bursts.</p>
      <p>Fictional status data. This route demonstrates cached incident detail rendering, not live monitoring.</p>
    </Layout>
  );
}
