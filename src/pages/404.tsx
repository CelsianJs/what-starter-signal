import { Layout } from '../components/Layout';

export const page = {
  mode: 'static' as const,
  title: 'Missing signal',
  meta: [{ name: 'description', content: 'Signal Works 404 page.' }],
  head: '<meta name="viewport" content="width=device-width, initial-scale=1"> <meta name="robots" content="noindex"> <meta name="description" content="Signal Works 404 page."> <link rel="stylesheet" href="/styles.css">',
};

export default function NotFound() {
  return (
    <Layout section="missing">
      <p class="eyebrow">404</p>
      <h1>This signal is not on the board.</h1>
      <p>Return to the <a href="/">status overview</a>.</p>
    </Layout>
  );
}
