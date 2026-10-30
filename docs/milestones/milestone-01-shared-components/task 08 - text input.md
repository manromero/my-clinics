# Task 08 — Implement TextInput

Status: `done`

## Objective

Implement TextInput for the shared MyClinics visual system.

## Scope

Provide a native text input composed from the field primitives, owning stable/generated control IDs, label/description associations and required/invalid state, value/defaultValue and standard events, placeholder, disabled, read-only and invalid states. Support optional decorative leading/trailing adornments without replacing labels.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 07 — Implement field primitives](<task 07 - form field.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test typing, change/blur events, label/description association, disabled and read-only behavior. Show long values and error recovery.
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

- Readiness: ready. Task 07 field primitives are complete and merged in the fetched develop baseline. Approved scope and acceptance criteria remain unchanged.
- Branch: `feature/shared-text-input`; base: `669c8b34754fce76b10c14ba3f602422327ac21d` (`origin/develop`). A dedicated managed worktree isolates this assignment from parallel tasks.
- References: `docs/architecture.md`, `docs/requirements.md`, `docs/screens.md`, Alexandria, applicable S02/S03 HTML and PNG exports, and installed Next.js documentation before framework edits.
- Relevant files: shared field primitives; new `src/lib/components/text-input/`; route-local `src/app/components/text-input/`; catalogue index and semantic theme tokens.
- Verified findings: Task 07 replaced the FormField wrapper with FieldLabel, FieldRequirement, FieldHelp and FieldError. TextInput composes these primitives and owns stable/generated IDs, native required state, descriptions and invalid state. pnpm 11.25.0, Next 16.4.3 and React 19.3.0 are declared. Native implementer/reviewer roles are available in this session.
- Constraints: only TextInput and its catalogue examples/tests; preserve unrelated work and other task statuses; one writer in this worktree; English documentation and Spanish examples. Do not implement dependent controls or business behavior.
- Validation: meaningful unit tests, lint, typecheck, format check, production build, live desktop/mobile interaction and design inspection, verified inline GitHub screenshot attachments. Capture outside the repository and retain evidence metadata in the PR. GitHub access must be rechecked outside restricted execution before treating the initial authentication failure as conclusive.
- Open questions: none. Hypotheses: no product assumptions required.
- Correction rounds used: 0.

## Implementation and independent review

- Delivered in [PR #16](https://github.com/manromero/my-clinics/pull/16), targeting `develop`. Human acceptance and manual merge remain pending.
- Base reviewed: `669c8b34754fce76b10c14ba3f602422327ac21d`; implementation head reviewed: `ce05ee25b00ad36893caeb94c72f5e99e04952af`. The final tracking-only commit receives a separate administrative review recorded in the PR.
- TextInput composes the field primitives, forwards native text props/events/ref and controlled/uncontrolled values, owns stable/generated IDs and accessible label/descriptions/required/invalid state, and supports inert decorative adornments. Route-local Spanish specimens at `/components/text-input` cover editing, errors and recovery, focus, long values, disabled and read-only controls.
- Implementer and independent reviewer each passed `pnpm test` (51 tests / 10 files), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and diff checks. Reviewer verified 44 local documentation links/anchors.
- Both independently checked live desktop (1440 x 900) and mobile (390 x 844) behavior and visuals against Alexandria and S02/S03 HTML/PNG references. Label/ref focus, typing, change/blur, error recovery and description cleanup, keyboard navigation, disabled/read-only behavior and long-value internal scrolling passed without horizontal page overflow. Reviewer observed no browser warnings/errors.
- Four inline GitHub JPEG attachments and detailed viewport, image dimensions, source commit and capturer metadata are preserved in the PR. Implementer, reviewer and coordinator verified authenticated retrieval (HTTP 200, image/jpeg). Temporary captures/downloads were removed after verification.
- Independent review: no blockers or optional findings. Correction rounds used: 0. No required check was omitted. Automated screen-reader announcement testing was not performed; browser semantics and keyboard interactions were verified.
- Infrastructure: restricted Git/GitHub operations required approved escalation. Reviewer attachment retrieval via Python failed after redirect; authenticated PowerShell retrieval resolved this limitation. Parallel tasks remain isolated in other worktrees.
