# Task 22 — Implement UserMenu

Status: `done`

## Objective

Implement UserMenu for the shared MyClinics visual system.

## Scope

Provide accessible account actions including caller-owned sign-out, using UserIdentity. Keep actions available on mobile and expose pending/failure feedback. Use an accessible disclosure/menu pattern with documented keyboard behavior; do not implement Google sign-in or session handling.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 03 — Implement IconButton](<task 03 - icon button.md>) must be complete.
- [Task 04 — Implement ActionLink](<task 04 - action link.md>) must be complete.
- [Task 16 — Implement Dialog](<task 16 - dialog.md>) must be complete.
- [Task 13 — Implement Alert / StatusMessage](<task 13 - alert.md>) must be complete.
- [Task 21 — Implement UserIdentity](<task 21 - user identity.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test opening, keyboard navigation/closing, sign-out callback, pending duplicate prevention, failure feedback and focus return. Show desktop and mobile account actions.
- Add or update the component's interactive examples in [/components](<task 00 - components showcase.md>), covering the variants and states in this task. Foundations must appear as specimens; the showcase task provides the initial screen itself.
- Include meaningful unit tests for the delivered public contract, semantics and interactions. No task is complete with screenshots alone, implementation-mirroring assertions or snapshots alone.
- Use `chrome-screenshots` for running catalogue evidence and `github-pr` for inline PR attachments. Inspect desktop (for example 1440 × 900) and mobile (for example 390 × 844); include a mobile capture whenever layout, wrapping, controls or interaction presentation differs, or explain why one image suffices. Include relevant focus/error/pending states and compare reference similarity, not just presence.
- Group each reusable component with its unit tests in src/lib/components/<component>. Keep page-specific specimens under src/app/components/<slug> and validate catalogue pages live rather than with unit tests; shared non-UI helpers belong in src/lib.
- Support Spanish labels, keyboard access, visible focus, readable contrast and narrow viewports. Keep generic UI free of authentication, persistence and clinic/calculation rules.

## Validation

Run the unit-test command established by Task 00 (once available), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build` for route, theme, font, dependency or production-build changes. Validate interactions in the running showcase as well as unit tests. Independently review code, behavior and visual evidence against [Alexandria](../../screens/alexandria/DESIGN.md), the [screen references](../../screens.md#visual-design-references), and applicable S01-S04 HTML/PNG files. Record command results and limitations, not assumed passes.

## Progress notes

Implementation, required checks and independent code, functional and visual review are complete. UserMenu and its interactive catalogue examples are ready for human acceptance in PR #31. Task and index are synchronized under the [tracking rules](../readme.md#task-structure-and-status); human approval and manual merge remain pending.

## Execution context

- Readiness: ready. Direct dependencies 03, 04, 13, 16 and 21 are done and present on the fetched integration baseline.
- Workspace: isolated task22-user-menu worktree to protect parallel assignments; only one writer operates here at a time.
- Branch: `feature/shared-user-menu`.
- Base: `origin/develop` at `698d0606436be23113918eef6b8d8a1838ab61aa`.
- References: project workflow, architecture, requirements, screens/shared interaction rules, Alexandria and applicable S02-S04 HTML/PNG account identity references. References guide appearance without adding authentication or production routes.
- Existing building blocks: IconButton, ActionLink, Dialog, Alert and UserIdentity; semantic theme tokens, dedicated catalogue routes and Vitest/Testing Library.
- Implementation must inspect relevant installed Next.js guides before code changes. Choose a focused accessible disclosure/menu API and document its keyboard behavior in the catalogue. Sign-out and its pending/failure state remain caller-owned, without session integration.
- Required validation: meaningful shared-component unit tests; pnpm test, lint, typecheck, format:check and build; independent live desktop/mobile keyboard, opening/closing, callback, duplicate prevention, failure and focus-return checks. Use chrome-screenshots for evidence and github-pr for verified inline attachments.
- Open product questions: none. Routine API and responsive presentation decisions remain within approved scope.
- Hypotheses: none relied upon for readiness.
- Correction rounds used: 0 of 2.
- Human acceptance and manual merge remain pending after agent delivery.

## Delivery and independent review

- Implementation PR: [#31](https://github.com/manromero/my-clinics/pull/31), targeting `develop`.
- Base: `698d0606436be23113918eef6b8d8a1838ab61aa`; implementation head independently reviewed: `abe5e7e022c7b9c38911df8158993d7fa6c9f8f7`.
- Delivered full/compact UserMenu using UserIdentity, optional caller-supplied account link, caller-owned sign-out/pending/failure feedback, accessible disclosure keyboard behavior, focus return, meaningful component tests and interactive Spanish catalogue examples. No authentication/session integration or business screens.
- Implementer and reviewer each passed `pnpm test` (24 files, 163 tests), `pnpm lint`, `pnpm typecheck`, `pnpm format:check` and `pnpm build` (27 static pages). Reviewer also checked task documentation links.
- Independent live Chrome review passed Enter/Space, Tab/Shift+Tab, Escape/explicit-close focus return, outside-pointer/Tab-out dismissal, callback, pending duplicate prevention, failure/retry and simulated success. Desktop 1440 x 900 and mobile 390 x 844 CSS pixels at DPR 1 passed visual comparison with Alexandria and S02-S04 HTML/PNG; both mobile variants retained actions without horizontal overflow and touch invoked sign-out.
- Six inline PR screenshots cover desktop focus/pending/error and mobile full/compact/error. Implementer retrieved exact matching PNGs; reviewer independently retrieved and visually inspected all six assets. Detailed source attribution, capture metadata and checks remain in the PR.
- Initial independent review: no blockers or optional findings. Correction rounds used: 0 of 2. Final tracking-only changes are included in the PR and receive an administrative recheck before delivery.
- Limitations: Chrome mobile/touch emulation retains desktop browser identity; no physical-device or screen-reader audit. GitHub page rendering was not separately inspected; saved inline image content was retrieved and verified. Real session behavior is outside scope.
- Human approval and manual merge remain pending. No merge performed by agents.
