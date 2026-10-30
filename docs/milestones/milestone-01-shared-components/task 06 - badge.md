# Task 06 — Implement Badge

Status: `in_progress`

## Objective

Implement Badge for the shared MyClinics visual system.

## Scope

Provide compact neutral, active, inactive, informational and negative labels, with optional decorative icon/dot. Text must convey meaning without relying on color; avoid animation for a static active state.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 01 — Define and implement the Alexandria visual foundations](<task 01 - visual foundations.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test readable labels, optional decoration and accessible content. Show clinic-state, count and negative-entry examples without business logic.
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

- Readiness: ready. Tasks 00 and 01 are complete in the fetched integration baseline; approved scope and acceptance criteria remain unchanged.
- Branch: `feature/shared-badge`; base: `96fc35d17d0417a60267824972efe66a1791664a` (`origin/develop`). Dedicated worktree isolates parallel assignments.
- References: `docs/requirements.md`, `docs/architecture.md`, `docs/screens.md`, `docs/visual-foundations.md`, Alexandria DESIGN.md and applicable S02-S04 HTML/PNG exports.
- Relevant files: `src/app/globals.css`, `src/app/components/catalogue.tsx`, catalogue index, new `src/lib/components/badge` and route-local `src/app/components/badge` specimens.
- Verified findings: semantic status/tertiary/surface tokens and Vitest infrastructure already exist. Catalogue pages are separated by component. S02 uses compact rounded clinic-state labels and count labels; Alexandria governs typography and tonal treatments. Static active badges must not copy the prototype pulse animation.
- Constraints: generic presentation only, Spanish examples, English documentation, no business logic or dependent controls. Preserve other branches and worktrees. Read installed Next.js guides before writing framework code.
- Validation: meaningful Badge unit tests, full unit suite, lint, typecheck, formatting and build; live desktop/mobile catalogue and keyboard checks; comparison with references; verified inline GitHub PR attachments captured outside the repository.
- Native implementer and reviewer roles are available in this session; sequential handoffs, one writer at a time.
- Open questions: none. Hypotheses: none required.
- Correction rounds used: 0.
