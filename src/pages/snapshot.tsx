import { useLoaderData } from '@celsian/vura-core';
import { Layout } from '../components/Layout';
import { healthSnapshot } from '../data/status';

export const page = {
  mode: 'server' as const,
  title: 'Live request snapshot | Signal Works',
  meta: [{ name: 'description', content: 'Uncached request-time status snapshot.' }],
  head: '<meta name="viewport" content="width=device-width, initial-scale=1"> <meta name="robots" content="noindex"> <meta name="description" content="An uncached Vura server page whose timestamp changes on every request."> <link rel="stylesheet" href="/styles.css">',
};

export function loader() {
  return healthSnapshot();
}

export default function Snapshot() {
  const props = useLoaderData<typeof loader>();
  return (
    <Layout section="snapshot">
      <p class="eyebrow">private no-store server render</p>
      <h1>Every request gets a fresh operator snapshot.</h1>
      <p>This page deliberately omits <code>revalidate</code>; it is the companion to the cached overview.</p>
      <section class="panel">
        <p>Checked at</p>
        <p class="snapshot-stamp">{props.checkedAt}</p>
        <pre>{JSON.stringify(props, null, 2)}</pre>
      </section>
    </Layout>
  );
}
