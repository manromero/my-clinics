# Task 27 — Split the catalogue into dedicated pages

Status: `done`

## Objective

Move the existing visual catalogue into an index and dedicated foundations and component pages, as requested by the user on 2026-10-29.

## Scope

Reuse `/components` as the navigation index. Move existing foundations specimens to `/components/foundations` and Button specimens to `/components/button`. Establish the same dedicated-page convention for future components and update catalogue documentation and affected references.

## Exclusions

No new shared components, variants, business screens, or visual-system redesign. Do not implement pending milestone components.

## Dependencies

Tasks 00, 01 and 02 are implemented and merged into develop.

## Acceptance criteria

- The index links to separate foundations and Button pages without embedding their specimens.
- Each destination opens directly, identifies its content, and provides navigation back to the index.
- Preserve all existing specimens and interactive Button behavior.
- Spanish labels, accessible headings, keyboard navigation, visible focus and narrow layouts remain usable.
- Document how future components receive their own pages; keep route scaffolding local and shared components in `src/lib/components`.

## Validation

Run `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build`. Verify live navigation and desktop/mobile presentation on all three routes. Follow the workflow contract for independent review and inline GitHub PR screenshot attachments.

## Execution context

- Ready: user request defines the migration scope; no unresolved product decisions.
- Branch: `feature/components-pages`; refreshed develop base: `4c037f85f743e4890281ae98a08ed6bd6c680b25`. Clean checkout at intake.
- Sources: `src/app/components`, `docs/components-catalogue.md`, `docs/visual-foundations.md`, architecture, requirements, screens and Alexandria references.
- Existing catalogue embeds foundations and Button in three section groups. Preserve demonstrations while changing route composition; empty future groups may remain index scaffolding without invented pages.
- Read relevant installed Next.js guides before code changes. Native implementer and reviewer role selection is available in this session.
- Correction rounds used: 0.

## Progress notes

Delivered in [PR #10](https://github.com/manromero/my-clinics/pull/10). Index and dedicated foundations/Button routes preserve existing specimens and interactions. Implementer and independent reviewer passed all required checks (13 tests, lint, typecheck, formatting, build), documentation links and live desktop/mobile checks at 1440 × 1000 and 390 × 844. Reviewed implementation head: `d0bc14fef386d027de241ce73059f0b3a74eae59`. No blocking or optional findings; 0 correction rounds. Six inline PR screenshots were independently inspected and retrieved successfully by reviewer and coordinator. Detailed evidence remains in the PR. Final tracking changes receive documentation review. Human acceptance and manual merge remain pending.

## Documentation follow-up

The user approved simplifying documentation in the same PR and explicitly waived
implementer/reviewer subagents for this follow-up. Removed the separate Button
Markdown guide; usage guidance now lives in the component API comments alongside
the existing interactive catalogue examples. Kept concise catalogue registration
instructions and cross-cutting foundations decisions. Future components do not
require a separate Markdown guide by default. This follow-up changes documentation
and code comments only; the previous live visual evidence remains applicable.
Coordinator validation and direct user acceptance apply to this follow-up; it has
not received an additional independent agent review.

Follow-up validation: repository formatting and diff whitespace checks passed; all
seven local links and both referenced document anchors resolved. No references
to the removed guide remain. Application behavior and styles are unchanged.

## Folder organization follow-up

The user requested page-local specimens, one shared-component folder containing
implementation and tests, and no unit tests for catalogue pages/specimens. This
approved decision supersedes the original flat-folder and catalogue unit-test
requirements. Button and its tests now live under `src/lib/components/button`;
Button specimens live under `src/app/components/button`, and foundations/motion
specimens under `src/app/components/foundations`. Removed catalogue/specimen unit
tests while retaining reusable Button tests. Architecture, agent instructions and
milestone component-location guidance follow the new convention. Existing completed
task results remain historical records. The user-authorized direct follow-up path
continues without additional implementer/reviewer delegation. Validation passed: 6 reusable Button tests, lint, typecheck, formatting and production build. Live production checks verified index navigation, foundations motion replay and Button pending/completion after relocation. No rendering or style changes were introduced; earlier visual captures remain representative.

## Button pointer and hover follow-up

The user requested a pointer cursor for enabled buttons, the default cursor for
disabled buttons, and clearer hover color feedback. Enabled primary/destructive
buttons now darken to 90% brightness, secondary retains its tonal background shift,
and tertiary gains a subtle primary tint alongside its underline. All hover
feedback is enabled-only, uses the existing 150ms transition, and respects reduced
motion. Pending uses native disabled behavior and therefore the default cursor.

Coordinator validation passed: 6 Button tests, lint, typecheck, formatting and
production build. Live checks verified computed pointer/default cursors, real hover
on all four variants, absence of hover feedback while disabled/pending, simulation
completion, and no horizontal overflow at 390 × 844. Updated desktop (1440 × 1000)
and mobile (390 × 844) captures are recorded in PR #10; the earlier Button captures
are historical. This follows the user-authorized direct correction path without
additional subagent review. Human acceptance and manual merge remain pending.

## Component comment guidance follow-up

Removed Button's explanatory comment block, including its reference to the
temporary catalogue. The user clarified that catalogue pages will be removed
after the component milestone. Architecture now defines the lasting convention:
use readable code and types, comment only non-obvious reasoning or constraints,
and keep demonstration references out of reusable components. Catalogue guidance
and the milestone completion contract link to that single policy. This direct
follow-up changes comments/documentation only; no behavior or visual output changes.

Validation: repository formatting, diff whitespace and affected local links/anchor
passed. No catalogue references remain under src/lib/components. Application checks
were not repeated for comment/documentation-only changes; prior behavior checks
and visual evidence remain applicable. No additional subagent review was performed.
