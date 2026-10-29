# Task 02 — Implement Button

Status: `done`

## Objective

Implement Button for the shared MyClinics visual system.

## Scope

Provide primary gradient, secondary tonal, tertiary and destructive actions; supported sizes, optional icons, disabled and pending states. Preserve native button semantics, safe default type and visible keyboard focus; prevent activation while disabled or pending.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 01 — Define and implement the Alexandria visual foundations](<task 01 - visual foundations.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test click and keyboard activation, disabled/pending behavior, accessible names and explicit form submission behavior. Show every variant and an interactive pending example.
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

- Readiness: ready; Tasks 00 and 01 are done and merged into develop.
- Branch: `feature/shared-button`; base: `964974991f218371541dc52492d3ba00d4efb845` (updated origin/develop). Dedicated worktree isolates parallel assignments.
- References: architecture, requirements, screens, Alexandria DESIGN.md, S01-S04 HTML/PNG, and Task 01 visual-system documentation and tokens.
- Relevant files: shared Button under src/lib/components; route-local catalogue under src/app/components; existing Vitest setup. Preserve the established foundation API.
- Constraints: Button only; no dependent controls or production screens. Spanish UI, English documentation; read installed Next.js guides before framework changes.
- Validation: pnpm test, lint, typecheck, format:check, build; live desktop/mobile interactions and visual comparison; temporary screenshots outside the repository and verified inline GitHub PR attachments. The previous task used gh pr edit --attach successfully.
- Native implementer and reviewer roles are available in this session; sequential handoffs and one writer per checkout.
- Open questions: none. Hypotheses: none required. Correction rounds used: 0.

## Implementation and independent review

- Implementation PR: [#9](https://github.com/manromero/my-clinics/pull/9). Human acceptance and manual merge pending.
- Base: `964974991f218371541dc52492d3ba00d4efb845`; independently reviewed application head: `03b9929003e856fc73cfd73ddebdc1f811956d5e`.
- Delivered four Button variants, three sizes, decorative icons, safe native semantics, disabled/pending states, documented API and interactive catalogue specimens.
- Implementer and separate reviewer each passed pnpm test (13 tests, four files), lint, typecheck, format:check and build. Both exercised desktop 1440 x 900 and mobile 390 x 844 keyboard/click/pending behavior, focus and wrapping against Alexandria and S01-S04 references.
- Five inline GitHub screenshots are preserved in the PR. Implementer captured them; reviewer independently compared all images with live rendering and retrieved every attachment successfully. Coordinator verified the saved inline PR body. Detailed checks and capture metadata remain in the PR.
- Independent initial review: no blockers or optional findings. Correction rounds used: 0. Final administrative tracking review is recorded in the PR.
- Limitation: live reduced-motion emulation unavailable; relevant CSS inspected without claiming live verification.
