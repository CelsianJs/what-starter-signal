import { Layout } from '../components/Layout';
import { incidents, services, statusSummary } from '../data/status';

export const page = {
  mode: 'server' as const,
  revalidate: 30,
  tags: ['signal-overview'],
  title: 'Signal Works status',
  meta: [{ name: 'description', content: 'Fictional infrastructure status starter with Vura ISR.' }],
  head: '<meta name="viewport" content="width=device-width, initial-scale=1"> <meta name="robots" content="noindex"> <meta name="description" content="A fictional infrastructure status page rendered with cached server output on Vura."> <link rel="stylesheet" href="/styles.css">',
};

export function loader() {
  return {
    renderedAt: new Date().toISOString(),
    summary: statusSummary(),
  };
}

export default function Overview({ renderedAt, summary }: { renderedAt?: string; summary?: ReturnType<typeof statusSummary> }) {
  const totals = summary ?? statusSummary();
  return (
    <Layout>
      <section class="hero">
        <div>
          <p class="eyebrow">cached server overview</p>
          <h1>{totals.headline}</h1>
          <p>
            Signal Works is a fictional infrastructure status product. This overview is server rendered by Vura with
            <code> revalidate: 30</code>, so repeat reads can reuse a cached render.
          </p>
        </div>
        <aside class="panel">
          <p class="eyebrow">render proof</p>
          <p class="mono">{renderedAt ?? 'unknown'}</p>
          <p>Fetch this page twice during the cache window and the timestamp should stay stable.</p>
        </aside>
      </section>
      <section class="summary-strip" aria-label="Status summary">
        <div class="metric"><strong>{totals.operationalCount}</strong><span>operational</span></div>
        <div class="metric"><strong>{totals.degradedCount}</strong><span>under watch</span></div>
        <div class="metric"><strong>{totals.incidentCount}</strong><span>active incidents</span></div>
      </section>
      <section>
        <h2>Service board</h2>
        <div class="service-grid">
          {services.map((service) => (
            <article class={`service-card ${service.state === 'operational' ? '' : 'is-degraded'}`}>
              <span class="pill">{service.state}</span>
              <h3>{service.name}</h3>
              <p>{service.region}</p>
              <p class="mono">{service.latency} ms / {service.budget} ms budget</p>
            </article>
          ))}
        </div>
      </section>
      <section>
        <h2>Active incidents</h2>
        <div class="incident-list">
          {incidents.map((incident) => (
            <a class="incident-card" href={`/incidents/${incident.id}`}>
              <span class={`severity-${incident.severity}`}>{incident.severity}</span>
              <span>
                <strong>{incident.title}</strong>
                <p>{incident.summary}</p>
              </span>
            </a>
          ))}
        </div>
      </section>
    </Layout>
  );
}
