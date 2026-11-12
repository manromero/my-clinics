# Task 05 — Connect activity creation

Status: `pending`

## Objective

Complete the first persisted user flow: open the form, save an activity, and
see it reflected in the correct monthly list and totals.

## Scope

- Connect creation to the session-verified server write path. Validate the
  create date against the selected period and treat clinic eligibility and
  rate snapshots at save time as authoritative. Do not send preview amounts
  or rates as trusted inputs.
- Obtain the date suggestion from the owner's most recently created surviving
  row dated in the selected month, independent of the clinic filter or row
  page. Use creation order, not the greatest activity date. If there is no
  such row, use the Madrid today/blank behavior from Task 02.
- Refresh the live view after a confirmed write. Keep the current filter
  and explain when a saved row belongs to another clinic scope. Keep draft
  values on failure and provide feedback for retry.

## Dependencies

- Task 04, the form from Task 02, and the trusted write path from Task 03.

## Acceptance criteria

- An owner can save a percentage-based or direct entry, including negative
  and zero inputs. List and totals use the saved values; reload and a second
  session show the same entry. If a rate changed while the form was open,
  the result reflects the authoritative saved values.
- Suggested dates use recent successful entries in the selected month and
  work across reloads. The first entry in a different month has no default
  date; an out-of-month create request is rejected.
- Inactive, foreign, and missing clinics cannot be used for creation. A
  clinic deactivated after opening the form produces a recoverable failure.
  Cancel and rejected writes leave the saved list unchanged. Pending
  submission prevents duplicate activation of Save.

## Validation

Run application checks and build. Verify both modes, repeat entry, save and
retry, scope refresh, and real session persistence in the approved synthetic
environment on desktop and mobile.

## Progress notes

Proposed; implementation has not started.
