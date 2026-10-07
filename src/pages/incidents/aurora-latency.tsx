import { useLoaderData } from '@celsian/vura-core';
import { IncidentDetail } from '../../components/IncidentDetail';
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
  return <IncidentDetail incident={current} renderedAt={renderedAt} />;
}
