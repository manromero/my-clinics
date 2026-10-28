# Task 00 — Create the /components screen and unit-test infrastructure

Status: `pending`

## Objective

Create the /components screen and unit-test infrastructure for the shared MyClinics visual system.

## Scope

Create a navigable catalogue with stable section anchors, Spanish labels, descriptions and examples. Start with a clearly identified empty catalogue; do not implement later components early. Keep the route and its local scaffolding under src/app/components; every reusable component developed in this milestone belongs directly in src/lib/components. Use synthetic examples only, with no patient records, credentials or dependency on authentication/data services. Catalogue sections must be easy to extend in later tasks.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

None within Milestone 01. This task deliberately bootstraps without later shared components.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Introduce a compatible unit-test runner, DOM environment, React Testing Library and user interaction support; expose a documented pnpm test command usable non-interactively. Test catalogue navigation, initial state and accessible headings. Document how to register a new example and capture evidence. Verify the route opens directly at desktop and mobile sizes.
- Add or update the component's interactive examples in [/components](<task 00 - components showcase.md>), covering the variants and states in this task. Foundations must appear as specimens; the showcase task provides the initial screen itself.
- Include meaningful unit tests for the delivered public contract, semantics and interactions. No task is complete with screenshots alone, implementation-mirroring assertions or snapshots alone.
- Capture graphical evidence from the running /components screen at desktop (for example 1440 x 900) and inspect mobile (for example 390 x 844). Include a mobile capture whenever layout, wrapping, controls or interaction presentation differs; if one capture suffices, explicitly record mobile inspection and why no separate image is needed. Label actual viewport, component/state, capturer and source commit. Capture focus/error/pending states when relevant.
- Display evidence inline in the implementation PR using durable attachments or commit-pinned image URLs, following the [workflow evidence contract](../../development-workflow.md#visual-pr-evidence). Refresh affected captures after corrections. Check references for similarity, not just presence.
- Keep all reusable components directly in src/lib/components, without subfolders. Route-only showcase scaffolding stays under src/app/components; shared non-UI helpers belong in src/lib.
- Support Spanish labels, keyboard access, visible focus, readable contrast and narrow viewports. Keep generic UI free of authentication, persistence and clinic/calculation rules.

## Validation

Run the unit-test command established by Task 00 (once available), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build` for route, theme, font, dependency or production-build changes. Validate interactions in the running showcase as well as unit tests. Independently review code, behavior and visual evidence against [Alexandria](../../screens/alexandria/DESIGN.md), the [screen references](../../screens.md#visual-design-references), and applicable S01-S04 HTML/PNG files. Record command results and limitations, not assumed passes.

## Progress notes

Definition proposed in the Milestone 01 planning PR; implementation has not started. Human approval is pending merge. At execution, record branch/base, readiness, scoped references, tests, screenshots, review findings, correction rounds and implementation PR. Update this status and the milestone index together under the [tracking rules](../readme.md#task-structure-and-status).
