# Task 03 — Keep the interface visible during navigation

Status: `in_progress`

## Objective

Remove the blank flash reported when navigating between Clínicas, Actividad,
and Resumen with a valid session.

## Scope

- Reproduce the issue in a production build, trace when the interface goes
  blank, and implement the fix supported by the findings. Record the cause
  and the evidence for the chosen approach. Evaluate App Router layout and
  loading behavior where relevant.
- Keep the shared interface visible and stable throughout normal signed-in
  navigation. Preserve active-link, history, focus, and scroll behavior.
- Include browser back and forward in the investigation while preserving
  protection against restoring private content from an old session.
  Tab-return behavior and prefetch are covered by Tasks 04 and 05.

## Dependencies

- [Task 01](<task 01 - reorder signed-in navigation.md>).
- [Architecture](../../architecture.md) and the installed Next.js guides
  for [layouts](https://nextjs.org/docs/app/getting-started/layouts-and-pages)
  and [navigation](https://nextjs.org/docs/app/getting-started/linking-and-navigating).

## Acceptance criteria

- On desktop and mobile, navigating among the three screens in the same
  valid session has no blank document frame or visible header reset,
  including with a throttled connection. Loading, if needed, is confined
  to the changing content.
- The URL, active link, and displayed screen agree after navigation,
  including on back and forward. Existing filter-preserving links,
  keyboard navigation, and region-level retry behavior still work.
- Signed-out visits, sign-out, and restoration after sign-out or account
  change cannot reveal another session's private content.

## Validation

Run `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, and `pnpm build`.
Use a signed-in production build. Record comparable before-and-after video
or frame traces on desktop and mobile, including throttled navigation.
Check cold URLs, back and forward, and history after sign-out.
Collect [visual evidence](../../development-workflow.md#visual-pr-evidence).

## Execution context

- Task 01 is merged. The assignment branch is
  `feature/stabilize-signed-in-navigation`, based on updated `develop` at
  `8f2e293ff6e925fdb002c447fc6f8bf3d28f45d9`.
- Inspect the three route pages under `src/app`, the shared header and navigation
  under `src/lib/components`, and the session safeguards in `src/proxy.ts`,
  `src/lib/supabase`, and `src/app/auth`. See [screens](../../screens.md)
  for the existing navigation and visual references.
- Both dedicated synthetic fixtures passed the launcher and opened isolated
  Chrome DevTools sessions. Use the
  [local signed-in validation procedure](../../supabase.md#local-signed-in-validation).
- Identify the cause from the production baseline before changing behavior.
  Keep tab-return policy and prefetch changes in Tasks 04 and 05, respectively.
- Open investigation: whether navigation replaces the document, remounts the
  shared interface, or hides it while waiting for session or route work.
  Correction rounds used: 2 (round 2 in progress).

## Progress notes

Scope approved. Implementation assigned.

[Draft PR #65](https://github.com/manromero/my-clinics/pull/65) addresses a
production flash during monthly URL redirects by keeping the shared shell in an
App Router layout. Initial head `60dbc4312e71ad85adb8580d607c579dd9fcf344`
passed lint, typecheck, formatting, production build, 287 tests, and throttled
desktop and mobile navigation.

Initial independent review confirmed the navigation improvement and found one
blocking history race: a session response issued before an account change can
arrive after it and restore the old account's cached route. Correction round 1
must prevent that restoration while preserving navigation and scroll behavior.

Correction head `c70d486a0c11bf1cd6f7580a7985ea38bb84f694` keeps the
destination content hidden until a fresh, authorized server render arrives.
Implementation checks passed: lint, typecheck, formatting, production build,
287 tests, and the synthetic account change, throttled navigation, history
scroll, and region retry checks in Chrome. Updated screenshots are in the PR.

The assigned reviewer could not complete re-review of the correction: its
session was stopped by an automatic content filter, including on a retry limited
to ordinary application checks. The initial review does not cover the correction.
The task remains in progress and the PR remains a draft pending independent
verification.

The user authorized an independent replacement reviewer. The replacement
reviewed `2af0cddbd5345553f662ade15c53ba16ca87ded0`, verified the normal
throttled flows and confirmed that held responses keep cached destination
content hidden. The exact account-change timing has implementer evidence only.
The reviewer found a second blocker (HISTORY-02): after eight seconds, a valid
but delayed history response causes a full document reload and replaces the
header. Round 2 must keep waiting and recovery inside the route region.
