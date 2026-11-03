# Task 16 — Implement Dialog

Status: `in_progress`

## Objective

Implement Dialog for the shared MyClinics visual system.

## Scope

Provide an accessible modal primitive with title/description, open/close lifecycle, backdrop, responsive sizing, overflow handling and reachable actions. Manage initial focus, focus containment, Escape, background interaction and focus return. Document dismissal policy and any focused headless dependency choice.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 02 — Implement Button](<task 02 - button.md>) must be complete.
- [Task 05 — Implement Surface / Card](<task 05 - surface.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test opening/closing, accessible dialog name, keyboard focus containment and restoration, Escape and dismissal policy. Demonstrate short and scrollable content at both sizes.
- Add or update the component's interactive examples in [/components](<task 00 - components showcase.md>), covering the variants and states in this task. Foundations must appear as specimens; the showcase task provides the initial screen itself.
- Include meaningful unit tests for the delivered public contract, semantics and interactions. No task is complete with screenshots alone, implementation-mirroring assertions or snapshots alone.
- Use `chrome-screenshots` for running catalogue evidence and `github-pr` for inline PR attachments. Inspect desktop (for example 1440 × 900) and mobile (for example 390 × 844); include a mobile capture whenever layout, wrapping, controls or interaction presentation differs, or explain why one image suffices. Include relevant focus/error/pending states and compare reference similarity, not just presence.
- Group each reusable component with its unit tests in src/lib/components/<component>. Keep page-specific specimens under src/app/components/<slug> and validate catalogue pages live rather than with unit tests; shared non-UI helpers belong in src/lib.
- Support Spanish labels, keyboard access, visible focus, readable contrast and narrow viewports. Keep generic UI free of authentication, persistence and clinic/calculation rules.

## Validation

Run the unit-test command established by Task 00 (once available), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build` for route, theme, font, dependency or production-build changes. Validate interactions in the running showcase as well as unit tests. Independently review code, behavior and visual evidence against [Alexandria](../../screens/alexandria/DESIGN.md), the [screen references](../../screens.md#visual-design-references), and applicable S01-S04 HTML/PNG files. Record command results and limitations, not assumed passes.

## Progress notes

Implemented a controlled native Dialog and interactive catalogue covering both sizes, short/scrollable content, initial focus and dismissal policy. Component tests and live Chrome focus, keyboard, background interaction and responsive checks are complete; detailed results and screenshots accompany the implementation PR. Independent review, human acceptance and manual merge remain pending. Status remains `in_progress`; the coordinator owns review and tracking updates under the [tracking rules](../readme.md#task-structure-and-status).

## Execution context

- Readiness: ready. Tasks 02 and 05 are done and available on the baseline.
- Workspace: isolated task16-dialog worktree to protect parallel assignments.
- Branch: `feature/shared-dialog`.
- Base: `origin/develop` at `01921946da4fd419e9e5d0016ce08cc360d82b48`, fetched before branch creation.
- References: architecture, requirements, screens/shared interaction rules, Alexandria, and S02/S03 HTML and PNG references. The exports guide appearance without extending this generic primitive into FormPanel or ConfirmDialog.
- Verified existing building blocks: Button, IconButton, Surface, semantic theme tokens, dedicated catalogue routes and Vitest/Testing Library. Package manager is pnpm 11.25.0; installed framework baseline is Next 16.4.3 and React 19.3.0.
- Implementation must read relevant installed Next.js guides before code changes. Select native modal behavior or a focused accessible headless dependency based on browser behavior and compatibility; document dismissal and focus policy in catalogue examples. Unit tests alone cannot establish native browser focus/inert behavior.
- Required validation: meaningful component unit tests, lint, typecheck, formatting, build; live desktop/mobile opening, closing, initial focus, containment, restoration, Escape, backdrop policy, scrollable content and reachable actions. Use chrome-screenshots and github-pr skills for evidence and verified inline PR attachments.
- Open product questions: none. Routine API and dismissal defaults remain scoped implementation choices.
- Hypotheses: none relied upon for readiness.
- Correction rounds used: 0 of 2.
- Human acceptance and manual merge remain pending after agent delivery.
