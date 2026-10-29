# Task 27 — Split the catalogue into dedicated pages

Status: `in_progress`

## Objective

Move the existing visual catalogue into an index and dedicated foundations and component pages, as requested by the user on 2026-10-29.

## Scope

Reuse `/components` as the navigation index. Move existing foundations specimens to `/components/foundations` and Button specimens to `/components/button`. Establish the same dedicated-page convention for future components and update catalogue documentation and affected references.

## Exclusions

No new shared components, variants, business screens, or visual-system redesign. Do not implement pending milestone components.

## Dependencies

Tasks 00, 01 and 02 are implemented and merged into develop.

## Acceptance criteria

- The index links to separate foundations and Button pages without embedding their specimens.
- Each destination opens directly, identifies its content, and provides navigation back to the index.
- Preserve all existing specimens and interactive Button behavior.
- Spanish labels, accessible headings, keyboard navigation, visible focus and narrow layouts remain usable.
- Document how future components receive their own pages; keep route scaffolding local and shared components in `src/lib/components`.

## Validation

Run `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build`. Verify live navigation and desktop/mobile presentation on all three routes. Follow the workflow contract for independent review and inline GitHub PR screenshot attachments.

## Execution context

- Ready: user request defines the migration scope; no unresolved product decisions.
- Branch: `feature/components-pages`; refreshed develop base: `4c037f85f743e4890281ae98a08ed6bd6c680b25`. Clean checkout at intake.
- Sources: `src/app/components`, `docs/components-catalogue.md`, `docs/visual-foundations.md`, `docs/button.md`, architecture, requirements, screens and Alexandria references.
- Existing catalogue embeds foundations and Button in three section groups. Preserve demonstrations while changing route composition; empty future groups may remain index scaffolding without invented pages.
- Read relevant installed Next.js guides before code changes. Native implementer and reviewer role selection is available in this session.
- Correction rounds used: 0.

## Progress notes

Implementation and independent review pending.
