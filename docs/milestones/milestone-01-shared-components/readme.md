# Milestone 01 — Visual foundations and shared components

Planning approved through PR #5 merged into develop. Task 00 was accepted by the user and merged through PR #6; Task 01 is complete and ready for human acceptance in PR #8; other implementation tasks remain pending.

## Objective

Establish the Alexandria visual foundations, reusable basic controls and shared screen structure, with a living /components catalogue. This milestone prepares later application screens; it does not implement their business behavior.

## Approved planning request and boundaries

The user requested a first task for a components screen, a second task for foundations after evaluating Tailwind, and one task per basic/shared-structure component. Every implementation task requires showcase integration, unit tests and graphical evidence at desktop and mobile when there is a difference. Shared components are grouped with their tests in src/lib/components/<component>; specimens stay in their dedicated catalogue page folders. Catalogue pages and specimens are validated live rather than with unit tests.

Include the basic UI and shared screen structure identified during discovery. Exclude the previously proposed domain components: period/clinic selectors and shared filtering state, clinic identity, metric cards/grids, tables, financial/date display components, domain forms and charts. Google authentication, persistence, production routes and business calculations are outside this milestone. Do not add CSV/PDF export or legal pages merely because prototypes show them.

## Submilestones and task index

- Catalogue and test bootstrap: Task 00.
- Visual foundations: Task 01.
- Reusable basic controls and containers: Tasks 02-18.
- Shared screen structure: Tasks 19-26.

| Task                                                                                                  | Status    | Direct dependencies |
| ----------------------------------------------------------------------------------------------------- | --------- | ------------------- |
| [00 — Create the /components screen and unit-test infrastructure](<task 00 - components showcase.md>) | `done`    | —                   |
| [01 — Define and implement the Alexandria visual foundations](<task 01 - visual foundations.md>)      | `done`    | 00                  |
| [02 — Implement Button](<task 02 - button.md>)                                                        | `done`    | 01                  |
| [03 — Implement IconButton](<task 03 - icon button.md>)                                               | `done`    | 02                  |
| [04 — Implement ActionLink](<task 04 - action link.md>)                                               | `done`    | 01                  |
| [05 — Implement Surface / Card](<task 05 - surface.md>)                                               | `done`    | 01                  |
| [06 — Implement Badge](<task 06 - badge.md>)                                                          | `done`    | 01                  |
| [07 — Implement field primitives](<task 07 - form field.md>)                                          | `done`    | 01                  |
| [08 — Implement TextInput](<task 08 - text input.md>)                                                 | `done`    | 07                  |
| [09 — Implement DecimalInput](<task 09 - decimal input.md>)                                           | `done`    | 07                  |
| [10 — Implement DateInput](<task 10 - date input.md>)                                                 | `done`    | 07                  |
| [11 — Implement Select](<task 11 - select.md>)                                                        | `done`    | 07                  |
| [12 — Implement SegmentedControl](<task 12 - segmented control.md>)                                   | `done`    | 01                  |
| [13 — Implement Alert / StatusMessage](<task 13 - alert.md>)                                          | `done`    | 02                  |
| [14 — Implement LoadingState](<task 14 - loading state.md>)                                           | `done`    | 01                  |
| [15 — Implement EmptyState](<task 15 - empty state.md>)                                               | `done`    | 02, 04, 05          |
| [16 — Implement Dialog](<task 16 - dialog.md>)                                                        | `pending` | 02, 05              |
| [17 — Implement FormPanel](<task 17 - form panel.md>)                                                 | `pending` | 16, 07, 13          |
| [18 — Implement ConfirmDialog](<task 18 - confirm dialog.md>)                                         | `pending` | 16, 13              |
| [19 — Implement Brand](<task 19 - brand.md>)                                                          | `pending` | 01                  |
| [20 — Implement MainNavigation](<task 20 - main navigation.md>)                                       | `pending` | 04, 06              |
| [21 — Implement UserIdentity](<task 21 - user identity.md>)                                           | `pending` | 01                  |
| [22 — Implement UserMenu](<task 22 - user menu.md>)                                                   | `pending` | 03, 04, 13, 16, 21  |
| [23 — Implement PageContainer](<task 23 - page container.md>)                                         | `pending` | 01                  |
| [24 — Implement PageHeader](<task 24 - page header.md>)                                               | `pending` | 04, 06, 23          |
| [25 — Implement AppHeader](<task 25 - app header.md>)                                                 | `pending` | 19, 20, 21, 22, 23  |
| [26 — Implement AppFooter](<task 26 - app footer.md>)                                                 | `pending` | 04, 23              |

Dependencies are implementation prerequisites, not just suggested reading. Tasks 02-26 also transitively depend on Tasks 00 and 01. Numeric order is safe for sequential execution; independent tasks can be selected once their listed dependencies are complete. Task 00 must use minimal route-local scaffolding so it does not depend on the components it will later exhibit. Task 01 restyles that scaffolding and adds foundation specimens.

## Foundations approach

