# Task 25 — Implement AppHeader

Status: `done`

## Objective

Implement AppHeader for the shared MyClinics visual system.

## Scope

Compose Brand, MainNavigation and account controls with public and signed-in presentations. Match the reference height, spacing and tonal treatment while keeping navigation, identity and sign-out accessible at narrow widths. Accept identity/action props; do not authorize routes or fetch sessions.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 19 — Implement Brand](<task 19 - brand.md>) must be complete.
- [Task 20 — Implement MainNavigation](<task 20 - main navigation.md>) must be complete.
- [Task 21 — Implement UserIdentity](<task 21 - user identity.md>) must be complete.
- [Task 22 — Implement UserMenu](<task 22 - user menu.md>) must be complete.
- [Task 23 — Implement PageContainer](<task 23 - page container.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test public/private composition, active navigation, mobile reachability of actions and supplied sign-out behavior. Show both presentations at desktop and mobile sizes.
- Add or update the component's interactive examples in [/components](<task 00 - components showcase.md>), covering the variants and states in this task. Foundations must appear as specimens; the showcase task provides the initial screen itself.
- Include meaningful unit tests for the delivered public contract, semantics and interactions. No task is complete with screenshots alone, implementation-mirroring assertions or snapshots alone.
- Use `chrome-screenshots` for running catalogue evidence and `github-pr` for inline PR attachments. Inspect desktop (for example 1440 × 900) and mobile (for example 390 × 844); include a mobile capture whenever layout, wrapping, controls or interaction presentation differs, or explain why one image suffices. Include relevant focus/error/pending states and compare reference similarity, not just presence.
- Group each reusable component with its unit tests in src/lib/components/<component>. Keep page-specific specimens under src/app/components/<slug> and validate catalogue pages live rather than with unit tests; shared non-UI helpers belong in src/lib.
- Support Spanish labels, keyboard access, visible focus, readable contrast and narrow viewports. Keep generic UI free of authentication, persistence and clinic/calculation rules.

## Validation

Run the unit-test command established by Task 00 (once available), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build` for route, theme, font, dependency or production-build changes. Validate interactions in the running showcase as well as unit tests. Independently review code, behavior and visual evidence against [Alexandria](../../screens/alexandria/DESIGN.md), the [screen references](../../screens.md#visual-design-references), and applicable S01-S04 HTML/PNG files. Record command results and limitations, not assumed passes.

## Execution context

- Readiness: Tasks 19–23 are marked done on the integration base and their shared components are present. The Task 00 catalogue and Vitest scripts are available.
- Branch: `feature/app-header` from `develop` at `7476740df79bab37215716727fc6bc3eda14162e`. Use the isolated task worktree for parallel milestone work.
- Reuse the existing `Brand`, `MainNavigation`, `UserMenu` (which renders `UserIdentity`), and `PageContainer`. `UserMenu` already supports supplied sign-out, pending/error feedback, and keyboard dismissal. `MainNavigation` accepts the active destination and wraps its links.
- Keep the interactive specimen in `src/app/components/app-header` and register it in the existing catalogue. Compare the public presentation with S01 and the signed-in presentation with S02–S04 and Alexandria.
- Verify active navigation, account focus and dismissal, and supplied sign-out behavior live at desktop and narrow widths. Inspect the account menu for clipping or horizontal overflow when open. Record unit tests, lint, typecheck, format, production build and inline Chrome evidence in the PR.
- Layout hypothesis to verify live: keep brand and account together on narrow widths and allow navigation to wrap underneath. No unresolved product questions.
- Correction rounds used: 0.

## Progress notes

- Delivered public and signed-in AppHeader presentations and an interactive specimen at `/components/app-header`. Sign-out behavior and account state come from the caller.
- Implementation and independent review passed `pnpm test` (182 tests across 27 files), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build` on implementation commit `6415711b49d0ee11e4365c5e898f17f46f752f22`.
- Independent Chrome review at 1440 × 900 and 390 × 844 confirmed both presentations, active navigation, keyboard focus and dismissal, and sign-out pending, failure, and retry. Additional width checks covered 320 and 1024 CSS pixels. The narrow checks used CSS viewport overrides. The PR contains the captured desktop and mobile states and comparison with Alexandria and S01–S04.
- No blocking or optional findings. Correction rounds used: 0. Human approval and manual merge are pending in [PR #34](https://github.com/manromero/my-clinics/pull/34).
