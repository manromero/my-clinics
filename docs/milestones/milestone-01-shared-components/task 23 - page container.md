# Task 23 — Implement PageContainer

Status: `done`

## Objective

Implement PageContainer for the shared MyClinics visual system.

## Scope

Provide shared max-width, responsive horizontal gutters and vertical spacing consistent with S02-S04. Support content composition without hardcoded page data or route imports.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 01 — Define and implement the Alexandria visual foundations](<task 01 - visual foundations.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test semantic composition and caller-supplied accessible attributes. Show narrow and wide content with no viewport overflow.
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

- Readiness: ready. Task 01 is done on the integration baseline; approved scope and acceptance criteria above remain unchanged.
- Workspace: isolated managed worktree for Task 23, avoiding writes to the shared checkout during parallel assignments.
- Branch: `feature/page-container`; base: `c7d5b4fe5a36eae976afbb99da34999b090304de` (`origin/develop`).
- Sources: `docs/architecture.md`, `docs/screens.md`, Alexandria guidance and S02-S04 HTML/PNG references; existing foundations and dedicated catalogue pages.
- Verified reference layout: S02/S04 use `max-w-7xl`, `px-6 lg:px-12`, `py-8`; S03 adds `px-4 sm:px-6` for narrow viewports. Use these as visual direction, preserving accessible responsive composition.
- Implementation ownership: separate native implementer owns component, colocated semantic contract tests, route-local interactive specimens, catalogue entry, validation and PR. Coordinator owns tracking; separate native reviewer verifies code, functionality and visuals.
- Constraints: preserve unrelated work; no production screens or dependent components. Read installed Next.js documentation before code. Use pnpm 11.25.0 and the existing lockfile. New worktree has no installed dependencies yet.
- Validation: component contract tests, full unit tests, lint, typecheck, format check and build; live desktop/mobile catalogue and keyboard/overflow checks. Use chrome-screenshots and github-pr with saved inline evidence.
- Open product questions: none. API details and responsive implementation are routine technical choices within approved scope.
- Correction rounds used: 0 of 2. Initial implementation and independent review passed without findings.

## Delivery and independent review

- Implementation PR: [#32](https://github.com/manromero/my-clinics/pull/32), targeting `develop`.
- Implementation and visual evidence head: `b135340837d4343bfb7e4a5ec138991e6c0f5df2`; independent initial review passed at this head with no blockers or optional findings.
- Delivered PageContainer, colocated public-contract tests, dedicated interactive Spanish catalogue examples and index entry. Shared maximum width, responsive gutters and vertical spacing meet the approved scope.
- Implementer and reviewer independently passed `pnpm test` (25 files, 168 tests), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` (28 static routes), and `git diff --check`.
- Independent live checks covered narrow and wide content at 320, 390, 768, 1024 and 1440 CSS pixels without viewport overflow; keyboard toggling, child navigation and visible focus passed.
- Desktop/mobile screenshots and reference comparison are recorded in the PR. All four inline attachments were independently retrieved as HTTP 200 PNGs. Responsive CSS emulation used desktop browser identity; touch/device emulation and GitHub-page attachment rendering were not verified. Direct attachment retrieval and image inspection passed.
- Correction rounds: 0 of 2. No unresolved blockers. Final administrative tracking changes require final reviewer verification before handoff.
- Agent work is complete; human approval and manual merge remain pending in GitHub. No automatic merge is authorized.
