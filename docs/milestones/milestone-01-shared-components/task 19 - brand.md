# Task 19 — Implement Brand

Status: `done`

## Objective

Implement Brand for the shared MyClinics visual system.

## Scope

Provide the dental mark, MyClinics name and optional Spanish description with complete and compact presentations. Define reusable icon asset handling, accessible naming and optional home-link behavior without hardcoded personal details.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 01 — Define and implement the Alexandria visual foundations](<task 01 - visual foundations.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test full/compact accessible identity, optional description and configured link destination. Show header-sized and compact specimens.
- Add or update the component's interactive examples in [/components](<task 00 - components showcase.md>), covering the variants and states in this task. Foundations must appear as specimens; the showcase task provides the initial screen itself.
- Include meaningful unit tests for the delivered public contract, semantics and interactions. No task is complete with screenshots alone, implementation-mirroring assertions or snapshots alone.
- Use `chrome-screenshots` for running catalogue evidence and `github-pr` for inline PR attachments. Inspect desktop (for example 1440 × 900) and mobile (for example 390 × 844); include a mobile capture whenever layout, wrapping, controls or interaction presentation differs, or explain why one image suffices. Include relevant focus/error/pending states and compare reference similarity, not just presence.
- Group each reusable component with its unit tests in src/lib/components/<component>. Keep page-specific specimens under src/app/components/<slug> and validate catalogue pages live rather than with unit tests; shared non-UI helpers belong in src/lib.
- Support Spanish labels, keyboard access, visible focus, readable contrast and narrow viewports. Keep generic UI free of authentication, persistence and clinic/calculation rules.

## Validation

Run the unit-test command established by Task 00 (once available), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build` for route, theme, font, dependency or production-build changes. Validate interactions in the running showcase as well as unit tests. Independently review code, behavior and visual evidence against [Alexandria](../../screens/alexandria/DESIGN.md), the [screen references](../../screens.md#visual-design-references), and applicable S01-S04 HTML/PNG files. Record command results and limitations, not assumed passes.

## Progress notes

Definition proposed in the Milestone 01 planning PR; implementation has not started. Human approval is pending merge. At execution, record branch/base, readiness, scoped references, tests, screenshots, review findings, correction rounds and implementation PR. Update this status and the milestone index together under the [tracking rules](../readme.md#task-structure-and-status).

## Execution context

- Readiness: ready. Task 01 and the catalogue infrastructure are done in the fetched develop baseline. Approved scope and acceptance criteria remain unchanged.
- Workspace: isolated managed worktree for Task 19; preserve parallel assignments and avoid shared development-server ports.
- Branch: `feature/shared-brand`; base: `0cbcfc968c97ca236b5e3afe858026449af9598a` (`origin/develop`, fetched at intake).
- References: `docs/requirements.md`, `docs/architecture.md`, `docs/screens.md`, Alexandria DESIGN.md, and S01-S04 HTML/PNG exports. Each export header uses the dentistry mark, MyClinics name and Spanish description.
- Relevant files: `src/app/globals.css`, `src/app/components/page.tsx`, route-local catalogue composition and existing shared components/tests. Add Brand and unit tests together under `src/lib/components/brand`, with specimens under `src/app/components/brand`.
- Verified stack: pnpm 11.25.0, Next 16.4.3, React 19.3.0, Tailwind v4/PostCSS and Vitest. Read installed Next guides before code changes; follow existing foundations and icon handling instead of introducing an icon framework.
- Constraints: Brand only; no production header or dependent components, authentication or personal details. Spanish interface, English documentation. Only one agent writes this checkout at a time.
- Validation: meaningful public-contract unit tests, lint, typecheck, format check, production build, live catalogue interactions, desktop/mobile and keyboard-focus inspection against the references, verified inline PR evidence through the required skills.
- Native implementer and reviewer roles are available in this session. Sequential implementation and independent review; no additional agents needed.
- Open questions: none. Hypotheses: none required at intake.
- Correction rounds used: 0.

## Implementation and independent review

- Implementation PR: [#28](https://github.com/manromero/my-clinics/pull/28). Agent implementation and independent review are complete; human acceptance and manual merge remain pending.
- Base: `0cbcfc968c97ca236b5e3afe858026449af9598a`; independently reviewed implementation head: `75c9ea7075fdf4b1388fa438f67c98ff0897b036`. Final administrative tracking changes must also be reviewed before delivery.
- Delivered full and compact Brand with a local decorative dental SVG, optional Spanish description, accessible identity, configured optional link, six semantic unit tests and interactive header/compact catalogue specimens.
- Implementer and independent reviewer each passed `pnpm test` (143 tests, 21 files), `pnpm lint` without warnings, `pnpm typecheck`, `pnpm format:check`, `pnpm build`, and `git diff --check`.
- Independent live review passed desktop 1440 x 900 and narrow 390 x 844 CSS viewports at DPR 1 without horizontal overflow, all three specimen controls, keyboard focus and Enter navigation. Code, functionality and visual comparison against Alexandria and S01-S04 passed.
- Three inline PR PNG attachments were independently retrieved as HTTP 200 image/png, opened and matched to originals by SHA-256. The PR preserves detailed evidence and source attribution.
- Limitations: narrow desktop CSS emulation without touch/device identity; screen-reader software and rendered GitHub PR page not tested. Saved Markdown and actual attachment image content were verified.
- Initial review: no blocking findings or optional suggestions. Correction rounds used: 0. Task/index marked done following the clean independent implementation review; final tracking verification remains part of delivery.
