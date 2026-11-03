# Task 17 — Implement FormPanel

Status: `in_progress`

## Objective

Implement FormPanel for the shared MyClinics visual system.

## Scope

Compose a reusable form presentation with title/description, content and save/cancel actions. Support modal and in-page panel presentation where useful for S02/S03, without losing entered values on save failure. Keep actual form data, validation rules and persistence with the caller.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 16 — Implement Dialog](<task 16 - dialog.md>) must be complete.
- [Task 07 — Implement field primitives](<task 07 - form field.md>) must be complete.
- [Task 13 — Implement Alert / StatusMessage](<task 13 - alert.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test submit/cancel callbacks, pending duplicate prevention, error display, retained caller-owned values and modal focus behavior. Show successful and failed save simulations.
- Add or update the component's interactive examples in [/components](<task 00 - components showcase.md>), covering the variants and states in this task. Foundations must appear as specimens; the showcase task provides the initial screen itself.
- Include meaningful unit tests for the delivered public contract, semantics and interactions. No task is complete with screenshots alone, implementation-mirroring assertions or snapshots alone.
- Use `chrome-screenshots` for running catalogue evidence and `github-pr` for inline PR attachments. Inspect desktop (for example 1440 × 900) and mobile (for example 390 × 844); include a mobile capture whenever layout, wrapping, controls or interaction presentation differs, or explain why one image suffices. Include relevant focus/error/pending states and compare reference similarity, not just presence.
- Group each reusable component with its unit tests in src/lib/components/<component>. Keep page-specific specimens under src/app/components/<slug> and validate catalogue pages live rather than with unit tests; shared non-UI helpers belong in src/lib.
- Support Spanish labels, keyboard access, visible focus, readable contrast and narrow viewports. Keep generic UI free of authentication, persistence and clinic/calculation rules.

## Validation

Run the unit-test command established by Task 00 (once available), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build` for route, theme, font, dependency or production-build changes. Validate interactions in the running showcase as well as unit tests. Independently review code, behavior and visual evidence against [Alexandria](../../screens/alexandria/DESIGN.md), the [screen references](../../screens.md#visual-design-references), and applicable S01-S04 HTML/PNG files. Record command results and limitations, not assumed passes.

## Progress notes

Implementation started in an isolated worktree to preserve parallel assignments. Human acceptance and manual merge remain pending.

## Execution context

- Readiness: ready. Tasks 16, 07 and 13 are done and available on the fetched baseline; Dialog was integrated through PR #24.
- Branch: `feature/shared-form-panel`; base: `origin/develop` at `2968b2b9385c9bd0d73a8a872eca7554c0c08c55`.
- Workspace: isolated task17-form-panel worktree; preserve other task worktrees and keep one writer at a time here.
- References: requirements, architecture, screens/shared interaction rules, Alexandria, and S02/S03 HTML and PNG exports. Reference content does not add domain behavior.
- Verified building blocks: controlled native Dialog with actions and initial focus, Button with pending support, Alert with explicit announcements, field primitives and controlled inputs; dedicated catalogue routes and Vitest/Testing Library are established.
- Keep caller ownership of values, validation and persistence. Compose panel/modal presentation without nested forms; verify keyboard submit, duplicate prevention, error/retry value retention, cancellation, initial focus and restoration. Routine public API and pending dismissal choices remain within scope and must be demonstrated.
- Read relevant installed Next.js guides before code changes. Use pnpm 11.25.0 and existing semantic theme tokens.
- Required validation: meaningful shared-component unit tests, pnpm test, lint, typecheck, format:check and build; live desktop/mobile success, failure/retry, pending, cancel and modal keyboard behavior. Use chrome-screenshots and github-pr for inspected screenshots and verified inline PR attachments.
- Open product questions: none. Hypotheses: none relied upon for readiness.
- Correction rounds used: 0 of 2.
