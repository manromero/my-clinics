# Task 11 — Implement Select

Status: `done`

## Objective

Implement Select for the shared MyClinics visual system.

## Scope

Provide an accessible labeled single-selection control with placeholder, options, optional groups, disabled options/control and invalid state. Prefer native semantics unless reference fidelity requires a documented accessible alternative.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 07 — Implement field primitives](<task 07 - form field.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test selection, keyboard behavior, placeholder, disabled options and help/error associations. Show short/long labels and empty options.
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

- Readiness: ready. Task 07 field primitives and Tasks 00/01 are complete in the fetched develop baseline. Approved scope and criteria remain unchanged.
- Branch: `feature/shared-select`; base: `10304dedea0e25ea75c8cd03bf09cee65892144e` (`origin/develop`). Dedicated managed worktree isolates this assignment from parallel tasks.
- Relevant files: new `src/lib/components/select/` and route-local `src/app/components/select/`, catalogue index, existing field primitives, TextInput/DateInput conventions, theme tokens and Vitest setup.
- Sources: architecture, requirements, screens, Alexandria, applicable S03/S04 select HTML and PNG references, and installed Next.js guides before framework edits.
- Verified: Task 07 now provides FieldLabel, FieldRequirement, FieldHelp and FieldError. Final controls own stable/generated IDs, native required state, descriptions and invalid state internally. Prefer a native single-select and reuse those primitives. No new dependency is expected.
- Constraints: generic single selection only; no domain selectors or production business screens. Preserve other worktrees and changes. One writer at a time here. Native implementer and reviewer roles are available in this session.
- Validation: meaningful component unit tests; pnpm test, lint, typecheck, format:check and build; live desktop/mobile keyboard and selection checks; reference comparison; verified inline GitHub PR attachments captured outside the repository.
- Open questions: none. Hypotheses: none needed; implementer chooses a focused native-compatible API aligned with existing controls.
- Correction rounds used: 0.

## Implementation and independent review

- Implementation PR: [#19](https://github.com/manromero/my-clinics/pull/19), targeting develop. Human approval and manual merge remain pending.
- Base reviewed: `10304dedea0e25ea75c8cd03bf09cee65892144e`; implementation head reviewed: `5aa90c3a2b237c3b46dee5a497b794efaf1ae758`.
- Delivered native accessible Select with options/groups, placeholder, controlled/uncontrolled values, disabled states, invalid/help/error associations, stable IDs and native attributes/events/ref. Spanish interactive specimens and catalogue entry are available at `/components/select`.
- Implementer and independent reviewer each passed tests (92 tests / 13 files), lint, typecheck, formatting and production build. Independent code, functionality and visual review found no blockers or optional suggestions. Correction rounds used: 0.
- Coordinator and reviewer independently checked desktop (1440 x 900) and mobile (390 x 844): required error, arrow selection skipping disabled options, description cleanup, reset, groups, keyboard focus traversal and no horizontal overflow. Coordinator also verified typeahead. Browser warning/error logs were empty.
- Three inline GitHub screenshot attachments with capture metadata are saved in the PR. All roles independently verified retrieval with existing GitHub authentication; anonymous HEAD returned 403. Reviewer compared captures and live results against Alexandria and S03/S04 references. Temporary captures were removed after verification.
- Limitations: native popup appearance and detailed keyboard behavior depend on browser/device; screen-reader announcement testing was not performed. Required validation is complete.
- Publication authorization: the user explicitly authorized uploading the final tracking commit. Task and index are now done; final tracking review is recorded in the PR. Human approval and manual merge remain pending.