The repository already uses Tailwind CSS v4 through @tailwindcss/postcss and imports it in src/app/globals.css. Keep that setup and define a CSS-first semantic theme with @theme; use ordinary custom properties for non-utility values and @theme inline only for aliases that reference runtime font variables. Do not copy the prototype CDN script or Tailwind v3 JavaScript configuration. Avoid a second styling framework or a separate token source that can drift.

Semantic utilities should express surfaces, primary/tertiary actions, text, status and focus; components consume those tokens instead of repeating hex values. Define typography roles, concrete spacing/type/radius scales, restrained elevation and motion, plus responsive rules. Tailwind layout utilities remain useful; tokens do not require wrapping every utility in a React component. Task 01 records exact values and rationale, font loading and icon strategy before dependent controls are implemented.

Alexandria governs inconsistencies: Noto Serif headings, Inter body, Public Sans metadata; primary blue #094cb2, gold #6d5e00, light tonal layers and whitespace. Preserve the reference composition while correcting excess serif use, heavy shadows and inconsistent radii. No ordinary divider borders; document limited input/focus ghost-border exceptions. Maintain accessible contrast and focus.

Use native HTML controls where they meet the contract. No component library is preselected. Task 01 records whether focused accessible primitives are justified for complex controls, checking installed React/Next compatibility; any later Dialog dependency must be documented without replacing the visual system. No Storybook installation is needed for the requested in-app catalogue.

Primary sources: [Tailwind theme variables](https://tailwindcss.com/docs/theme) and [functions/directives](https://tailwindcss.com/docs/functions-and-directives). These support the proposed CSS-first approach; the project-specific organization follows [architecture](../../architecture.md).

## Completion contract for every task

- Follow the [component documentation guidance](../../architecture.md#component-documentation): avoid redundant code comments and references from reusable components to the temporary catalogue.
- Add or update the component's interactive examples in [/components](<task 00 - components showcase.md>), covering the variants and states in this task. Foundations must appear as specimens; the showcase task provides the initial screen itself.
- Include meaningful unit tests for the delivered public contract, semantics and interactions. No task is complete with screenshots alone, implementation-mirroring assertions or snapshots alone.
- Capture graphical evidence from the running /components screen at desktop (for example 1440 x 900) and inspect mobile (for example 390 x 844). Include a mobile capture whenever layout, wrapping, controls or interaction presentation differs; if one capture suffices, explicitly record mobile inspection and why no separate image is needed. Label actual viewport, component/state, capturer and source commit. Capture focus/error/pending states when relevant.
- Display evidence inline in the implementation PR using verified GitHub attachments, following the [workflow evidence contract](../../development-workflow.md#visual-pr-evidence). Refresh affected captures after corrections. Check references for similarity, not just presence.
- Group each reusable component with its unit tests in src/lib/components/<component>. Keep page-specific specimens under src/app/components/<slug> and validate catalogue pages live rather than with unit tests; shared non-UI helpers belong in src/lib.
- Support Spanish labels, keyboard access, visible focus, readable contrast and narrow viewports. Keep generic UI free of authentication, persistence and clinic/calculation rules.

- Follow the [development workflow](../../development-workflow.md) for implementation assignments, independent review, up to two correction rounds and human acceptance. Keep task/index status synchronized. A planning merge approves definitions, not completion of their implementation.
- Run task-specific unit tests and application checks specified in each file. Task 00 must install/configure the missing test infrastructure; later tasks reuse it. Prefer behavior/semantic assertions over class snapshots. CSS fidelity and responsiveness require rendered visual inspection alongside tests.
- Future UI PRs require live desktop and mobile review against Alexandria and relevant exports, even when a second mobile image is unnecessary. Record actual viewport, source commit, state and reviewer findings. Unavailable required checks or evidence prevent clean completion.

## Reference interpretation

Review [requirements](../../requirements.md), [screens](../../screens.md), [architecture](../../architecture.md) and [Alexandria](../../screens/alexandria/DESIGN.md). The screen document links all four HTML/PNG exports; inspect both formats for applicable controls. S01's PNG is cropped, so its HTML supplies missing composition details. S05 has no supplied export and will reuse this system later.

Screens are visual direction, not new requirements. Inactive clinics remain editable in future flows; state changes are saved through their forms. The future IRPF UI must support historical rates rather than a fixed 15% heading. Those rules inform extensible presentation without adding business logic here. Prototype legal/compliance text and sample identity must not become product configuration.

## Completion criteria

All 27 task files and index rows are done only after their implementation, unit tests, showcase examples, required checks and independent review pass. The catalogue demonstrates all delivered variants and applicable error/loading/empty states; the visual system remains similar to Alexandria and S01-S04 at desktop and mobile. Human acceptance and manual merge are tracked in each implementation PR.

## Planning delivery

This PR changes documentation only. No application code, dependencies or tests are implemented here; graphical evidence belongs to the future UI tasks. Validate these definitions through formatting, local links/anchors, dependency-cycle and scope/coverage checks. Task status remains pending until execution is assigned.

## Catalogue navigation follow-up

| Task                                                                            | Status | Direct dependencies |
| ------------------------------------------------------------------------------- | ------ | ------------------- |
| [27 — Split the catalogue into dedicated pages](<task 27 - catalogue pages.md>) | `done` | 00, 01, 02          |
