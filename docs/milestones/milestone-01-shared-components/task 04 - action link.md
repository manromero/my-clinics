# Task 04 — Implement ActionLink

Status: `done`

## Objective

Implement ActionLink for the shared MyClinics visual system.

## Scope

Provide text and button-like navigation with optional icons/arrows. Preserve link semantics, href, keyboard focus and external-link behavior where supplied; keep navigation distinct from mutation actions.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 01 — Define and implement the Alexandria visual foundations](<task 01 - visual foundations.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test rendered destinations, accessible names and keyboard reachability. Demonstrate text and button-like internal destinations without adding product routes.
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

- Readiness: ready; Tasks 00 and 01 are complete in the current develop baseline. Approved scope and criteria remain unchanged.
- Branch: `feature/shared-action-link`; base: `5db4a97b62b2102357cc26d07e9f88ac49687a3a` (`origin/develop`). Dedicated worktree isolates this task from parallel assignments.
- References: architecture, requirements, screens, Alexandria DESIGN.md, and applicable S01-S04 HTML/PNG exports; installed Next.js documentation must be read before framework edits.
- Relevant files: shared Button and IconButton components, semantic theme in `src/app/globals.css`, route-local catalogue shell and dedicated catalogue pages. Register ActionLink in the catalogue index and keep specimens under `src/app/components/action-link`.
- Verified: Next 16.4.3, React 19.3.0, Tailwind v4/PostCSS, pnpm 11.25.0 and Vitest infrastructure are established. Native implementer and reviewer roles are available in this session.
- Constraints: navigation semantics and supplied external-link attributes; text and button-like variants with optional icons; no production routes, mutation behavior, dependent components or unrelated parallel changes. Spanish UI and English documentation.
- Validation: meaningful unit tests, lint, typecheck, format:check, build, live desktop/mobile navigation and keyboard inspection, visual comparison and verified inline GitHub screenshot attachments. Use a distinct development port for this worktree.
- Open questions: none. Hypotheses: none required.
- Correction rounds used: 0. Sequential implementation and independent review; human acceptance and manual merge remain pending.

## Implementation and independent review

- Implementation PR: [#12](https://github.com/manromero/my-clinics/pull/12), targeting `develop`; human acceptance and manual merge remain pending.
- Reviewed base: `5db4a97b62b2102357cc26d07e9f88ac49687a3a`; implementation head: `4e6ab04c42f9382e8382875baf910176c474ba61`.
- Delivered text, primary and secondary navigation, optional decorative icons, preserved Next.js destinations, anchor attributes and refs, and a dedicated interactive catalogue page with Spanish labels.
- Implementer and independent reviewer each passed `pnpm test` (21 tests, including 6 ActionLink cases), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and `git diff --check`.
- Both independently checked live desktop 1440 x 900 and mobile 390 x 844: internal destinations, fragment navigation, external new tab, Tab focus and Enter activation pass. Long labels and icons wrap without horizontal overflow. Alexandria and applicable S01-S04 references were inspected.
- Desktop, mobile and keyboard-focus captures are displayed inline in the PR with viewport, capturer and source commit. Implementer, reviewer and coordinator verified saved attachment retrieval (HTTP 200 JPEG). Temporary captures were removed; no delivery screenshots were committed.
- Independent review found no blockers or optional suggestions. Correction rounds used: 0. The reviewer will recheck the final tracking commit; no application behavior changed after the reviewed implementation head.
- No known material limitations remain. Task/index are done for agent delivery; approval and manual merge are pending in GitHub.
