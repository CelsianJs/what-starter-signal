import { Layout } from './Layout';
import type { Incident } from '../data/status';

export function IncidentDetail({ incident, renderedAt }: { incident?: Incident; renderedAt: string }) {
  if (!incident) return <Layout><h1>Incident missing.</h1><a href="/">Return to overview</a></Layout>;
  return (
    <Layout section="incident">
      <a href="/">← All incidents</a>
      <p class="eyebrow">server-rendered incident detail</p>
      <h1>{incident.title}</h1>
      <p>{incident.summary}</p>
      <section class="summary-strip" aria-label="Incident facts">
        <div class="metric"><strong>{incident.service}</strong><span>service</span></div>
        <div class="metric"><strong>{incident.severity}</strong><span>severity</span></div>
        <div class="metric"><strong>{incident.status}</strong><span>status</span></div>
      </section>
      <section class="panel">
        <p class="eyebrow">timeline · October 1, 2026</p>
        <div class="timeline">
          {incident.timeline.map((item) => (
            <article><h2>{item.event}</h2><p class="mono">{item.at}</p><p>{item.detail}</p></article>
          ))}
        </div>
      </section>
      <p class="mono">Rendered <time datetime={renderedAt}>{renderedAt}</time>; cached for 45-second incident-read bursts.</p>
      <p>Fictional status data. This route demonstrates cached incident detail rendering, not live monitoring.</p>
    </Layout>
  );
}
