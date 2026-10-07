import { useLoaderData } from '@celsian/vura-core';
import { IncidentDetail } from '../../components/IncidentDetail';
import { findIncident } from '../../data/status';

export const page = {
  mode: 'server' as const,
  revalidate: 45,
  tags: ['signal-incidents'],
  title: 'Incident: signed webhook retry volume',
  head: '<meta name="viewport" content="width=device-width, initial-scale=1"> <meta name="robots" content="noindex"> <meta name="description" content="A fictional webhook retry incident timeline rendered by Vura."> <link rel="stylesheet" href="/styles.css">',
};

export function loader() {
  return { renderedAt: new Date().toISOString(), incident: findIncident('webhook-retry-spike') };
}

export default function WebhookIncident() {
  const { incident, renderedAt } = useLoaderData<typeof loader>();
  return <IncidentDetail incident={incident} renderedAt={renderedAt} />;
}
