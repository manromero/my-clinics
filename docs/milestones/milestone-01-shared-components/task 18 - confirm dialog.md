# Task 18 — Implement ConfirmDialog

Status: `in_progress`

## Objective

Implement ConfirmDialog for the shared MyClinics visual system.

## Scope

Compose Dialog for confirmation with descriptive content, cancel/confirm actions and destructive/pending variants. Support caller-owned failure feedback and prevent duplicate confirmation. Default destructive flows to safe initial focus; keep operation-specific record details with callers.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 16 — Implement Dialog](<task 16 - dialog.md>) must be complete.
- [Task 13 — Implement Alert / StatusMessage](<task 13 - alert.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test cancel, confirm, pending prevention, rejection feedback and focus restoration. Show a synthetic deletion example identifying the affected item.
- Add or update the component's interactive examples in [/components](<task 00 - components showcase.md>), covering the variants and states in this task. Foundations must appear as specimens; the showcase task provides the initial screen itself.
- Include meaningful unit tests for the delivered public contract, semantics and interactions. No task is complete with screenshots alone, implementation-mirroring assertions or snapshots alone.
- Use `chrome-screenshots` for running catalogue evidence and `github-pr` for inline PR attachments. Inspect desktop (for example 1440 × 900) and mobile (for example 390 × 844); include a mobile capture whenever layout, wrapping, controls or interaction presentation differs, or explain why one image suffices. Include relevant focus/error/pending states and compare reference similarity, not just presence.
- Group each reusable component with its unit tests in src/lib/components/<component>. Keep page-specific specimens under src/app/components/<slug> and validate catalogue pages live rather than with unit tests; shared non-UI helpers belong in src/lib.
- Support Spanish labels, keyboard access, visible focus, readable contrast and narrow viewports. Keep generic UI free of authentication, persistence and clinic/calculation rules.

## Validation

Run the unit-test command established by Task 00 (once available), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build` for route, theme, font, dependency or production-build changes. Validate interactions in the running showcase as well as unit tests. Independently review code, behavior and visual evidence against [Alexandria](../../screens/alexandria/DESIGN.md), the [screen references](../../screens.md#visual-design-references), and applicable S01-S04 HTML/PNG files. Record command results and limitations, not assumed passes.

## Progress notes

Implementation started in an isolated managed worktree to protect parallel assignments. Required validation, independent review and PR delivery are pending.

## Execution context

- Readiness: ready. Tasks 16 (Dialog) and 13 (Alert) are done and merged on the baseline; PR #26 also fixes Dialog initial focus and is included.
- Branch: `feature/shared-confirm-dialog`; base: `48bae0d3ed78d14187da82d9eef27796b1575423` from freshly fetched `origin/develop`.
- Workspace: dedicated managed task18-confirm-dialog worktree; do not edit the primary checkout or other assignment worktrees.
- Approved scope: compose Dialog for generic confirmation, destructive and pending variants, caller-owned failure feedback, safe destructive initial focus and duplicate confirmation prevention. Synthetic record details stay in route-local specimens. No production domain behavior.
- Sources: requirements, architecture, screens/shared interaction rules and S03 deletion flow, Alexandria DESIGN.md and applicable S02/S03 HTML/PNG exports. Compare actual references; exports do not expand product scope.
- Verified building blocks: controlled native Dialog with initialFocusRef, dismissible policy and focus return; Button with destructive/pending behavior; Alert with explicit announcement semantics; dedicated catalogue registration and FormPanel composition pattern.
- Relevant files: src/lib/components/dialog, button, alert and form-panel; src/app/components catalogue and route-local specimens; src/app/globals.css.
- Framework baseline: Next 16.4.3, React 19.3.0, pnpm 11.25.0. Read relevant installed Next guides before code changes. Reuse existing primitives and theme.
- Required validation: meaningful component tests (cancel/confirm, pending duplicate prevention, rejection feedback, focus restoration), pnpm test, lint, typecheck, format:check and build; live keyboard, desktop/mobile and pending/error checks. Use chrome-screenshots and github-pr skills for inspected and verified permanent inline evidence.
- Native implementer and reviewer roles are available in this session; handoffs are sequential, with one writer in this checkout.
- Open product questions: none. Hypotheses: none required.
- Correction rounds used: 0 of 2.
- Human approval and manual merge remain pending after agent delivery.
