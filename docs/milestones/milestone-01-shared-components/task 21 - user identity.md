# Task 21 — Implement UserIdentity

Status: `done`

## Objective

Implement UserIdentity for the shared MyClinics visual system.

## Scope

Provide display name, optional email, avatar/fallback and optional timezone metadata in full and compact forms. Receive identity data through props; do not embed the reference person's account as configuration or connect authentication.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 01 — Define and implement the Alexandria visual foundations](<task 01 - visual foundations.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test supplied identity, missing avatar/email fallbacks and accessible names. Show long names/emails and compact mode.
- Add or update the component's interactive examples in [/components](<task 00 - components showcase.md>), covering the variants and states in this task. Foundations must appear as specimens; the showcase task provides the initial screen itself.
- Include meaningful unit tests for the delivered public contract, semantics and interactions. No task is complete with screenshots alone, implementation-mirroring assertions or snapshots alone.
- Use `chrome-screenshots` for running catalogue evidence and `github-pr` for inline PR attachments. Inspect desktop (for example 1440 × 900) and mobile (for example 390 × 844); include a mobile capture whenever layout, wrapping, controls or interaction presentation differs, or explain why one image suffices. Include relevant focus/error/pending states and compare reference similarity, not just presence.
- Group each reusable component with its unit tests in src/lib/components/<component>. Keep page-specific specimens under src/app/components/<slug> and validate catalogue pages live rather than with unit tests; shared non-UI helpers belong in src/lib.
- Support Spanish labels, keyboard access, visible focus, readable contrast and narrow viewports. Keep generic UI free of authentication, persistence and clinic/calculation rules.

## Validation

Run the unit-test command established by Task 00 (once available), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build` for route, theme, font, dependency or production-build changes. Validate interactions in the running showcase as well as unit tests. Independently review code, behavior and visual evidence against [Alexandria](../../screens/alexandria/DESIGN.md), the [screen references](../../screens.md#visual-design-references), and applicable S01-S04 HTML/PNG files. Record command results and limitations, not assumed passes.

## Progress notes

Implementation and independent review are complete. Task and milestone index are done; human approval and manual merge remain pending in the implementation PR.

## Execution context

- Readiness: ready. Task 01 is done; approved scope and acceptance criteria are unchanged.
- Branch: `feature/user-identity`; base: `7d2a4b950142445158e197b74b4d5fbe75fc75f1` (`origin/develop`, fetched at intake). Dedicated worktree isolates concurrent assignments.
- References: `docs/requirements.md`, `docs/architecture.md`, `docs/screens.md`, `docs/screens/alexandria/DESIGN.md`, S02-S04 HTML/PNG header identities; S05 has no export.
- Relevant files: `src/lib/components/user-identity`, route-local `src/app/components/user-identity`, catalogue index `src/app/components/page.tsx`, and existing semantic tokens in `src/app/globals.css`.
- Verified: existing catalogue uses dedicated component pages and route-local specimens. pnpm 11.25.0, Next 16.4.3, React 19.3.0 and Tailwind v4 are established. Displayed reference identity is sample content only.
- Constraints: props-driven identity presentation only; full and compact forms, optional email/timezone and avatar fallback. No authentication, user menu, production header or dependent tasks. English documentation and Spanish UI. Preserve other worktrees and avoid shared development ports.
- Validation: meaningful component unit tests; lint, typecheck, format:check and build; live catalogue interactions, desktop/mobile captures and reference comparison using chrome-screenshots; PR inline evidence using github-pr. Read applicable installed Next guides before code changes.
- Native implementer and reviewer roles are available in the active session. Sequential handoffs with one writer in this worktree.
- Open questions: none. Hypotheses: none required for intake; routine presentation/API choices remain with the implementer.
- Correction rounds used: 0.

## Implementation and independent review

- Implementation PR: [#30](https://github.com/manromero/my-clinics/pull/30), targeting `develop`. Human approval and manual merge are pending.
- Reviewed base: `7d2a4b950142445158e197b74b4d5fbe75fc75f1`; implementation head: `40b7099863a441759cc920073bb33daee04c85e9`.
- Delivered props-driven full/compact UserIdentity, optional email/timezone, avatar initials fallback and failed-image recovery, accessible identity metadata, long-text wrapping, seven focused component tests and interactive Spanish catalogue examples.
- Implementer and independent reviewer each passed `pnpm test` (23 files, 157 tests), `pnpm lint`, `pnpm typecheck`, `pnpm format:check` and `pnpm build`.
- Both verified live desktop 1440 x 900 and narrow 390 x 844 at DPR 1, including keyboard/focus, optional metadata, compact mode, avatar failure/recovery and no horizontal overflow. Reviewer independently compared captured output with Alexandria and S02-S04 HTML/PNG references; no scoped visual gaps were found.
- Four inline PR screenshots include default, focus/fallback, long narrow content and compact narrow presentation. Saved assets were independently retrieved as HTTP 200 PNGs with matching dimensions; the implementer also verified byte equality and rendered GitHub images. Detailed metadata and evidence remain in the PR.
- Initial independent review: no blockers or optional suggestions. Correction rounds used: 0. Final tracking-only commit is included in the same PR and receives an administrative recheck before delivery.
- Limitations: narrow desktop metrics were used without touch emulation; no screen-reader session was performed. These are disclosed in the PR; semantic and live accessibility checks passed.
