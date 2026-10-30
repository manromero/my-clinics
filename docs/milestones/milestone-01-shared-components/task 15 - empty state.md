# Task 15 — Implement EmptyState

Status: `in_progress`

## Objective

Implement EmptyState for the shared MyClinics visual system.

## Scope

Provide a title, explanation, optional icon and contextual action or link. Keep the component domain-neutral; distinguish an empty result from an error or loading state.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 02 — Implement Button](<task 02 - button.md>) must be complete.
- [Task 04 — Implement ActionLink](<task 04 - action link.md>) must be complete.
- [Task 05 — Implement Surface / Card](<task 05 - surface.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test content, optional actions, link destinations and callbacks. Show no records, no matching results and no action examples.
- Add or update the component's interactive examples in [/components](<task 00 - components showcase.md>), covering the variants and states in this task. Foundations must appear as specimens; the showcase task provides the initial screen itself.
- Include meaningful unit tests for the delivered public contract, semantics and interactions. No task is complete with screenshots alone, implementation-mirroring assertions or snapshots alone.
- Capture graphical evidence from the running /components screen at desktop (for example 1440 x 900) and inspect mobile (for example 390 x 844). Include a mobile capture whenever layout, wrapping, controls or interaction presentation differs; if one capture suffices, explicitly record mobile inspection and why no separate image is needed. Label actual viewport, component/state, capturer and source commit. Capture focus/error/pending states when relevant.
- Display evidence inline in the implementation PR using verified GitHub attachments, following the [workflow evidence contract](../../development-workflow.md#visual-pr-evidence). Refresh affected captures after corrections. Check references for similarity, not just presence.
- Group each reusable component with its unit tests in src/lib/components/<component>. Keep page-specific specimens under src/app/components/<slug> and validate catalogue pages live rather than with unit tests; shared non-UI helpers belong in src/lib.
- Support Spanish labels, keyboard access, visible focus, readable contrast and narrow viewports. Keep generic UI free of authentication, persistence and clinic/calculation rules.

## Validation

Run the unit-test command established by Task 00 (once available), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build` for route, theme, font, dependency or production-build changes. Validate interactions in the running showcase as well as unit tests. Independently review code, behavior and visual evidence against [Alexandria](../../screens/alexandria/DESIGN.md), the [screen references](../../screens.md#visual-design-references), and applicable S01-S04 HTML/PNG files. Record command results and limitations, not assumed passes.

## Progress notes

Definition proposed in the Milestone 01 planning PR; implementation has not started. Human approval is pending merge. At execution, record branch/base, readiness, scoped references, tests, screenshots, review findings, correction rounds and implementation PR. Update this status and the milestone index together under the [tracking rules](../readme.md#task-structure-and-status).

## Execution context

- Readiness: ready; Tasks 02, 04 and 05 are complete on the fetched develop baseline. Approved scope and acceptance criteria remain unchanged.
- Branch: `feature/shared-empty-state`; base: `1876d2ee0520805052331ec26f2cfc7df69116de` (`origin/develop`). A dedicated worktree isolates parallel assignments.
- Relevant files: existing Button, ActionLink and Surface components; semantic theme in `src/app/globals.css`; catalogue index and route-local specimens under `src/app/components/empty-state`; reusable component and tests under `src/lib/components/empty-state`.
- Sources: requirements, architecture, screens, Alexandria DESIGN.md and applicable S02-S04 HTML/PNG exports. Read installed Next.js documentation before framework code changes.
- Verified: pnpm 11.25.0, Next 16.4.3, React 19.3.0, Tailwind v4/PostCSS and Vitest infrastructure. Native implementer and reviewer roles are available in this session.
- Constraints: domain-neutral title, explanation, optional decorative icon and contextual action/link; examples for no records, no matching results and no action. No production business screens or dependent tasks. Spanish UI and English documentation. Preserve parallel work and use a distinct server port.
- Validation: meaningful unit tests; lint, typecheck, format:check and build; live keyboard, callback and destination checks; desktop/mobile visual review and verified inline GitHub attachment evidence. Capture outside the repository and clean temporary artifacts after verified upload.
- Open questions: none. Hypotheses: none required.
- Correction rounds used: 0. Separate sequential implementation and independent review; human acceptance and manual merge remain pending.
