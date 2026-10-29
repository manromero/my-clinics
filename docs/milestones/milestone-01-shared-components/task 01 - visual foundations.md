# Task 01 — Define and implement the Alexandria visual foundations

Status: `in_progress`

## Objective

Define and implement the Alexandria visual foundations for the shared MyClinics visual system.

## Scope

Use the existing Tailwind CSS v4/PostCSS setup. Define semantic theme tokens in src/app/globals.css with @theme for utility-generating colors, typography, spacing, radii, shadows and motion; use ordinary CSS variables for values that do not need utilities. Use @theme inline only when mapping runtime font variables. Establish Noto Serif headings, Inter body and Public Sans labels, with fallbacks and a documented font-loading strategy. Establish primary #094cb2, primary-container #3366cc, tertiary #6d5e00, tonal surfaces and accessible status/focus treatments. Document concrete scales, responsive conventions, reduced motion and the limited ghost-border exceptions. Unify export inconsistencies using Alexandria; keep the current light appearance and do not introduce a dark theme.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 00 — Create the /components screen and unit-test infrastructure](<task 00 - components showcase.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Add catalogue specimens for all token groups, typography hierarchy, tonal layering, spacing/radii, focus and motion. Add meaningful unit tests for specimen semantics, token-to-example registration and any theme helpers; do not rely on snapshots or CSS-string assertions as proof of visual correctness. Verify actual font loading, focus visibility and contrast through rendered inspection. Record the styling/library decision and rationale.
- Add or update the component's interactive examples in [/components](<task 00 - components showcase.md>), covering the variants and states in this task. Foundations must appear as specimens; the showcase task provides the initial screen itself.
- Include meaningful unit tests for the delivered public contract, semantics and interactions. No task is complete with screenshots alone, implementation-mirroring assertions or snapshots alone.
- Capture graphical evidence from the running /components screen at desktop (for example 1440 x 900) and inspect mobile (for example 390 x 844). Include a mobile capture whenever layout, wrapping, controls or interaction presentation differs; if one capture suffices, explicitly record mobile inspection and why no separate image is needed. Label actual viewport, component/state, capturer and source commit. Capture focus/error/pending states when relevant.
- Display evidence inline in the implementation PR using verified GitHub attachments, following the [workflow evidence contract](../../development-workflow.md#visual-pr-evidence). Refresh affected captures after corrections. Check references for similarity, not just presence.
- Keep all reusable components directly in src/lib/components, without subfolders. Route-only showcase scaffolding stays under src/app/components; shared non-UI helpers belong in src/lib.
- Support Spanish labels, keyboard access, visible focus, readable contrast and narrow viewports. Keep generic UI free of authentication, persistence and clinic/calculation rules.

## Validation

Run the unit-test command established by Task 00 (once available), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build` for route, theme, font, dependency or production-build changes. Validate interactions in the running showcase as well as unit tests. Independently review code, behavior and visual evidence against [Alexandria](../../screens/alexandria/DESIGN.md), the [screen references](../../screens.md#visual-design-references), and applicable S01-S04 HTML/PNG files. Record command results and limitations, not assumed passes.

## Progress notes

Definition proposed in the Milestone 01 planning PR; implementation has not started. Human approval is pending merge. At execution, record branch/base, readiness, scoped references, tests, screenshots, review findings, correction rounds and implementation PR. Update this status and the milestone index together under the [tracking rules](../readme.md#task-structure-and-status).

## Execution context

- Readiness: ready. Task 00 is done and merged; approved scope and criteria remain unchanged.
- Branch: `feature/alexandria-foundations`; base: `d48578cb16573674dede7261368261b0390133d6` (`origin/develop`). Isolated worktree for parallel assignments.
- References: `docs/architecture.md`, `docs/requirements.md`, `docs/screens.md`, Alexandria DESIGN.md and S01-S04 HTML/PNG exports.
- Relevant implementation: `src/app/globals.css`, root layout and route-local `src/app/components` catalogue; existing Vitest infrastructure from Task 00.
- Verified: pnpm 11.25.0, Next 16.4.3, React 19.3.0 and Tailwind v4/PostCSS already selected. Read installed Next guides before framework edits.
- Constraints: foundations only; no dependent controls or production screens. English documentation, Spanish UI; light appearance; preserve parallel work in other checkouts.
- Validation: unit tests, lint, typecheck, formatting, build, rendered desktop/mobile inspection including fonts, contrast, focus and reduced motion; verified inline PR attachments.
- Open questions: none at intake. Hypotheses: none required.
- Native implementer/reviewer roles available in this session. Sequential implementation and independent review.
- Correction rounds used: 0.

## Implementation and independent review

- Implementation PR: [#8](https://github.com/manromero/my-clinics/pull/8), draft; approval and manual merge pending.
- Reviewed base: `d48578cb16573674dede7261368261b0390133d6`; implementation head: `9e2ac1a4bdf197c364ea3b93a294ecbc5a7e3df9`.
- Delivered semantic theme, self-hosted Noto Serif/Inter/Public Sans, six foundation specimen groups, keyboard motion replay and documented visual API.
- Implementer and independent reviewer each passed `pnpm test` (6 tests), `pnpm lint`, `pnpm typecheck`, `pnpm format:check` and `pnpm build`. Both inspected desktop 1440 x 900 and mobile 390 x 844: fonts load, keyboard focus/replay works and there is no horizontal overflow. Status contrast passes. Detailed evidence is recorded in the PR.
- Initial independent review found no product defects or optional suggestions. R01 remains open: required inline GitHub screenshot attachments are missing because the available browser is signed out. Temporary captures are preserved outside the repository; the PR remains draft and task/index remain `in_progress`.
- Reduced-motion CSS was independently inspected; live preference emulation is unavailable and is recorded as a validation limitation.
- Correction rounds used: 0. Attachment access is an infrastructure blocker; user login or an explicit evidence-contract decision is required to complete delivery.
