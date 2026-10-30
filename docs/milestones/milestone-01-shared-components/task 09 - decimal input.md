# Task 09 — Implement DecimalInput

Status: `done`

## Objective

Implement DecimalInput for the shared MyClinics visual system.

## Scope

Provide a shared decimal-entry control for amounts and percentages, with optional euro/percent adornment. Preserve raw editing states, explicit zero and signed amounts; support Spanish decimal input and up to two decimal places. Configure range/sign restrictions per consumer rather than hardcoding clinic rules. Keep financial calculations and rounding out of the control.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 07 — Implement field primitives](<task 07 - form field.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test comma/decimal handling, zero, negatives, intermediate edits, precision errors and configured limits. Clearly define the public raw/parsed value contract and never silently round or coerce invalid input.
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

- Readiness: ready. Task 07 field primitives are complete in the fetched develop baseline; Task 08 TextInput is also merged and available for composition. Approved scope and criteria are unchanged.
- Branch: `feature/shared-decimal-input`; base: `016d34a81f92bb06faeabc6e368f919c41f4a6f5` (`origin/develop`). Dedicated managed worktree isolates parallel assignments.
- References: `docs/architecture.md`, `docs/requirements.md`, `docs/screens.md`, Alexandria, applicable S02/S03 HTML and PNG exports, and installed Next.js documentation before framework edits.
- Relevant files: `src/lib/components/text-input/`, field primitives, new `src/lib/components/decimal-input/`, route-local `src/app/components/decimal-input/`, catalogue index and semantic theme tokens.
- Verified findings: field primitives replace the old FormField wrapper. TextInput already owns accessible IDs, descriptions, labels and native text states. Reuse or compose existing controls when suitable. pnpm 11.25.0, Next 16.4.3 and React 19.3.0 are declared. Native implementer and reviewer roles are available in this session.
- Constraints: preserve raw editing strings, explicit zero and signed values; accept Spanish decimal input with at most two decimal places; report invalid input without silent rounding/coercion. Define a focused typed raw/parsed contract. Consumer-configured sign/range restrictions only; no financial calculations or business screens. Preserve unrelated files and task statuses; one writer in this worktree. English documentation and Spanish specimens.
- Validation: meaningful unit tests, lint, typecheck, formatting, production build, live desktop/mobile interactions, design comparison, and verified inline GitHub screenshot attachments. Capture temporarily outside the repository. Existing workflow history records `gh pr edit --attach` support. Use approved escalation when restricted Git/GitHub or new-worktree writes require it.
- Open questions: none. Hypotheses: no product assumptions required; routine public API details are implementer decisions within approved criteria.
- Correction rounds used: 0.

## Implementation and independent review

- Delivered in [PR #17](https://github.com/manromero/my-clinics/pull/17), targeting `develop`. Human acceptance and manual merge remain pending.
- Base reviewed: `016d34a81f92bb06faeabc6e368f919c41f4a6f5`; implementation head reviewed: `a82ea25b8516efb81ed98089be5792913873fb79`. Final tracking-only commit receives a separate administrative review recorded in the PR.
- DecimalInput composes TextInput, preserves the controlled raw string, and exposes discriminated empty/incomplete/invalid/valid results with an exact decimal string for valid values. Supports comma/dot, signed zero, negatives, two-place precision, exact inclusive consumer-configured bounds, optional euro/percent adornment and accessible native states. No rounding, financial calculations or business screens. Interactive Spanish specimens are at `/components/decimal-input`.
- Implementer and independent reviewer each passed `pnpm test` (82 tests / 11 files, including 31 DecimalInput cases), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `git diff --check`.
- Both personally checked live desktop (1440 x 900) and mobile (390 x 844) interactions and visuals against Alexandria and S02/S03 HTML/PNG. Verified intermediate edits, signed zero, comma/dot syntax, malformed input, exact limits, precision and range error recovery, keyboard/ref semantics, disabled/read-only states, description associations and catalogue navigation. No horizontal overflow or material visual gaps found.
- Four inline GitHub JPEG attachments with state, viewport, image dimensions, capturer and source commit metadata are preserved in the PR. Implementer, reviewer and coordinator verified authenticated retrieval (HTTP 200, image/jpeg). Reviewer independently viewed all images and compared the live result. Temporary captures/downloads were removed.
- Initial independent review: no blockers or optional findings. Correction rounds used: 0. No required check omitted. Consumers own error timing and required/empty/incomplete validation; the focused API is controlled-only. Human approval and manual merge remain pending.
