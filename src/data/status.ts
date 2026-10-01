export type Incident = {
  id: string;
  service: string;
  severity: 'watch' | 'minor' | 'major';
  status: 'monitoring' | 'resolved';
  started: string;
  title: string;
  summary: string;
  timeline: Array<{ at: string; event: string; detail: string }>;
};

export const services = [
  { name: 'Edge ingress', region: 'Global', state: 'operational', latency: 21, budget: 45 },
  { name: 'Event pipeline', region: 'iad-2', state: 'degraded', latency: 89, budget: 120 },
  { name: 'Query API', region: 'ewr-1', state: 'operational', latency: 37, budget: 80 },
  { name: 'Asset cache', region: 'sfo-1', state: 'operational', latency: 12, budget: 30 },
  { name: 'Webhook relay', region: 'Global', state: 'monitoring', latency: 64, budget: 90 },
];

export const incidents: Incident[] = [
  {
    id: 'aurora-latency',
    service: 'Event pipeline',
    severity: 'minor',
    status: 'monitoring',
    started: '2026-10-01T14:05:00.000Z',
    title: 'Elevated event ingestion latency in iad-2',
    summary:
      'A batch compactor is replaying delayed work. New events are accepted, while summary pages can lag by three to five minutes.',
    timeline: [
      { at: '14:05 UTC', event: 'Detected', detail: 'Synthetic write probes crossed the 90 second warning threshold.' },
      { at: '14:12 UTC', event: 'Mitigating', detail: 'Workers were shifted to the smaller replay queue to reduce head-of-line blocking.' },
      { at: '14:31 UTC', event: 'Monitoring', detail: 'Fresh writes are healthy; historical rollups are draining.' },
    ],
  },
  {
    id: 'webhook-retry-spike',
    service: 'Webhook relay',
    severity: 'watch',
    status: 'monitoring',
    started: '2026-10-01T11:22:00.000Z',
    title: 'Retry volume above normal for signed webhooks',
    summary:
      'A partner sandbox is returning intermittent 429s. Delivery remains within retry windows and no payloads have been dropped.',
    timeline: [
      { at: '11:22 UTC', event: 'Detected', detail: 'Retry ratio moved from 0.8% to 2.7% over a ten minute window.' },
      { at: '11:35 UTC', event: 'Notified', detail: 'The affected sandbox owner acknowledged the rate limit change.' },
      { at: '12:04 UTC', event: 'Monitoring', detail: 'Backoff policy is holding queue age under 45 seconds.' },
    ],
  },
];

export function statusSummary() {
  const degraded = services.filter((service) => service.state !== 'operational');
  return {
    headline: degraded.length === 0 ? 'All systems steady.' : `${degraded.length} system${degraded.length === 1 ? '' : 's'} under watch.`,
    degradedCount: degraded.length,
    operationalCount: services.length - degraded.length,
    incidentCount: incidents.filter((incident) => incident.status !== 'resolved').length,
  };
}

export function findIncident(id: string) {
  return incidents.find((incident) => incident.id === id);
}

export function healthSnapshot(now = new Date()) {
  const summary = statusSummary();
  return {
    ok: summary.degradedCount === 0,
    checkedAt: now.toISOString(),
    services: services.length,
    degraded: summary.degradedCount,
    incidents: summary.incidentCount,
  };
}
