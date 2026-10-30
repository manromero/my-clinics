# Task 07 — Implement field primitives

Status: `done`

## Objective

Implement small composable field primitives for the shared MyClinics visual system.

## Scope

Deliver FieldLabel, FieldRequirement, FieldHelp and FieldError as small presentation and semantic primitives. Replace the FormField render-function wrapper. Consumers explicitly compose these primitives with native controls and associate labels/descriptions through supplied IDs. Future input components own stable/generated IDs, native required status, aria-describedby and aria-invalid internally; do not implement those dependent tasks now. Keep validation policy outside the primitives.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 01 — Define and implement the Alexandria visual foundations](<task 01 - visual foundations.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test label activation and native attribute forwarding, required/optional indication, help/error semantics and composition with caller-owned IDs and invalid state. Demonstrate required, optional and interactive error compositions, including description removal without stale references. No render-function API or context layer is needed.
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

- Readiness: ready. Task 01 is done and available in the develop baseline. Approved scope and acceptance criteria remain unchanged.
- Branch: `feature/shared-form-field`; base: `96fc35d17d0417a60267824972efe66a1791664a` (`origin/develop`, fetched at intake). Dedicated isolated worktree for parallel assignments.
- References: `docs/architecture.md`, `docs/requirements.md`, `docs/screens.md`, `docs/screens/alexandria/DESIGN.md`, applicable S02/S03 HTML and PNG references, and installed Next.js documentation before framework changes.
- Relevant files: `src/lib/components/form-field/`, route-local `src/app/components/form-field/`, catalogue landing page, semantic tokens in `src/app/globals.css`, and existing Vitest setup.
- Verified: pnpm 11.25.0, Next 16.4.3, React 19.3.0; foundations and dedicated catalogue routes are present. Native implementer and reviewer roles are available in the active session.
- Constraints: FormField composition and accessibility only; no dependent input components or business screens. English documentation and Spanish specimens. Preserve other tasks and checkouts; only one writer in this worktree.
- Validation: meaningful component unit tests, lint, typecheck, format check, production build, live desktop/mobile interactions, design comparison, and verified inline GitHub PR screenshot attachments. Existing workflow history documents `gh pr edit --attach` support.
- Open questions: none. Hypotheses: none required; implementer selects a focused composition API compatible with future controls.
- Correction rounds used: 0.

## Implementation and independent review

- Implementation PR: [#14](https://github.com/manromero/my-clinics/pull/14), targeting `develop`. Human acceptance and manual merge remain pending.
- Base reviewed: `96fc35d17d0417a60267824972efe66a1791664a`; implementation head reviewed: `7e22bcf80e9abfdedafae37812f5a659ceec48d6`. Final tracking-only commit is included in the final administrative review recorded in the PR.
- Delivered a typed FormField composition API with stable/generated or caller-supplied IDs, label association, required/optional indication, help/error/external descriptions and invalid-state propagation. Validation remains caller-owned. Required, optional and interactive error specimens are available at `/components/form-field`.
- Implementer and independent reviewer each passed `pnpm test` (33 tests), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `git diff --check`.
- Both performed live desktop (1440 x 900) and mobile (390 x 844) checks: label focus, keyboard navigation, error removal/restoration, catalogue navigation and responsive wrapping without overflow. Visual review compared Alexandria and S02/S03 HTML/PNG references.
- Five inline GitHub screenshot attachments and detailed capture metadata are saved in the PR. Implementer, reviewer and coordinator verified retrieval (HTTP 200, image/png). Temporary implementation captures were removed after verification.
- Initial independent review: no blockers or optional findings. Correction rounds used: 0. Tracking-only final recheck is recorded in the PR before delivery.
- Tool limitation: visible browser tabs are unavailable in subagent threads; hidden in-app browser tabs supported the live interactions and captures. No required validation was omitted.

## Approved revision after initial delivery

- User approved replacing the FormField wrapper with FieldLabel, FieldRequirement, FieldHelp and FieldError, for composition inside future final inputs. The objective, scope and specific acceptance criterion above now reflect this decision; prior delivery records are historical and do not validate the revision.
- Reopened Task 07 and index to `in_progress`. Reuse existing branch/worktree and PR #14. Integrate fetched `origin/develop` at `006cb1c6463e27db86192f1fe17f3795df65d0ac`, including merged Badge PR #15; preserve both catalogue entries and task statuses when resolving conflicts. No force push or PR merge.
- Remove the unused wrapper/API, keep route-local specimens, colocate each primitive and tests under its own shared component folder. Keep the existing catalogue URL unless a change is necessary. Update dependency wording to refer to field primitives, without implementing future inputs.
- Readiness: ready. No unresolved product questions or new dependencies. Validation remains unit tests, lint, typecheck, format, build, live desktop/mobile interactions and renewed verified inline GitHub attachments.
- Reuse the original implementer and independent reviewer. Correction rounds used remain 0; this is a user-approved scope revision, not a reset of review history.

## Revised implementation and independent review

- Approved revision delivered in [PR #14](https://github.com/manromero/my-clinics/pull/14). Base: `006cb1c6463e27db86192f1fe17f3795df65d0ac`; reviewed implementation head: `7c9a816e143fc094e7819acdad7a7adcf5850e1a`. The wrapper delivery above is historical and superseded.
- Replaced FormField with independent FieldLabel, FieldRequirement, FieldHelp and FieldError components, each with colocated unit tests. Native props and refs are supported; route-local compositions explicitly own IDs, required/invalid state, descriptions and validation. Future input implementations remain outside this task.
- Merged current develop into the feature branch and resolved catalogue/index conflicts while preserving Badge, its catalogue entry and Task 06 completion. GitHub reports PR #14 mergeable without conflicts.
- Implementer and independent reviewer each passed tests (45 tests / 9 files), lint, typecheck, formatting, production build and diff checks. Reviewer also checked 81 local documentation links/anchors.
- Coordinator captured fresh desktop (1440 x 900) and mobile (390 x 844) evidence and verified interactions. Reviewer independently inspected current attachments against Alexandria and S02/S03 references. Five inline current GitHub PNG attachments are recorded in the PR and verified by implementer, coordinator and reviewer using existing GitHub authentication (HTTP 200); anonymous retrieval returns 404.
- Reviewer-directed live verification: the reviewer prescribed scenarios; the coordinator operated the browser because the reviewer runtime had no available browsers; the reviewer independently analyzed fresh screenshots and raw DOM observations. Label focus, Tab navigation, valid/error transitions, whitespace rejection, acceptance of zero, description cleanup and catalogue navigation passed. Mobile client/scroll widths were both 375px. Browser warning/error logs were empty.
- Independent review concluded no blockers or optional findings. Correction rounds used remain 0. Screen-reader announcement testing was not performed. Final tracking-only review is recorded in the PR before handoff; human acceptance and manual merge remain pending.
