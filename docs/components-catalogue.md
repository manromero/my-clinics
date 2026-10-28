# Components catalogue

Open `/components` directly with `pnpm dev`. This public development catalogue
uses synthetic content only and has no authentication or data-service dependency.
The initial catalogue is deliberately empty. Its route-local scaffolding is not
a reusable UI component; future shared components belong directly in
`src/lib/components`.

## Registering examples

`src/app/components/catalogue.tsx` exports the route-local `CatalogueSection`
type and `catalogueSections` registry. Each section has a stable unique `id`
(the URL fragment), a Spanish `title`, a Spanish `description`, and `examples`.
Each example has a unique section-local `id`, Spanish `title`, and ReactNode
`content`. `Catalogue` accepts an optional readonly `sections` array for isolated
tests; the route uses the registry by default. Preserve existing IDs when titles
change so bookmarked anchors keep working.

Add approved examples to the appropriate section's `examples` array. For example,
after a future Button task implements its shared component:

```tsx
examples: [
  {
    id: "primary",
    title: "Acción principal",
    content: <Button>Acción de ejemplo</Button>,
  },
];
```

Use a route-local Client Component for stateful demonstrations and import that
demo into the registry. Keep the page a Server Component. Include supported
variants and relevant disabled, pending, error and focus states in each approved
task. Do not add placeholder implementations of future components. The global
empty message disappears once examples are registered; empty sections retain
their own message.

## Unit tests

Run `pnpm test` for a non-interactive Vitest run, or `pnpm test:watch` while editing.
Tests are colocated as `src/**/*.test.ts(x)`. Vitest uses jsdom, React Testing
Library, jest-dom assertions and user-event, with the same `@/` alias as the app.
Automatic cleanup isolates tests. Test public semantics and user behavior;
screenshots and class snapshots do not replace interactions. jsdom does not
perform native fragment scrolling or layout: verify those in the live browser.
Async Server Components require a different testing strategy; the catalogue is
synchronous and can be rendered directly.

## Visual evidence

Capture the running `/components` route at desktop and narrow mobile viewports.
Check section links by mouse/touch and keyboard, fragment deep links, visible
focus, wrapping and horizontal overflow. Compare tonal surfaces, whitespace and
restrained blue/gold accents with [Alexandria](screens/alexandria/DESIGN.md) and
the [Stitch screen references](screens.md#visual-design-references).
Task 00 uses minimal local scaffolding and system fonts; Task 01 establishes
the shared tokens and Noto Serif / Inter / Public Sans font loading.

Store useful captures with the PR, using durable attachments or commit-pinned
image URLs displayed inline. Record the actual viewport, image dimensions when
different, state, source commit and capturer, plus who performed live interactions.
Refresh captures after visual changes. See the
[workflow evidence contract](development-workflow.md#visual-pr-evidence).
