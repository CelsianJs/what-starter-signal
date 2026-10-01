export function Layout({ children, section = 'status' }: { children: any; section?: string }) {
  return (
    <main class={`signal-page signal-${section}`}>
      <header class="site-header">
        <a class="brand" href="/">
          <span class="brand-mark" aria-hidden="true">▰</span>
          <span>Signal Works</span>
        </a>
        <nav aria-label="Primary">
          <a href="/">Overview</a>
          <a href="/incidents/aurora-latency">Incident</a>
          <a href="/snapshot">Live snapshot</a>
          <a href="/build">Build notes</a>
        </nav>
      </header>
      {children}
    </main>
  );
}

export function DocumentHead({ title, description }: { title: string; description: string }) {
  return [
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="robots" content="noindex">',
    `<meta name="description" content="${description}">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    '<link rel="stylesheet" href="/styles.css">',
  ].join('\n');
}
