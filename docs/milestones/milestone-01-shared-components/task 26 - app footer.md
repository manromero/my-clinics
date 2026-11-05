# Task 26 — Implement AppFooter

Status: `in_progress`

## Objective

Implement AppFooter for the shared MyClinics visual system.

## Scope

Provide responsive footer composition for application identity and optional caller-supplied links/metadata. Follow reference tonal styling and wrapping; do not assert legal compliance or create legal pages from prototype text.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 04 — Implement ActionLink](<task 04 - action link.md>) must be complete.
- [Task 23 — Implement PageContainer](<task 23 - page container.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test supplied content/links, absence of optional slots and semantic footer. Show compact and link-rich synthetic examples.
- Add or update the component's interactive examples in [/components](<task 00 - components showcase.md>), covering the variants and states in this task. Foundations must appear as specimens; the showcase task provides the initial screen itself.
- Include meaningful unit tests for the delivered public contract, semantics and interactions. No task is complete with screenshots alone, implementation-mirroring assertions or snapshots alone.
- Use `chrome-screenshots` for running catalogue evidence and `github-pr` for inline PR attachments. Inspect desktop (for example 1440 × 900) and mobile (for example 390 × 844); include a mobile capture whenever layout, wrapping, controls or interaction presentation differs, or explain why one image suffices. Include relevant focus/error/pending states and compare reference similarity, not just presence.
- Group each reusable component with its unit tests in src/lib/components/<component>. Keep page-specific specimens under src/app/components/<slug> and validate catalogue pages live rather than with unit tests; shared non-UI helpers belong in src/lib.
- Support Spanish labels, keyboard access, visible focus, readable contrast and narrow viewports. Keep generic UI free of authentication, persistence and clinic/calculation rules.

## Validation

Run the unit-test command established by Task 00 (once available), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build` for route, theme, font, dependency or production-build changes. Validate interactions in the running showcase as well as unit tests. Independently review code, behavior and visual evidence against [Alexandria](../../screens/alexandria/DESIGN.md), the [screen references](../../screens.md#visual-design-references), and applicable S01-S04 HTML/PNG files. Record command results and limitations, not assumed passes.

## Execution context

- Readiness: approved scope and acceptance criteria are in place. ActionLink (04)
  and PageContainer (23) are complete on the refreshed `origin/develop`.
- Assignment: `feature/app-footer` from `d5bee989de58f0962f6fe212c008bfe4c6a603fd`
  in an isolated worktree for parallel milestone work.
- Reuse the shared PageContainer gutters and ActionLink navigation treatment.
  Follow the dedicated catalogue route pattern used by the existing AppHeader.
- S01 HTML shows a compact centered identity on a low tonal surface. S02–S04
  show the same surface with Public Sans metadata and grouped links that stack
  on narrow screens. Compare the supplied PNGs where the footer is visible.
  Use synthetic Spanish content for the specimens.
- Validate semantic footer, caller-provided content and destinations, omitted
  slots, narrow wrapping, and keyboard access with visible focus. Run the full
  unit suite, lint, typecheck, formatting and production build. Inspect the
  running catalogue at desktop and mobile widths and record the source commit.
- Open questions: none. Correction rounds used: 0.

## Progress notes

Definition proposed in the Milestone 01 planning PR; implementation has not started. Human approval is pending merge. At execution, record branch/base, readiness, scoped references, tests, screenshots, review findings, correction rounds and implementation PR. Update this status and the milestone index together under the [tracking rules](../readme.md#task-structure-and-status).
