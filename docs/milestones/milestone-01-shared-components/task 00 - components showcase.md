# Task 00 — Create the /components screen and unit-test infrastructure

Status: `done`

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

Planning merged in PR #5. Implementation assigned on 2026-10-29; human acceptance and manual merge of the implementation remain pending.

## Execution context

- Intake on 2026-10-29: planning was merged in PR #5; refreshed `origin/develop` is `86d0a34`. The working tree was clean at intake.
- Scope and acceptance criteria are ready. Assignment branch: `feature/components-showcase`; base: `86d0a344a7e1e11f932237e5dd571a931615ae33` from refreshed `origin/develop`.
- Session limitation: the available subagent dispatch interface does not expose native `implementer` or `reviewer` role selection. Reading their configuration files does not verify native loading. The user authorized delegation using the defined agents on 2026-10-29; pass each configuration explicitly to a separate subagent. Do not claim native role loading.
- Correction rounds used: 0. Initial independent review passed without blocking or optional findings.

## Delivery and validation

- Implementation PR: [#6](https://github.com/manromero/my-clinics/pull/6), targeting `develop`. Human acceptance and manual merge are pending.
- Implementation/evidence head reviewed independently: `041231ca425804732063b010d6557ec343ac67ce`, against base `86d0a344a7e1e11f932237e5dd571a931615ae33`. Application/capture source: `89c5de0664b680ddce0d992f999bba29f8d667a3`.
- Delivered `/components`: Spanish empty catalogue, stable section anchors, accessible headings and extensible route-local registration API. No later shared components or business behavior were introduced.
- Implementer and separate reviewer each passed `pnpm test` (3 tests), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build`, and `pnpm peers check`. Reviewer also passed `git diff --check`. Sandbox process restrictions required escalation; completed checks passed.
- Both agents performed live desktop (1440 × 900) and mobile (390 × 844) checks: direct route, fragment navigation, keyboard activation, destination focus, visible focus and no horizontal overflow. The reviewer additionally verified the skip link. They compared the result with Alexandria and the applicable S02 HTML/PNG reference; exact fonts/theme remain Task 01.
- [Visual evidence](../../evidence/components-showcase/README.md) records capture source, viewports, image dimensions and implementer attribution; durable screenshots appear inline in the PR.
- Independent review: no blocking findings, no optional suggestions, 0 correction rounds. Final tracking documentation is subject to corresponding format, link and consistency review before delivery.
