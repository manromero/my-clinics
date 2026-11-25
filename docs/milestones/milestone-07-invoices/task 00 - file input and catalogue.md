# Task 00 — FileInput and catalogue

Status: `pending`

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

Planning only; no implementation or validation started. Human acceptance of this
refined task is pending; no branch or execution results are assigned.
