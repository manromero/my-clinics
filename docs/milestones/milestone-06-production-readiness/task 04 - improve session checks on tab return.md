# Task 04 — Make session checks less disruptive on tab return

Status: `pending`

## Objective

Avoid replacing the whole interface with “Comprobando sesión…” when the user
returns to an app tab and their session is still valid.

## Scope

- Reproduce returning from another tab or app on desktop and mobile.
  Identify the events and conditions that trigger the disruptive check,
  including the distinction between a normal return and restoring a
  document from browser history. Implement and document the fix.
- Preserve a stable interface when revalidating a healthy session. If
  verification is needed before revealing private data, keep a stable shell
  and provide local feedback rather than replacing the entire screen.
- Preserve verified session and account isolation, including expiry,
  cross-tab sign-out, and account switches. Handle a failed check without
  implying that a session was verified. OAuth policy changes are out of scope.

## Dependencies

- [Task 03](<task 03 - stabilize signed-in navigation.md>).
- [Authentication requirements](../../requirements.md#access-and-devices),
  [S01 — Sign-in](../../screens.md#s01--sign-in), and the
  [Supabase guide](../../supabase.md).

## Acceptance criteria

- After switching away and returning with a valid session, the interface
  does not show a full-page session check. The user can continue on the same
  screen and scope, with filters and in-progress form input intact.
- A burst of overlapping return events does not cause duplicate concurrent
  checks or repeated visible flashes. A slow or failed check has an
  accessible recovery path when user action is needed.
- After session expiry, sign-out in another tab, or a change of account,
  private content from the prior session is not flashed or actionable on
  return or history restoration. The app recovers to the appropriate
  verified screen or to sign-in.

## Validation

Run `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build`.
Record before-and-after behavior on desktop and mobile in a signed-in
production build. Verify both browser tab and app switching, rapid returns,
slow and failed session checks, expiry, cross-tab sign-out, and account
switching with synthetic accounts. Collect
[visual evidence](../../development-workflow.md#visual-pr-evidence).

## Progress notes

Scope approved. Awaiting implementation assignment.
