# Task 02 — Build the activity form and deletion confirmation

Status: `pending`

## Objective

Exercise creating, editing, and deleting an activity using synthetic data
before connecting the form to a database.

## Scope

- Use one form for creation and editing. Reuse shared date, decimal, select,
  mode, field feedback, and dialog or panel components where appropriate.
  Include an exact earnings preview and explicit Save and Cancel.
- Use the list's row controls to open editing and a confirmation that
  identifies the deletion target by date, clinic, and amount.
- Simulate successful and failed operations with fixtures. Keep changes local
  to the fixture session. Cover pending states and retry without changing the
  real Clinics screen.

## Dependencies

- Task 01.
- [S03 form and deletion behavior](../../screens.md#create-and-edit-activity)
  and [activity requirements](../../requirements.md#activity).

## Acceptance criteria

- The date, clinic, and signed price are required. Concept is optional.
  Percentage is the default mode; direct mode requires a separate signed
  amount and retains the original price. Both amounts accept zero and no
  more than two decimals. The preview uses exact arithmetic with signed
  half-up rounding: gross first, then net.
- For creation, reuse the most recently entered date within the selected
  month when available. Otherwise propose today for the current Madrid month
  and leave the date blank for other months. A new row must fall in the
  selected month; an edit can move it. An active clinic filter can prefill
  the form; an inactive one cannot.
- Editing loads the row's saved rates and allows keeping its inactive clinic.
  Only active clinics can be assigned. A clinic change updates the preview
  percentage, preserving the stored IRPF, selected mode, and direct amount
  unless the user explicitly edits the mode or amount.
- Cancel does not modify fixtures. On a failed save the draft stays
  available; on a failed deletion the row stays visible. Pending operations
  block duplicates. Dialogs have usable keyboard focus and return focus to
  an appropriate control after closing, including when a row disappears.

## Validation

Run the application checks and build. Test meaningful date and rounding
boundaries, including negative half-cents. Exercise both modes, invalid
inputs, inactive clinic rules, pending and failure states, and cancel/confirm
on desktop and mobile; capture the form and confirmation.

## Progress notes

Proposed; implementation has not started.
