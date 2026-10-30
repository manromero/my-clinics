# Task 12 — Implement SegmentedControl

Status: `in_progress`

## Objective

Implement SegmentedControl for the shared MyClinics visual system.

## Scope

Provide a labeled exclusive selection group with visible selection, keyboard interaction and disabled options. Use radio-group semantics for form choices; do not repurpose it as route navigation or content tabs.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 01 — Define and implement the Alexandria visual foundations](<task 01 - visual foundations.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test exclusive selection, arrow/keyboard behavior, disabled options and accessible group name. Show active/inactive and percentage/direct presentation with no persistence.
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

- Readiness: ready; Task 01 foundations are available in the updated remote develop baseline. Approved scope and acceptance criteria above remain unchanged.
- Workspace: isolated worktree for Task 12; other concurrent assignments must remain untouched.
- Branch: `feature/shared-segmented-control`.
- Base: `68a0d4171ae2f140f0d56da27f2c8e61af08aa29` (`origin/develop`).
- Relevant sources: `docs/architecture.md`, `docs/components-catalogue.md`, `docs/visual-foundations.md`, `docs/screens.md`, Alexandria guidance, S02 clinic and S03 activity HTML/PNG references. S03 contains the percentage/direct segmented presentation.
- Verified context: Next.js 16.4.3, React 19.3.0, pnpm 11.25.0, Vitest and Testing Library are established. Dedicated catalogue pages and semantic theme tokens already exist. Read installed Next.js guides before editing.
- Constraints: generic exclusive form choices with radio semantics; Spanish examples for active/inactive and percentage/direct; no navigation/tabs, domain logic or persistence. Keep component tests colocated and validate specimens live.
- Validation: meaningful unit tests, lint, typecheck, format check, build, desktop/mobile live interaction and visual inspection against supplied references. Delivery captures must be temporary outside the repository and attached inline to the PR with verified retrieval.
- Parallel execution: use this worktree, a dedicated server port and dedicated temporary evidence paths; preserve other checkouts and browser sessions. Shared catalogue index/documentation changes may need conflict resolution during later integration.
- Open product questions: none. Hypotheses: none required for intake.
- Correction rounds used: 0 of 2.
- Human approval and manual merge remain pending after agent delivery.

## Implementation and validation

- Implementer delivered the shared native-radio SegmentedControl, colocated behavioral tests, a dedicated Spanish interactive catalogue page and catalogue index entry.
- Automated validation reported by implementer: `pnpm test` passed (14 files, 96 tests), `pnpm lint`, `pnpm typecheck`, `pnpm format:check` and `pnpm build` passed. Build generated the segmented-control catalogue route.
- Infrastructure: the original external worktree required inaccessible subagent approvals. It was relocated with authorization inside the writable workspace under an ignored local tools directory; dependencies were reinstalled successfully. This is a local execution arrangement, not a product change.
- Blocking validation: live desktop/mobile interactions, visual review and verified inline GitHub screenshot attachments remain unperformed. Primary-thread Computer Use explicitly returned "Computer Use was not approved to use Google Chrome". No further UI access was attempted after that denial.
- Delivery must remain a draft PR and task/index `in_progress` until required browser validation and evidence are complete. Independent review is pending. Correction rounds used: 0 of 2.
