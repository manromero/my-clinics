# Task 03 — Implement IconButton

Status: `in_progress`

## Objective

Implement IconButton for the shared MyClinics visual system.

## Scope

Provide compact icon-only actions with required accessible names, consistent touch targets, focus, disabled and pending states. Reuse Button behavior without leaking decorative icons into the accessible name.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 02 — Implement Button](<task 02 - button.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test naming, activation and disabled/pending behavior. Show edit, delete and navigation examples with Spanish names.
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

- Readiness: ready; Task 02 is done and merged, and the dedicated catalogue pages are available on updated develop.
- Branch: `feature/shared-icon-button`; base: `c965c6d3d29e9787676fba8c051d0be8aa73d43e` (updated origin/develop). The checkout was clean before assignment.
- Relevant sources: requirements, architecture, screens, Alexandria DESIGN.md, applicable S02-S04 HTML/PNG exports, visual-foundations.md and components-catalogue.md.
- Verified findings: Button provides four variants, three sizes, native safe button type, disabled/pending handling and decorative icon wrappers. Reuse its behavior; the catalogue now has dedicated route-local specimen folders. Use the existing inline SVG icon strategy.
- Constraints: IconButton only, with Spanish accessible names and examples; no ActionLink, domain behavior or dependent components. Keep documentation in English and reusable tests beside the component.
- Validation: pnpm test, pnpm lint, pnpm typecheck, pnpm format:check and pnpm build; live desktop/mobile keyboard, activation, disabled/pending, focus and responsive inspection against references. Capture temporary evidence outside the repository, attach inline to the PR and verify retrieval before cleanup.
- Native implementer and reviewer roles are exposed in the active session. Use separate sequential agents and only one writer at a time.
- Open questions: none. Hypotheses: none required. Correction rounds used: 0.

## Implementation and independent review

- Delivery state: blocked; implementation remains uncommitted on the prepared branch. No push or implementation PR was created. Task and index remain `in_progress`; human acceptance and manual merge are pending.
- Delivered working files: shared IconButton and eight unit cases, dedicated `/components/icon-button` specimens/page, catalogue index entry and catalogue guide update. IconButton composes Button with a required nonblank accessible label, decorative icons, variants, sizes and inherited native disabled/pending behavior. Examples include Spanish edit, delete and pagination actions.
- Validation: targeted Prettier formatting passed. `pnpm test` failed before executing tests with sandbox `EPERM` on project realpath. Two escalation requests returned no results while pending and were interrupted. Tests, lint, typecheck, full format check and build remain unverified; no application check failure is inferred from the access error.
- Browser limitation: the implementer attempted the integrated browser, which reported local browser use disabled in Work settings. Native browser inspection, live desktop/mobile interactions, screenshots and verified GitHub attachments were not performed.
- Independent reviewer examined the uncommitted implementation against base/HEAD `c965c6d3d29e9787676fba8c051d0be8aa73d43e`. Bounded static review found no concrete code defect; tracked `git diff --check` passed. This does not validate a new committed head or untracked-file formatting.
- Open blocker IB-R01: required automated validation missing. Resolve by successfully running `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm format:check` and `pnpm build` against the delivery head and recording results.
- Open blocker IB-R02: live functional and visual validation missing. Resolve through desktop/mobile interaction and visual checks against Alexandria/Stitch, focus/pending captures with viewport/source metadata, and verified inline GitHub PR attachments.
- Correction rounds used: 0. Optional findings: none. Resume with the same implementer/reviewer after execution access is available; preserve existing working files. Complete checks, publication, evidence and independent review before marking done.

## Resumed validation and draft delivery

- Implementation PR: [#11](https://github.com/manromero/my-clinics/pull/11), draft targeting `develop`. Application head: `de7b7a181c733e9198aef1f9367cbdedcdf0cf11`; base: `c965c6d3d29e9787676fba8c051d0be8aa73d43e`. Earlier uncommitted-state notes above describe the initial blocked attempt.
- Automated execution access is now available. Implementer passed `pnpm test` (14 tests in two files, including eight IconButton cases), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `git diff --check` against the committed implementation. IB-R01 has passing implementation evidence, pending independent verification.
- User requested the integrated browser exclusively. Fresh attempts, including after resetting the control session, returned `Browser is not available: iab`. No further Chrome use is authorized or planned. Live interactions, desktop/mobile comparison, captures and verified inline GitHub attachments remain missing; IB-R02 remains open.
- Task and milestone index remain `in_progress`; PR is blocked for visual/functional validation. Human acceptance and manual merge are pending. Correction rounds used: 0. Independent review of the committed implementation and updated tracking follows.
