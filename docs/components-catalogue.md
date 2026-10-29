# Components catalogue

Run `pnpm dev` and open `/components`. The index links to dedicated foundations
and component pages, using synthetic content without authentication or services.
Shared components belong directly in `src/lib/components`; catalogue scaffolding
stays under `src/app/components`.

## Adding a component page

- Create `src/app/components/<slug>/page.tsx` with a stable lowercase English slug.
  Add its Spanish title, description and link to `src/app/components/page.tsx`.
  Only register implemented, approved components.
- Keep the page a Server Component with descriptive metadata. Use the route-local
  `Catalogue` renderer with `title`, `description` and `sections`. Each section has
  a stable `id`, Spanish title and description, and examples with a section-local
  `id`, title and ReactNode `content`. Preserve IDs used by fragment links.
- Put stateful demonstrations in a route-local Client Component, as in
  [ButtonSpecimen](../src/app/components/button-specimen.tsx). Show supported
  variants and relevant disabled, pending, error and focus states.

Existing routes: `/components/foundations` and `/components/button`. For example,
foundations motion links to `/components/foundations#fundamentos-movimiento`.

## Documentation and validation

Use TypeScript types and concise code comments for component contracts, and the
catalogue for usage examples. Do not create a Markdown file per component by
default. Add separate documentation only for decisions or instructions that code
and examples cannot clearly express. Cross-cutting design decisions belong in
[visual foundations](visual-foundations.md).

Run `pnpm test` (or `pnpm test:watch`) for colocated `src/**/*.test.ts(x)` tests.
Vitest provides jsdom, React Testing Library, jest-dom and user-event. Test public
semantics and behavior; verify layout and native fragment scrolling live.

Follow the [development workflow](development-workflow.md#review-and-evidence)
for validation, desktop/mobile review and PR screenshot attachments. Check changed
pages, index/return links, direct entry, fragments, keyboard focus and overflow
against [Alexandria](screens/alexandria/DESIGN.md) and the
[screen references](screens.md#visual-design-references).
