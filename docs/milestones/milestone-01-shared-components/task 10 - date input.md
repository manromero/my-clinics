# Task 10 — Implement DateInput

Status: `done`

## Objective

Implement DateInput for the shared MyClinics visual system.

## Scope

Provide a labeled calendar-date input, required/optional, min/max, disabled, read-only and error states. Preserve a timezone-independent calendar-date value; separate storage value from browser-localized presentation. Do not implement activity date-prefill rules.

## Exclusions

No production business-screen implementation, persistence, authentication integration, domain calculations, domain-specific selectors, indicators, tables or reporting charts. Do not implement dependent tasks early.

## Dependencies

- [Task 07 — Implement field primitives](<task 07 - form field.md>) must be complete.

The [milestone acceptance contract](readme.md#completion-contract-for-every-task) also applies.

## Acceptance criteria

- Deliver the scope above with a documented, focused public API and examples of supported variants.
- Test date changes, empty and invalid input, bounds and unchanged calendar dates across timezone conversions in helpers if any. Inspect native picker usability on available desktop/mobile environments; disclose browser-native rendering differences.
- Add or update the component's interactive examples in [/components](<task 00 - components showcase.md>), covering the variants and states in this task. Foundations must appear as specimens; the showcase task provides the initial screen itself.
- Include meaningful unit tests for the delivered public contract, semantics and interactions. No task is complete with screenshots alone, implementation-mirroring assertions or snapshots alone.
- Capture graphical evidence from the running /components screen at desktop (for example 1440 x 900) and inspect mobile (for example 390 x 844). Include a mobile capture whenever layout, wrapping, controls or interaction presentation differs; if one capture suffices, explicitly record mobile inspection and why no separate image is needed. Label actual viewport, component/state, capturer and source commit. Capture focus/error/pending states when relevant.
- Display evidence inline in the implementation PR using verified GitHub attachments, following the [workflow evidence contract](../../development-workflow.md#visual-pr-evidence). Refresh affected captures after corrections. Check references for similarity, not just presence.
- Group each reusable component with its unit tests in src/lib/components/<component>. Keep page-specific specimens under src/app/components/<slug> and validate catalogue pages live rather than with unit tests; shared non-UI helpers belong in src/lib.
- Support Spanish labels, keyboard access, visible focus, readable contrast and narrow viewports. Keep generic UI free of authentication, persistence and clinic/calculation rules.

## Validation

Run the unit-test command established by Task 00 (once available), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build` for route, theme, font, dependency or production-build changes. Validate interactions in the running showcase as well as unit tests. Independently review code, behavior and visual evidence against [Alexandria](../../screens/alexandria/DESIGN.md), the [screen references](../../screens.md#visual-design-references), and applicable S01-S04 HTML/PNG files. Record command results and limitations, not assumed passes.

## Progress notes

Implemented and independently reviewed in [PR #18](https://github.com/manromero/my-clinics/pull/18). Ready for human acceptance and manual merge; both remain pending.

## Execution context

- Readiness: ready. Task 07 field primitives are done and merged through PR #14; TextInput and DecimalInput are also available as implementation references. Approved scope is unchanged.
- Branch: `feature/shared-date-input`; base: `176fa0f5449be86c348d83cd7090f05c72e437ba` (`origin/develop`, fetched at intake). Dedicated managed worktree isolates concurrent assignments.
- References: architecture, requirements (calendar-date storage and Spanish presentation), screens, Alexandria, and applicable S02/S03 HTML/PNG exports. Read installed Next.js guides before framework edits.
- Relevant files: field primitive folders, TextInput for established semantics and styles, `src/app/components/catalogue.tsx`, route-local catalogue specimens, theme tokens and Vitest setup.
- Verified: pnpm 11.25.0, Next 16.4.3, React 19.3.0; native implementer and reviewer roles are available in the active session. Calendar dates must remain date strings, independent of timezones. Native date controls are the initial technical approach; browser-localized presentation must remain separate from storage.
- Constraints: DateInput only, no date-prefill or business behavior. Preserve other assignments and worktrees; sequential single writer here. English documentation, Spanish examples, accessible field semantics, caller-owned validation policy.
- Validation: meaningful unit tests for date changes, empty/invalid input, native constraints and field semantics; lint, typecheck, formatting, production build, live desktop/mobile behavior and native picker inspection where available, design comparison, and verified inline GitHub screenshot attachments. Disclose differences and unavailable real-device environments.
- Open questions: none. Hypotheses: none required; implementer selects a focused API using repository conventions.
- Correction rounds used: 0.

## Implementation and independent review

- Implementation PR: [#18](https://github.com/manromero/my-clinics/pull/18), targeting `develop`. Reviewed base: `176fa0f5449be86c348d83cd7090f05c72e437ba`; implementation head: `4c1778395f88309769c8743b76b48efaac13a3ac`. Final tracking-only changes receive administrative re-review in the same PR.
- Delivered DateInput with string-only calendar-date values, native localized presentation and constraints, required/optional indication, help/error semantics, disabled/read-only states, refs/events and generated or caller IDs. Interactive examples live at `/components/date-input`; no business defaults or timezone conversions were added.
- Implementer and independent reviewer each passed `pnpm test` (87 tests / 12 files), `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build` and diff checks.
- Both independently inspected desktop (1440 x 900) and narrow (390 x 844) layouts and interactions. Reviewer verified required-empty errors, clearing, below-min retention, upper-bound recovery, error associations, focus, native-picker keyboard selection, disabled and read-only behavior. Narrow content width and scroll width both measured 375px. Alexandria and applicable S02/S03 HTML/PNG references were compared.
- PR contains desktop/mobile inline GitHub screenshot attachments with capture metadata. Implementer, reviewer and coordinator verified retrieval (HTTP 200, image/jpeg); reviewer verified source/attachment hashes match. Detailed evidence remains in the PR. Temporary implementation captures were removed after verification.
- Independent review: no blockers or optional findings. Correction rounds used: 0. Human acceptance and manual merge remain pending.
- Limitations: mobile inspection used a narrow desktop browser; real iOS/Android devices were unavailable. Native picker opening and keyboard selection were verified, but its floating popup is absent from tab captures. No timezone helper exists; conversion-helper tests are inapplicable.
