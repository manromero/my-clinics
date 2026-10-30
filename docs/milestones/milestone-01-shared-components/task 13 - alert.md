# Task 13 — Implement Alert / StatusMessage

Status: `done`

## Objective

Implement Alert / StatusMessage for the shared MyClinics visual system.

## Scope

Provide information, success, warning and error messages with optional retry/action. Use appropriate status/alert announcement semantics without repeatedly interrupting users for static explanatory text.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 02 — Implement Button](<task 02 - button.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test message naming/content, announcement roles and retry callback. Show inline help, operation failure and success examples.
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

- Readiness: ready; Tasks 00, 01 and 02 are complete on updated origin/develop.
- Branch: `feature/shared-alert`; base: `9e32bcd3e15374b8c7560a8a87815db8f3acfcf1`. Dedicated managed worktree isolates parallel assignments.
- Scope: reusable Alert / StatusMessage only, four tones, optional action/retry, deliberate announcement semantics, and route-local interactive examples. Preserve approved criteria and exclusions.
- References: requirements, architecture, screens, Alexandria DESIGN.md and applicable S01-S04 HTML/PNG; S01 includes status/error containers. Inspect reference images before visual implementation.
- Verified context: existing Button supports native keyboard behavior, disabled/pending and secondary/tertiary variants. Theme already provides error, warning and success colors; catalogue has dedicated component routes and a route-local registration contract.
- Relevant files: src/lib/components/button/button.tsx, src/app/globals.css, src/app/components/catalogue.tsx, src/app/components/page.tsx, and new alert component/specimen folders.
- Technical choices: distinguish static explanatory text from live status/alert announcements; severity alone must not force interruption. Keep API focused and demonstrate supported semantics. Read relevant installed Next.js guides before writing framework code.
- Validation: pnpm test, lint, typecheck, format:check and build; live desktop/mobile interactions and reference comparison. Capture outside the repository and upload verified inline GitHub PR attachments. Existing project delivery used gh pr edit --attach.
- Native implementer/reviewer roles are exposed in the active session. Sequential delegation and one writer per assignment checkout; other tasks may modify separate worktrees.
- Open questions: none. Hypotheses: none required. Correction rounds used: 0.

## Implementation and independent review

- Implementation PR: [#21](https://github.com/manromero/my-clinics/pull/21), targeting develop. Human acceptance and manual merge pending.
- Base: `9e32bcd3e15374b8c7560a8a87815db8f3acfcf1`; independently reviewed application head: `627b92b1d26b83db7eb47d8f0b4385b742c36d33`.
- Delivered four Alert tones, static default semantics, explicit persistent live announcements, optional action/retry, Spanish interactive specimens and catalogue registration.
- Implementer and separate native reviewer each passed pnpm test (15 files, 106 tests), lint, typecheck, format:check and build. Both exercised keyboard failure/retry/success and navigation live at desktop 1440 x 900 and mobile 390 x 844; no overflow, clipping or focus defects observed.
- Independent code, functional and visual review against Alexandria and applicable S01-S04 references: no blockers or optional findings. Correction rounds used: 0.
- Five inline GitHub attachments in the PR were independently retrieved and compared with live rendering by the reviewer; coordinator verified saved inline URLs and successful image retrieval. Detailed viewport, export dimensions, capture attribution, contrast and checks remain in the PR.
- Limitations: no screen-reader audio session; announcement behavior verified through code, tests and live DOM/accessibility inspection. S01 PNG is cropped; its HTML provides the error-state reference.
- Final administrative tracking review is recorded in the PR. Task/index done means ready for human acceptance; no merge performed.
