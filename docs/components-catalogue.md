# Components catalogue

Open `/components` directly with `pnpm dev`. This public development catalogue
uses synthetic content only and has no authentication or data-service dependency.
The index links to the dedicated `/components/foundations` and
`/components/button` pages without embedding specimens. Each page opens directly
and links back to the index. This route-local scaffolding is not a reusable UI
component; shared components belong directly in `src/lib/components`.

## Registering pages and examples

Give each approved component its own `src/app/components/<slug>/page.tsx` route
and add a Spanish title, description and link to the index in
`src/app/components/page.tsx`. Use stable, lowercase English slugs, following
`/components/button`. Do not create pages or implementations for pending components.

Keep pages as Server Components with descriptive metadata. Use the route-local
`Catalogue` renderer from `catalogue.tsx` for the heading, index return link,
section navigation and examples. Pass a Spanish `title`, `description` and readonly
`sections` array. `CatalogueSection` defines each section's stable unique `id`
(URL fragment), Spanish title and description, and examples with section-local
`id`, Spanish title and ReactNode content.

The foundations page imports `foundationExamples`; the Button page composes
`ButtonSpecimen`. Use a route-local Client Component for stateful demonstrations.
Include supported variants and relevant disabled, pending, error and focus states
within each approved task. Preserve existing section and example IDs when titles
change. The existing foundations fragments now live under
`/components/foundations` (for example, `#fundamentos-movimiento`); the Button
fragment is `/components/button#controles-button`.

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

Capture `/components` and every changed dedicated page at desktop and narrow
mobile viewports. Verify index links, direct page entry and return navigation.
Check section links by mouse/touch and keyboard, fragment deep links, visible
focus, wrapping and horizontal overflow. Compare tonal surfaces, whitespace and
restrained blue/gold accents with [Alexandria](screens/alexandria/DESIGN.md) and
the [Stitch screen references](screens.md#visual-design-references).
Task 00 uses minimal local scaffolding and system fonts; Task 01 establishes
the shared tokens and Noto Serif / Inter / Public Sans font loading.

Capture into a temporary directory outside the repository. Upload useful captures
as GitHub PR attachments and verify the saved inline URLs and image retrieval
before removing temporary files and delivering the PR. Do not commit new delivery
screenshots or use source commits to host them. Retain textual evidence records in the PR,
with attachment URLs, actual viewport, image dimensions when different, state,
source commit, capturer, and who performed live interactions. Refresh attachments
after visual changes and preserve historical evidence and supplied references.
Keep only a validation summary and PR link in the task; do not add a separate
`docs/evidence` report that duplicates the PR.
For example, `gh pr edit <number> --body-file <temporary-body-file> --attach <capture>`
uploads a capture; a matching local Markdown reference in the body is rewritten
to its attachment URL. Repeat `--attach` for multiple files. See the
[GitHub attachment documentation](https://docs.github.com/en/github-cli/github-cli/attaching-files-with-github-cli)
and the
[workflow evidence contract](development-workflow.md#visual-pr-evidence).
