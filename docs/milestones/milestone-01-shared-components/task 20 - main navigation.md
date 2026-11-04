# Task 20 — Implement MainNavigation

Status: `in_progress`

## Objective

Implement MainNavigation for the shared MyClinics visual system.

## Scope

Provide links for Actividad, Resumen, Clinicas and Ajustes using the reference styling, active-route indication and accessible current-page semantics. Preserve all destinations on mobile with a usable layout or accessible disclosure; do not build business pages.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 04 — Implement ActionLink](<task 04 - action link.md>) must be complete.
- [Task 06 — Implement Badge](<task 06 - badge.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test active route, destinations, keyboard navigation and mobile disclosure if used. Show all active states and long-label resilience.
- Add or update the component's interactive examples in [/components](<task 00 - components showcase.md>), covering the variants and states in this task. Foundations must appear as specimens; the showcase task provides the initial screen itself.
- Include meaningful unit tests for the delivered public contract, semantics and interactions. No task is complete with screenshots alone, implementation-mirroring assertions or snapshots alone.
- Use `chrome-screenshots` for running catalogue evidence and `github-pr` for inline PR attachments. Inspect desktop (for example 1440 × 900) and mobile (for example 390 × 844); include a mobile capture whenever layout, wrapping, controls or interaction presentation differs, or explain why one image suffices. Include relevant focus/error/pending states and compare reference similarity, not just presence.
- Group each reusable component with its unit tests in src/lib/components/<component>. Keep page-specific specimens under src/app/components/<slug> and validate catalogue pages live rather than with unit tests; shared non-UI helpers belong in src/lib.
- Support Spanish labels, keyboard access, visible focus, readable contrast and narrow viewports. Keep generic UI free of authentication, persistence and clinic/calculation rules.

## Validation

Run the unit-test command established by Task 00 (once available), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build` for route, theme, font, dependency or production-build changes. Validate interactions in the running showcase as well as unit tests. Independently review code, behavior and visual evidence against [Alexandria](../../screens/alexandria/DESIGN.md), the [screen references](../../screens.md#visual-design-references), and applicable S01-S04 HTML/PNG files. Record command results and limitations, not assumed passes.

## Progress notes

Definition proposed in the Milestone 01 planning PR; implementation has not started. Human approval is pending merge. At execution, record branch/base, readiness, scoped references, tests, screenshots, review findings, correction rounds and implementation PR. Update this status and the milestone index together under the [tracking rules](../readme.md#task-structure-and-status).

## Execution context

- Readiness: ready; Tasks 04 and 06 are done on the fetched develop baseline.
- Workspace: isolated task worktree to support concurrent assignments.
- Branch: `feature/main-navigation`.
- Base: `origin/develop` at `c79f38e8a4412cb6ea30e934af8256942abaaf56`.
- Sources: approved task and milestone completion contract; `docs/architecture.md`,
  `docs/requirements.md`, `docs/screens.md`, Alexandria, and S02-S04 HTML/PNG references.
- Verified destinations: `/activity`, `/summary`, `/clinics`, `/settings`, with
  Spanish labels Actividad, Resumen, Clínicas and Ajustes.
- Relevant implementation: existing ActionLink, Badge, theme tokens, and dedicated
  catalogue routes. Inspect their current APIs before choosing composition.
- Constraints: no business routes, authentication, persistence or dependent tasks;
  preserve concurrent work and keep edits limited to this assignment.
- Validation: meaningful component tests; live catalogue keyboard, active-state and
  narrow-layout checks; lint, typecheck, format:check, build; desktop/mobile
  screenshots compared with references and inline PR evidence.
- Technical choice to resolve during implementation: focused active-route API and
  wrapping layout or accessible mobile disclosure. No unresolved product questions.
- Correction rounds used: 0 of 2.
