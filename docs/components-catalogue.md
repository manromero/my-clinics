# Components catalogue

Run `pnpm dev` and open `/components`. The index links to dedicated foundations
and component pages, using synthetic content without authentication or services.
Group each shared component with its unit tests in `src/lib/components/<component>`.
Keep page-specific specimens within `src/app/components/<slug>`; only scaffolding
shared by catalogue pages stays at the catalogue root.

## Adding a component page

- Create `src/app/components/<slug>/page.tsx` with a stable lowercase English slug.
  Add its Spanish title, description and link to `src/app/components/page.tsx`.
  Only register implemented, approved components.
- Keep the page a Server Component with descriptive metadata. Use the route-local
  `Catalogue` renderer with `title`, `description` and `sections`. Each section has
  a stable `id`, Spanish title and description, and examples with a section-local
  `id`, title and ReactNode `content`. Preserve IDs used by fragment links.
- Put stateful demonstrations in a route-local Client Component, as in
  [ButtonSpecimen](../src/app/components/button/button-specimen.tsx). Show supported
  variants and relevant disabled, pending, error and focus states.

Existing routes: `/components/foundations` and `/components/button`. For example,
foundations motion links to `/components/foundations#fundamentos-movimiento`.

## Documentation and validation

Follow the [component documentation guidance](architecture.md#component-documentation):
use types and readable code for contracts, and this temporary catalogue for
demonstrations. Keep reusable components free of references to these test pages.
Cross-cutting design decisions belong in
[visual foundations](visual-foundations.md).

Do not add unit tests for catalogue pages or their specimens: validate these
demonstrations in the running application. Keep unit tests for reusable components.
Run `pnpm test` (or `pnpm test:watch`) for colocated `src/**/*.test.ts(x)` tests.
Vitest provides jsdom, React Testing Library, jest-dom and user-event. Test public
semantics and behavior; verify layout and native fragment scrolling live.

Follow the [development workflow](development-workflow.md#review-and-evidence)
for validation, desktop/mobile review and PR screenshot attachments. Check changed
pages, index/return links, direct entry, fragments, keyboard focus and overflow
against [Alexandria](screens/alexandria/DESIGN.md) and the
[screen references](screens.md#visual-design-references).
