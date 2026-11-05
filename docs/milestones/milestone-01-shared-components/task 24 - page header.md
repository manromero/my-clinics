# Task 24 — Implement PageHeader

Status: `in_progress`

## Objective

Implement PageHeader for the shared MyClinics visual system.

## Scope

Provide a serif page title, optional description/eyebrow/metadata and slots for actions or filters. Allow wrapping and responsive stacking while preserving heading hierarchy; avoid a large set of unrelated styling flags.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 04 — Implement ActionLink](<task 04 - action link.md>) must be complete.
- [Task 06 — Implement Badge](<task 06 - badge.md>) must be complete.
- [Task 23 — Implement PageContainer](<task 23 - page container.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test heading level, optional content and action composition. Show clinic-like and monthly-like synthetic headings with long text at both sizes.
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

- Readiness: ready. Tasks 04, 06 and 23 are complete on origin/develop; approved scope and criteria above are unchanged.
- Workspace: isolated managed worktree for Task 24 to avoid interference with parallel assignments.
- Branch: `feature/page-header`; base: `adaaf2b3c40bb7aa151e2bf729029c5c15162d3c` (`origin/develop`).
- References: architecture, requirements, screens, Alexandria and S02-S04 HTML/PNG exports. Inspect both reference formats before implementing UI.
- Verified existing APIs: PageContainer supports semantic composition and responsive gutters; ActionLink supports text/primary/secondary variants; Badge supports compact metadata. Compose these without adding domain behavior.
- Relevant implementation: src/lib/components/page-header, src/app/components/page-header and the catalogue index. Preserve other components and task tracking in parallel branches.
- Ownership: native implementer owns application code, colocated contract tests, route-local interactive examples, checks, evidence, commits and PR. Coordinator owns tracking; separate native reviewer independently verifies code, functionality and visuals.
- Constraints: no production screens, domain filters, persistence or authentication; no dependent tasks. Read installed Next.js guides before code. Use pnpm 11.25.0 and preserve the lockfile. Dependencies must be installed in this worktree.
- Validation: meaningful heading-level, optional content and action-composition unit tests; full tests, lint, typecheck, format check and build. Live clinic-like/monthly-like long-text examples, keyboard focus, actions/filters and overflow at desktop/mobile. Use chrome-screenshots and github-pr with saved inline evidence.
- Open questions: none. API and responsive details are routine choices within approved scope.
- Correction rounds used: 0 of 2.
