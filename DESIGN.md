# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-10-02
- Primary product surfaces: cached status overview, request-time snapshot, incident detail, health API, build notes.
- Evidence reviewed: sibling `what-starters` conventions, Little Friend Vura server pages, Vura core README, What Framework README.

## Brand
- Personality: severe, operator-grade, high-contrast, infrastructure-console minimalism.
- Trust signals: timestamps, service budgets, incident timelines, explicit fictional data label.
- Avoid: real-provider claims, toy dashboards, purple SaaS gradients, fake telemetry language.

## Product goals
- Goals: prove Vura server pages, ISR cache metadata, uncached SSR, bounded API routes, and agent-readable implementation notes.
- Non-goals: real monitoring ingestion, auth, distributed incident management, production SLA claims.
- Success signals: cached overview timestamp is stable inside the window; snapshot timestamp changes per request; health API returns bounded JSON.

## Personas and jobs
- Primary personas: framework evaluators, agents learning Vura route modes, developers building status pages.
- User jobs: understand service state, inspect one incident, verify server-rendering behavior.
- Key contexts of use: starter gallery, public template repo, local dogfood verification, Vura deploy smoke.

## Information architecture
- Primary navigation: Overview, Incident, Live snapshot, Build notes.
- Core routes/screens: `/`, `/incidents/aurora-latency`, `/snapshot`, `/build`, `/404`, `/api/health`.
- Content hierarchy: operational summary first, services second, incident timeline third, implementation proof last.

## Design principles
- Principle 1: make runtime behavior visible in compact product UI, with deeper implementation mechanics on `/build`.
- Principle 2: use fictional but concrete operations data.
- Tradeoffs: visual density is acceptable because this represents an operator tool; copy stays explicit to avoid mistaking synthetic status for real production state.

## Visual language
- Color: black/green terminal base with amber warning and blue timestamp accents.
- Typography: monospace console voice for operator trust.
- Spacing/layout rhythm: dense cards and grid strips; large compressed hero headline.
- Shape/radius/elevation: rectangular panels, hairline borders, deep black shadows.
- Motion: essentially static; operators should not fight motion during incidents.
- Imagery/iconography: text-first, small geometric signal mark only.

## Components
- Existing components to reuse: none; standalone starter.
- New/changed components: `Layout`, status cards, timeline, build note panels.
- Variants and states: operational/degraded service cards; watch/minor/major incident severity.
- Token/component ownership: CSS custom properties in `public/styles.css` and mirrored source stylesheet.

## Accessibility
- Target standard: WCAG AA contrast for text and controls.
- Keyboard/focus behavior: semantic anchors/buttons; no hidden custom controls.
- Contrast/readability: high contrast dark theme with large text.
- Screen-reader semantics: one main landmark, labelled nav, section headings and definition-like metrics.
- Reduced motion and sensory considerations: no essential animation.

## Responsive behavior
- Supported breakpoints/devices: desktop, tablet, mobile.
- Layout adaptations: hero, metrics, service grids, build notes collapse to one column.
- Touch/hover differences: links remain text-based; hover color is decorative only.

## Interaction states
- Loading: server-rendered pages avoid client loading states.
- Empty: 404 route handles missing pages.
- Error: health API remains bounded; no external network dependencies.
- Success: timestamps and summary counts are visible.
- Disabled: not applicable.
- Offline/slow network: static CSS and server HTML keep primary content readable.

## Content voice
- Tone: precise, factual, operator calm.
- Terminology: “cached server overview”, “private no-store server render”, “fictional infrastructure”.
- Microcopy rules: never imply live production incidents; name Vura route behavior plainly on `/build` and keep product pages focused on useful render/cache stamps.

## Implementation constraints
- Framework/styling system: What Framework JSX rendered by Vura pages; vanilla CSS.
- Design-token constraints: local CSS variables only.
- Performance constraints: no client bundle needed for primary pages; bounded JSON API.
- Compatibility constraints: Node 22, Vura 0.8.3, What 0.13.10, Vura Platform CLI 0.3.0.
- Test/screenshot expectations: Vitest data tests and Playwright desktop/mobile route/API/cache-flow smoke. Browser smoke must fail if `/styles.css` is not `200 text/css`, if computed body styling is default, or if loader timestamps fall back to `unknown`.

## Open questions
- [ ] Root owner / deployment / choose the managed Vura project during publish; the default starter config stays adapter-free for offline builds.
