# Task 05 — Implement Surface / Card

Status: `done`

## Objective

Implement Surface / Card for the shared MyClinics visual system.

## Scope

Provide white, tonal and highlighted blue containers with responsive padding and composable header/content/actions areas. Use spacing and tonal boundaries rather than strong borders or shadows; preserve appropriate caller-selected semantics.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 01 — Define and implement the Alexandria visual foundations](<task 01 - visual foundations.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test content/slot composition and semantic element selection. Show neutral, tonal and highlighted examples and long content wrapping.
- Add or update the component's interactive examples in [/components](<task 00 - components showcase.md>), covering the variants and states in this task. Foundations must appear as specimens; the showcase task provides the initial screen itself.
- Include meaningful unit tests for the delivered public contract, semantics and interactions. No task is complete with screenshots alone, implementation-mirroring assertions or snapshots alone.
- Capture graphical evidence from the running /components screen at desktop (for example 1440 x 900) and inspect mobile (for example 390 x 844). Include a mobile capture whenever layout, wrapping, controls or interaction presentation differs; if one capture suffices, explicitly record mobile inspection and why no separate image is needed. Label actual viewport, component/state, capturer and source commit. Capture focus/error/pending states when relevant.
- Display evidence inline in the implementation PR using verified GitHub attachments, following the [workflow evidence contract](../../development-workflow.md#visual-pr-evidence). Refresh affected captures after corrections. Check references for similarity, not just presence.
- Group each reusable component with its unit tests in src/lib/components/<component>. Keep page-specific specimens under src/app/components/<slug> and validate catalogue pages live rather than with unit tests; shared non-UI helpers belong in src/lib.
- Support Spanish labels, keyboard access, visible focus, readable contrast and narrow viewports. Keep generic UI free of authentication, persistence and clinic/calculation rules.

## Validation

Run the unit-test command established by Task 00 (once available), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build` for route, theme, font, dependency or production-build changes. Validate interactions in the running showcase as well as unit tests. Independently review code, behavior and visual evidence against [Alexandria](../../screens/alexandria/DESIGN.md), the [screen references](../../screens.md#visual-design-references), and applicable S01-S04 HTML/PNG files. Record command results and limitations, not assumed passes.

## Progress notes

Implemented in [PR #13](https://github.com/manromero/my-clinics/pull/13). Required validation and independent review passed. Agent work is complete; human approval and manual merge remain pending.

## Execution context

- Readiness: ready. Task 01 is done on the fetched develop baseline; approved scope and criteria remain unchanged.
- Branch: `feature/shared-surface`; base: `5db4a97b62b2102357cc26d07e9f88ac49687a3a` (`origin/develop`). Dedicated worktree isolates parallel assignments.
- Relevant files: `src/lib/components/surface`, route-local `src/app/components/surface`, catalogue index, existing theme tokens in `src/app/globals.css` and Vitest infrastructure.
- Sources: project architecture, requirements, screens, Alexandria DESIGN.md and applicable S01-S04 HTML/PNG references; installed Next.js documentation before framework edits.
- Verified: Next 16.4.3, React 19.3.0, Tailwind v4/PostCSS, pnpm 11.25.0. Existing catalogue has dedicated component pages. Native implementer and reviewer roles are available in the session.
- Constraints: Surface only; white, tonal and highlighted blue variants, responsive padding, composable header/content/actions and caller-selected semantics. English documentation and Spanish specimens. Preserve unrelated work and do not implement dependent tasks.
- Validation: meaningful composition/semantics unit tests, lint, typecheck, format check, production build, live desktop/mobile checks and verified inline GitHub screenshot attachments. Capture outside the repository. Use an independent dev-server port for this worktree.
- Open questions: none. Hypotheses: none required at intake.
- Correction rounds used: 0. Implementation and independent review completed without blockers.

## Implementation and independent review

- Implementation PR: [#13](https://github.com/manromero/my-clinics/pull/13), targeting `develop`; human acceptance and manual merge pending.
- Reviewed base: `5db4a97b62b2102357cc26d07e9f88ac49687a3a`; implementation head: `521d899c6a23ef9d70222ab19fce03b1c5328a20`. Final tracking changes receive a separate administrative recheck in the same PR.
- Delivered a typed Surface API with white, tonal and highlighted variants, optional header/content/actions composition, caller-selected semantic elements, responsive padding and inherited contrast/focus treatment. Spanish interactive examples are available at `/components/surface`.
- Implementer and independent reviewer each passed `pnpm test` (23 tests), `pnpm lint`, `pnpm typecheck`, `pnpm format:check` and `pnpm build`.
- Both independently inspected desktop 1440 x 900 and mobile 390 x 844: long unbroken text wraps without horizontal overflow; actions wrap on mobile; keyboard activation, focus, catalogue navigation and padding work. Reviewer verified relevant text contrast above 4.5:1 and similarity against Alexandria and S02/S04 references.
- Implementer captured desktop/mobile evidence; reviewer performed separate live interactions and visual inspection. Inline GitHub attachments in the PR were independently retrieved successfully by coordinator and reviewer. Detailed capture metadata and evidence remain in the PR. Temporary implementation captures were removed.
- Initial independent review: passed with no blocking or optional findings. Browser access initially failed during review and recovered; all required live checks completed. No unresolved validation limitations.
- Correction rounds used: 0. Task/index are done; human approval and manual merge remain pending.
