# Task 14 — Implement LoadingState

Status: `in_progress`

## Objective

Implement LoadingState for the shared MyClinics visual system.

## Scope

Provide reusable loading feedback with visible text and an optional indicator/skeleton treatment. Support busy-region association and reduced motion without presenting fake progress percentages.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 01 — Define and implement the Alexandria visual foundations](<task 01 - visual foundations.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test announced loading text and busy semantics. Show compact and content-region examples and reduced-motion behavior.
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

- Readiness: ready. Task 01 is complete; approved scope and acceptance criteria remain unchanged.
- Branch: `feature/loading-state`; base: `f0a1452caa2d5f0299dbaa8597d1f496bcc8d4ce` (`origin/develop`, fetched at intake). Isolated managed worktree for parallel assignments; preserve all other checkouts.
- References: `docs/requirements.md`, `docs/architecture.md`, `docs/screens.md`, Alexandria DESIGN.md, and applicable S01-S04 HTML/PNG exports. Existing semantic tokens and catalogue composition govern implementation.
- Relevant files: new shared `src/lib/components/loading-state` component/tests; route-local `src/app/components/loading-state` examples; catalogue index registration in `src/app/components/page.tsx`.
- Verified: foundation dependency is done; current develop already provides a dedicated catalogue page per component, Vitest infrastructure, and shared Button. pnpm 11.25.0, Next 16.4.3, React 19.3.0 and Tailwind v4/PostCSS are selected. Read installed Next guides before code changes.
- Constraints: loading feedback only; visible Spanish text, announced status, explicit busy-region association, compact/content-region examples, reduced motion and optional decoration; no fake percentages or business screens. Do not implement later tasks or alter unrelated task status.
- Validation: meaningful component unit tests; pnpm test, lint, typecheck, format:check, build; live desktop/mobile interaction and visual review; verified inline GitHub screenshot attachments captured outside the repository. Existing gh CLI supports PR attachment upload through `gh pr edit --attach` (see Task 01 evidence).
- Native implementer and reviewer roles are available in this session; use separate agents and sequential handoffs. Only one checkout writer at a time.
- Open questions: none. Hypotheses: no product assumptions required; select a focused component API within approved scope.
- Correction rounds used: 0.
