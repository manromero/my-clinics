# Task 00 — FileInput and catalogue

Status: `done`

## Objective

Provide a generic accessible single-file control with native chooser and drag and
drop available simultaneously.

## Scope and exclusions

Add `src/lib/components/file-input` with meaningful component tests and a route-local
development catalogue specimen. Configure accepted types/maximum bytes; exclude
PDF parsing, clinic rules, uploads and Supabase. Reuse established control styling.

## Dependencies

Existing controls/catalogue; independent of other tasks. Follow
[architecture](../../architecture.md) and [milestone sources](readme.md#source-references).

## Acceptance criteria

- Associate label, required/optional status, help and error accessibly. Keyboard
  users choose, replace and remove with visible focus; the chooser works on mobile.
- Both methods use identical configured validation. Reject multiple-file drops
  clearly rather than silently choosing one; document retained-selection behavior
  on rejection. Show selected filename and replace/remove actions.
- Disabled/pending states block both methods; display drag-over feedback.
  Same-file reselection works after rejection/removal. Canceling the native chooser
  retains selection; valid reselection clears resolved errors.
- Keep persisted filename/current-file descriptors distinct from local `File`;
  never fabricate bytes from filenames. Consumers own saved/selected/removed state.
- Catalogue demonstrates empty, selected, persisted descriptor, required/optional,
  help/error, disabled/pending, drag and replacement/removal states. Domain rules
  remain outside FileInput.

## Validation

Run [application checks](readme.md#completion-and-validation) and meaningful shared
component tests. Validate catalogue live on desktop/mobile for chooser, cancellation,
same-file reselection, drop, multiple-file rejection, keyboard and focus. No specimen
unit tests. Use `chrome-screenshots` against Alexandria/existing controls and the
standard independent review/PR workflow when implementation is assigned.

## Progress notes

2026-11-26: The user assigned implementation of this task under the project
workflow. Human approval and manual merge remain pending.

2026-11-26: Implementation published in [draft PR #70](https://github.com/manromero/my-clinics/pull/70),
head `487eff7cb92115a03f0d416da1cea469197645c2`. Implementer and independent
reviewer passed lint, typecheck, production build and six shared-component tests.
Independent code, desktop/mobile interaction and visual review found no product
defects. Six inline captures were retrieved and verified by the coordinator.
Detailed evidence and review limitations are preserved in the PR.

Final validation and independent review at
`0c7c30463d7508e2dcdfc04a583e31c449154441` resolved both blockers:

- B01: fixed and independently verified. With explicit user authorization,
  formatted S02/S05 reference HTML using project Prettier 3.9.10 (matching the
  lockfile). `pnpm format:check` now passes globally. The original failure was
  independently reproduced from the base commit; its original cause is unknown.
- B02: verified through Chrome's actual headless chooser cancellation path under
  the user's headless-only constraint. Implementer and independent reviewer each
  observed trusted `click` and `cancel` events after native keyboard activation,
  with chooser interception and forced cancellation disabled. No empty-file
  assignment or synthetic cancel event was used. Local selections were retained;
  the reviewer also verified persisted-descriptor retention. The earlier empty
  completion probe was insufficient and is superseded by these browser-generated
  cancellation checks. A visible Windows dialog remains untested; no OS-dialog
  cancellation result is claimed.

All required checks pass: lint, typecheck, global format check, production build
and six meaningful shared-component tests. Independent desktop/mobile code,
functional and visual review found no defects or optional suggestions. Captures
use `chrome-screenshots`; detailed metadata, review history and limitations remain
in [PR #70](https://github.com/manromero/my-clinics/pull/70).

Correction rounds used: 2 of 2 (reference formatting, then headless cancellation
validation). No application fixes were required after initial implementation.
Ready for human review and manual merge after final tracking review; human
approval and merge remain pending. Mobile uses emulation and drops use browser
DataTransfer events; no physical-device or OS file-explorer test is claimed.

## Execution context

- Readiness: ready. The assignment approves task 00's existing scope and criteria;
  no database, authentication or invoice-domain changes are needed.
- Branch: `feature/file-input-catalogue`, from updated `develop` at
  `467bf538201edc79abfced63b05ebdfbbdf57835`. The initial checkout was clean.
- Relevant sources: this task, the milestone source references, architecture,
  shared interaction rules, Alexandria, existing TextInput/Field components and
  the development catalogue. S02 HTML duplicates S05; use existing controls for
  this generic component rather than inventing a clinic screen.
- Installed Next.js guide inspected:
  `node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`.
  Keep page composition on the server and browser interactions in client components.
- Verified tools: configured native implementer/reviewer roles are available in
  this session; Chrome is installed. pnpm 11.25.0 and GitHub authentication work
  with permitted elevated execution; restricted execution initially failed network
  access. Git fetch succeeded and local/remote develop matched.
- Validation: lint, typecheck, format check, production build, meaningful shared
  component tests, independent desktop/mobile interaction and visual checks.
  Use chrome-screenshots and github-pr for evidence and publication. This public
  development catalogue does not require a signed-in fixture.
- Technical choices: implementer must verify native file input/drop capabilities
  against primary documentation, document rejection retention, and keep local File
  state distinct from persisted descriptors. These do not add product scope.
- Open product questions: none. Correction rounds used: 2 of 2.
